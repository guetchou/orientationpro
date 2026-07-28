#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

REPO_DIR=${REPO_DIR:-/opt/orientationpro}
COMPOSE_FILE=${COMPOSE_FILE:-/opt/orientationpro/.vps/docker-compose.yml}
ENV_FILE=${ENV_FILE:-/opt/orientationpro/.env.vps}
PROJECT_NAME=${PROJECT_NAME:-orientationpro_riasec}
VALIDATION_ROOT=${VALIDATION_ROOT:-/opt/validation}
EXPECTED_MAIN_SHA=${EXPECTED_MAIN_SHA:?EXPECTED_MAIN_SHA is required}

for command in docker git gzip sha256sum tar openssl; do
  command -v "${command}" >/dev/null 2>&1 || {
    printf 'Missing required command: %s\n' "${command}" >&2
    exit 1
  }
done

[[ -d "${REPO_DIR}/.git" ]] || {
  printf 'Repository not found: %s\n' "${REPO_DIR}" >&2
  exit 1
}
[[ -f "${COMPOSE_FILE}" ]] || {
  printf 'Compose file not found: %s\n' "${COMPOSE_FILE}" >&2
  exit 1
}
[[ -f "${ENV_FILE}" ]] || {
  printf 'Environment file not found: %s\n' "${ENV_FILE}" >&2
  exit 1
}

cd "${REPO_DIR}"
git fetch --quiet origin main
REMOTE_MAIN_SHA=$(git rev-parse origin/main)

if [[ "${REMOTE_MAIN_SHA}" != "${EXPECTED_MAIN_SHA}" ]]; then
  printf 'Refusing preflight: origin/main is %s, expected %s\n' \
    "${REMOTE_MAIN_SHA}" \
    "${EXPECTED_MAIN_SHA}" >&2
  exit 1
fi

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
SHORT_SHA=${REMOTE_MAIN_SHA:0:12}
ARTIFACT_DIR="${VALIDATION_ROOT}/cv-release-preflight-${STAMP}"
SOURCE_DIR="${ARTIFACT_DIR}/source"
LOG_FILE="${ARTIFACT_DIR}/preflight.log"
DUMP_FILE="${ARTIFACT_DIR}/production-clone-source.sql.gz"
DUMP_SHA_FILE="${DUMP_FILE}.sha256"
RUNTIME_BEFORE="${ARTIFACT_DIR}/runtime-before.tsv"
RUNTIME_AFTER="${ARTIFACT_DIR}/runtime-after.tsv"
MIGRATION_REPORT="${ARTIFACT_DIR}/migration-cycle.json"
RESULT_FILE="${ARTIFACT_DIR}/result.txt"

mkdir -p "${ARTIFACT_DIR}" "${SOURCE_DIR}"
chmod 700 "${ARTIFACT_DIR}"
exec > >(tee "${LOG_FILE}") 2>&1

COMPOSE=(
  docker compose
  --project-name "${PROJECT_NAME}"
  --env-file "${ENV_FILE}"
  -f "${COMPOSE_FILE}"
)

NETWORK_NAME="makoki-preflight-${SHORT_SHA}-${RANDOM}"
CLONE_NAME="makoki-mysql-clone-${SHORT_SHA}-${RANDOM}"
API_NAME="makoki-api-preflight-${SHORT_SHA}-${RANDOM}"
WEB_NAME="makoki-web-preflight-${SHORT_SHA}-${RANDOM}"
CLONE_DATABASE="orientationpro_clone_${SHORT_SHA//-/_}"
CLONE_PASSWORD=$(openssl rand -hex 24)
API_IMAGE="makoki-api-preflight:${SHORT_SHA}"
WEB_IMAGE="makoki-web-preflight:${SHORT_SHA}"

cleanup() {
  set +e
  docker rm -f \
    "${API_NAME}" \
    "${WEB_NAME}" \
    "${CLONE_NAME}" \
    >/dev/null 2>&1
  docker network rm "${NETWORK_NAME}" >/dev/null 2>&1
  docker image rm "${API_IMAGE}" "${WEB_IMAGE}" >/dev/null 2>&1
  rm -rf "${SOURCE_DIR}"
}
trap cleanup EXIT

