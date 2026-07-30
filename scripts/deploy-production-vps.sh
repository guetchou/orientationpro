#!/usr/bin/env bash
set -Eeuo pipefail

sha=${1:-}
[[ "${sha}" =~ ^[0-9a-f]{40}$ ]] || { echo "invalid deployment SHA" >&2; exit 2; }

expected_hostname=vps-0e8f1563
source_checkout=/opt/orientationpro
deploy_root=/opt/orientationpro-deploy
mirror="${deploy_root}/repository.git"
release_root=/opt/releases/orientationpro
release="${release_root}/${sha}"
backup_root=/opt/backups
compose_project=orientationpro_riasec
compose_file="${release}/.vps/docker-compose.yml"
env_file="${release}/.env.vps"
archive=/opt/cache/makoki/esco/esco-1.2.1-fr.zip
crosswalk=/opt/cache/makoki/esco/ONET_Occupations_0_updated.csv
archive_sha=84fe49774fad90bdfd27d080440ffb1fdef1fbd62939f6436d2fc21f4d58d4e8
crosswalk_sha=82179a0a3340da97b63df90134d8d941ec3c2c478334d855b69e4dd57a91b620
bootstrap_hash=3bb6629cba8dc37d026f8c9419d8dfe771e25d55bc2f6409279a5aa4d4c41c95
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup="${backup_root}/orientationpro-${stamp}-${sha:0:12}"
lock_file=/run/lock/orientationpro-production-deploy.lock

exec 9>"${lock_file}"
flock -n 9 || { echo "another production deployment is running" >&2; exit 3; }
test "$(hostname)" = "${expected_hostname}"
test -s "${source_checkout}/.env.vps"
test -f "${source_checkout}/.vps/docker-compose.yml"
test -s "${archive}"
test -s "${crosswalk}"
echo "${archive_sha}  ${archive}" | sha256sum --check --status
echo "${crosswalk_sha}  ${crosswalk}" | sha256sum --check --status

install -d -m 700 "${deploy_root}" "${release_root}" "${backup_root}"
if [[ ! -d "${mirror}" ]]; then
  git clone --mirror git@github.com:guetchou/orientationpro.git "${mirror}"
fi
git --git-dir="${mirror}" fetch --prune origin '+refs/heads/main:refs/heads/main'
git --git-dir="${mirror}" cat-file -e "${sha}^{commit}"
git --git-dir="${mirror}" merge-base --is-ancestor "${sha}" refs/heads/main

space_helper=$(mktemp)
git --git-dir="${mirror}" show "${sha}:scripts/release/prepare-docker-build-space.sh" >"${space_helper}"
chmod 700 "${space_helper}"
bash "${space_helper}" "${release_root}" "${deploy_root}/current" "${deploy_root}/deployments.tsv"
rm -f "${space_helper}"

if [[ ! -d "${release}/.git" ]]; then
  git clone --shared "${mirror}" "${release}"
  git -C "${release}" checkout --detach "${sha}"
fi
test "$(git -C "${release}" rev-parse HEAD)" = "${sha}"
test -x "${release}/scripts/deploy-production-vps.sh"

install -d -m 700 "${release}/.vps"
cp -a "${source_checkout}/.vps/." "${release}/.vps/"
install -m 644 "${source_checkout}/backend/Dockerfile.vps" "${release}/backend/Dockerfile.vps"
install -m 644 "${source_checkout}/backend/.dockerignore" "${release}/backend/.dockerignore"
install -m 600 "${source_checkout}/.env.vps" "${env_file}"

test -f "${release}/.vps/Dockerfile.web"
bash "${release}/scripts/release/enable-life-project-web-build.sh" \
  "${release}/.vps/Dockerfile.web"

mkdir -m 700 "${backup}"
cp -a "${env_file}" "${backup}/env-before.vps"
chmod 600 "${backup}/env-before.vps"

sed -i "s/^APP_VERSION=.*/APP_VERSION=${sha}/" "${env_file}"
grep -q "^APP_VERSION=${sha}$" "${env_file}"
bash "${release}/scripts/release/activate-life-project-flags.sh" "${env_file}"

for expected in \
  AUTH_V1_ENABLED=true \
  LIFE_PROJECT_API_ENABLED=true \
  VITE_LIFE_PROJECT_ENABLED=true; do
  grep -qx "${expected}" "${env_file}"
done

for expected in \
  LEGACY_AUTH_ENABLED=false \
  LEGACY_API_ENABLED=false \
  DATA_RIGHTS_API_ENABLED=false \
  RIASEC_API_ENABLED=false \
  RIASEC_ALLOW_DRAFT=false \
  CAREER_API_ENABLED=false \
  CV_API_V1_ENABLED=false \
  FEATURE_CHATBOT=false \
  FEATURE_ANALYTICS=false; do
  grep -qx "${expected}" "${env_file}"
done