snapshot_runtime() {
  local output=$1
  : >"${output}"

  for service in db api web; do
    local container_id
    container_id=$("${COMPOSE[@]}" ps -q "${service}")

    [[ -n "${container_id}" ]] || {
      printf 'Production service is not running: %s\n' "${service}" >&2
      exit 1
    }

    docker inspect \
      --format "${service}\t{{.Id}}\t{{.Image}}\t{{.RestartCount}}\t{{.State.Status}}" \
      "${container_id}" \
      >>"${output}"
  done
}

printf '=== Release preflight ===\n'
printf 'origin/main: %s\n' "${REMOTE_MAIN_SHA}"
printf 'artifacts: %s\n' "${ARTIFACT_DIR}"
printf 'production services:\n'
"${COMPOSE[@]}" config --services
printf 'production images:\n'
"${COMPOSE[@]}" config --images
"${COMPOSE[@]}" ps

snapshot_runtime "${RUNTIME_BEFORE}"

printf '=== Transactional production dump ===\n'
"${COMPOSE[@]}" exec -T db sh -lc '
  set -eu
  : "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"
  : "${MYSQL_DATABASE:?MYSQL_DATABASE is required}"
  exec mysqldump \
    --user=root \
    --password="${MYSQL_ROOT_PASSWORD}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --no-tablespaces \
    --set-gtid-purged=OFF \
    --default-character-set=utf8mb4 \
    "${MYSQL_DATABASE}"
' | gzip -1 >"${DUMP_FILE}"

gzip -t "${DUMP_FILE}"
sha256sum "${DUMP_FILE}" | tee "${DUMP_SHA_FILE}"
chmod 600 "${DUMP_FILE}" "${DUMP_SHA_FILE}"

printf '=== Detached source archive ===\n'
git archive "${REMOTE_MAIN_SHA}" | tar -x -C "${SOURCE_DIR}"

printf '=== Reproducible image builds outside production services ===\n'
docker build \
  --pull \
  --tag "${API_IMAGE}" \
  "${SOURCE_DIR}/backend"

docker build \
  --pull \
  --tag "${WEB_IMAGE}" \
  --build-arg VITE_BACKEND_URL=https://example.invalid \
  --build-arg VITE_API_URL=https://example.invalid/api \
  "${SOURCE_DIR}"

{
  printf 'image\tid\tsize\n'
  for image in "${API_IMAGE}" "${WEB_IMAGE}"; do
    docker image inspect \
      --format "${image}\t{{.Id}}\t{{.Size}}" \
      "${image}"
  done
} | tee "${ARTIFACT_DIR}/preflight-images.tsv"

printf '=== Isolated MySQL clone restore ===\n'
docker network create "${NETWORK_NAME}" >/dev/null

docker run -d \
  --name "${CLONE_NAME}" \
  --network "${NETWORK_NAME}" \
  --tmpfs /var/lib/mysql:rw,nosuid,nodev,noexec,size=2g \
  -e MYSQL_ROOT_PASSWORD="${CLONE_PASSWORD}" \
  -e MYSQL_DATABASE="${CLONE_DATABASE}" \
  mysql:8.0 \
  >/dev/null

for _ in $(seq 1 60); do
  if docker exec "${CLONE_NAME}" \
    mysqladmin ping \
      --host=127.0.0.1 \
      --user=root \
      --password="${CLONE_PASSWORD}" \
      --silent; then
    break
  fi
  sleep 2
done

docker exec "${CLONE_NAME}" \
  mysqladmin ping \
    --host=127.0.0.1 \
    --user=root \
    --password="${CLONE_PASSWORD}" \
    --silent

gzip -dc "${DUMP_FILE}" | docker exec -i "${CLONE_NAME}" \
  mysql \
    --user=root \
    --password="${CLONE_PASSWORD}" \
    "${CLONE_DATABASE}"

printf '=== Migration 005 up/down/up on clone ===\n'
docker run --rm \
  --network "${NETWORK_NAME}" \
  -e DB_HOST="${CLONE_NAME}" \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD="${CLONE_PASSWORD}" \
  -e DB_NAME="${CLONE_DATABASE}" \
  -e RELEASE_PREFLIGHT_CONFIRM_CLONE=true \
  "${API_IMAGE}" \
  node scripts/verify-cv-migration-cycle.js \
  | tee "${MIGRATION_REPORT}"

printf '=== API image smoke with CV V1 disabled ===\n'
docker run -d \
  --name "${API_NAME}" \
  --network "${NETWORK_NAME}" \
  -e PORT=3000 \
  -e NODE_ENV=test \
  -e LEGACY_AUTH_ENABLED=false \
  -e AUTH_V1_ENABLED=false \
  -e RIASEC_API_ENABLED=false \
  -e CAREER_API_ENABLED=false \
  -e CV_API_V1_ENABLED=false \
  -e DB_HOST="${CLONE_NAME}" \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD="${CLONE_PASSWORD}" \
  -e DB_NAME="${CLONE_DATABASE}" \
  "${API_IMAGE}" \
  >/dev/null

cat >"${ARTIFACT_DIR}/probe-api.js" <<'NODE'
'use strict';

const analysisId = '11111111-1111-4111-8111-111111111111';
const routes = [
  ['POST', '/api/v1/cv/analyses'],
  ['GET', '/api/v1/cv/analyses'],
  ['GET', `/api/v1/cv/analyses/${analysisId}`],
  ['GET', `/api/v1/cv/analyses/${analysisId}/report.pdf`],
  ['DELETE', `/api/v1/cv/analyses/${analysisId}`],
];

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://api-preflight:3000/api/test/health');
      if (response.ok) return;
    } catch {
      // The container may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('API preflight health check timed out.');
};

const main = async () => {
  await waitForHealth();

  for (const [method, route] of routes) {
    const response = await fetch(`http://api-preflight:3000${route}`, {
      method,
    });
    if (response.status !== 404) {
      throw new Error(`${method} ${route} returned ${response.status}`);
    }
  }
};

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
NODE

docker network connect \
  --alias api-preflight \
  "${NETWORK_NAME}" \
  "${API_NAME}" \
  >/dev/null 2>&1 || true

docker run --rm \
  --network "${NETWORK_NAME}" \
  -v "${ARTIFACT_DIR}/probe-api.js:/tmp/probe-api.js:ro" \
  "${API_IMAGE}" \
  node /tmp/probe-api.js

printf '=== Web image smoke ===\n'
docker run -d \
  --name "${WEB_NAME}" \
  --network "${NETWORK_NAME}" \
  --network-alias web-preflight \
  "${WEB_IMAGE}" \
  >/dev/null

docker run --rm \
  --network "${NETWORK_NAME}" \
  "${API_IMAGE}" \
  node -e "fetch('http://web-preflight/').then(async (response) => { const body = await response.text(); if (!response.ok || !/<!doctype html/i.test(body)) process.exit(1); }).catch(() => process.exit(1));"

snapshot_runtime "${RUNTIME_AFTER}"
cmp "${RUNTIME_BEFORE}" "${RUNTIME_AFTER}"

cat >"${RESULT_FILE}" <<EOF
status=GREEN
main_sha=${REMOTE_MAIN_SHA}
production_runtime_unchanged=true
production_migration_applied=false
cv_api_v1_activated=false
clone_migration_cycle=up-down-up
production_dump=${DUMP_FILE}
production_dump_sha256_file=${DUMP_SHA_FILE}
api_image_build=success
web_image_build=success
api_flag_disabled_smoke=success
web_smoke=success
EOF

cat "${RESULT_FILE}"
printf 'Preflight completed. Sensitive artifacts remain protected in %s\n' \
  "${ARTIFACT_DIR}"