docker exec "${compose_project}-db-1" bash -c \
  'mysqldump --single-transaction --quick --triggers --routines --events --hex-blob -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip -c >"${backup}/db-before.sql.gz"
gzip -t "${backup}/db-before.sql.gz"
sha256sum "${backup}/db-before.sql.gz" >"${backup}/db-before.sql.gz.sha256"
cp -a "${compose_file}" "${backup}/docker-compose.yml"
cp -a "${env_file}" "${backup}/env-release.vps"
chmod 600 "${backup}/env-release.vps"
cp -a /etc/nginx/sites-available/makoki.org "${backup}/nginx-makoki.org" 2>/dev/null || true

for service in api web; do
  current_image="${compose_project}-${service}:latest"
  if docker image inspect "${current_image}" >/dev/null 2>&1; then
    docker image tag "${current_image}" "${compose_project}-${service}:rollback-${stamp}"
  fi
done

compose=(docker compose --project-name "${compose_project}" --env-file "${env_file}" -f "${compose_file}")
"${compose[@]}" config --quiet

rollback_on_error() {
  status=$?
  trap - ERR
  echo "deployment failed; restoring previous application images and release flags" >&2
  cp -a "${backup}/env-before.vps" "${env_file}" || true
  chmod 600 "${env_file}" || true
  for service in api web; do
    rollback_image="${compose_project}-${service}:rollback-${stamp}"
    if docker image inspect "${rollback_image}" >/dev/null 2>&1; then
      docker image tag "${rollback_image}" "${compose_project}-${service}:latest"
    fi
  done
  "${compose[@]}" up -d --no-deps --force-recreate api web || true
  exit "${status}"
}
trap rollback_on_error ERR

"${compose[@]}" build api
"${compose[@]}" build --build-arg VITE_LIFE_PROJECT_ENABLED=true web

db_id_before=$(docker inspect -f '{{.Id}}' "${compose_project}-db-1")
"${compose[@]}" run --rm --no-deps api node scripts/migrate.js up

riasec_seed_report="${backup}/riasec-seed-report.json"
"${compose[@]}" run --rm --no-deps \
  api node scripts/seed-riasec.js | tee "${riasec_seed_report}"
grep -Eq '"status":"(created|unchanged|updated-draft)"' "${riasec_seed_report}"
grep -q '"instrumentId":"riasec-makoki-fr-draft-v2"' "${riasec_seed_report}"
grep -q '"itemCount":60' "${riasec_seed_report}"

# Remove only the temporary ESCO bootstrap created before the canonical importer existed.
"${compose[@]}" run --rm --no-deps \
  -e EXPECTED_BOOTSTRAP_HASH="${bootstrap_hash}" \
  api node scripts/reconcile-esco-bootstrap.js

"${compose[@]}" run --rm --no-deps \
  -v "${archive}:/data/esco.zip:ro" \
  -v "${crosswalk}:/data/onet-esco-crosswalk.csv:ro" \
  -e ESCO_VERSION=1.2.1 \
  -e ESCO_LOCALE=fr \
  -e ESCO_ARCHIVE_PATH=/data/esco.zip \
  -e ESCO_CROSSWALK_PATH=/data/onet-esco-crosswalk.csv \
  -e ESCO_CACHE_DIR=/tmp/esco-cache \
  -e ESCO_ACCESS_DATE=2026-07-28 \
  -e ALLOW_SOURCE_REPLACE=true \
  api node scripts/import-esco-catalog.js | tee "${backup}/esco-import-report.json"

"${compose[@]}" up -d --no-deps --force-recreate api
for _ in $(seq 1 30); do
  [[ "$(docker inspect -f '{{.State.Health.Status}}' "${compose_project}-api-1")" = healthy ]] && break
  sleep 2
done
test "$(docker inspect -f '{{.State.Health.Status}}' "${compose_project}-api-1")" = healthy

"${compose[@]}" up -d --no-deps --force-recreate web
for _ in $(seq 1 30); do
  curl --fail --silent http://127.0.0.1:8088/ >/dev/null && break
  sleep 2
done
curl --fail --silent http://127.0.0.1:8088/ >/dev/null
curl --fail --silent http://127.0.0.1:8088/parcours >/dev/null
curl --fail --silent http://127.0.0.1:8088/api/test/health >/dev/null

test "$(docker inspect -f '{{.Id}}' "${compose_project}-db-1")" = "${db_id_before}"
test "$(docker inspect -f '{{.RestartCount}}' "${compose_project}-api-1")" = 0
test "$(docker inspect -f '{{.RestartCount}}' "${compose_project}-web-1")" = 0
ln -sfn "${release}" "${deploy_root}/current"
printf '%s\t%s\t%s\n' "${stamp}" "${sha}" "${backup}" >>"${deploy_root}/deployments.tsv"
trap - ERR
echo "production deployment succeeded: ${sha}"
