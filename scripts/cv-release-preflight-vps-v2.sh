#!/usr/bin/env bash
set -Eeuo pipefail

BASE_SCRIPT_BLOB='5cbf7b03176f329095ae0cb4a48c00993492f4a3'
EXPECTED_MAIN_SHA=${EXPECTED_MAIN_SHA:?EXPECTED_MAIN_SHA is required}

for command in bash git head tail sed mktemp; do
  command -v "${command}" >/dev/null 2>&1 || {
    printf 'Missing required command: %s\n' "${command}" >&2
    exit 1
  }
done

git fetch --quiet origin \
  '+refs/heads/main:refs/remotes/origin/main'

ACTUAL_MAIN_SHA=$(git rev-parse refs/remotes/origin/main)

if [[ "${ACTUAL_MAIN_SHA}" != "${EXPECTED_MAIN_SHA}" ]]; then
  printf 'Refusing preflight: origin/main is %s, expected %s\n' \
    "${ACTUAL_MAIN_SHA}" \
    "${EXPECTED_MAIN_SHA}" >&2
  exit 1
fi

SOURCE_SCRIPT=$(mktemp)
PATCHED_SCRIPT=$(mktemp)

cleanup_wrapper() {
  rm -f "${SOURCE_SCRIPT}" "${PATCHED_SCRIPT}"
}
trap cleanup_wrapper EXIT

git cat-file blob "${BASE_SCRIPT_BLOB}" >"${SOURCE_SCRIPT}"

START_MARKER=$(sed -n '122p' "${SOURCE_SCRIPT}")
END_MARKER=$(sed -n '146p' "${SOURCE_SCRIPT}")

if [[ "${START_MARKER}" != "printf '=== Transactional production dump ===\\n'" ]]; then
  printf 'Unexpected dump start marker in base script.\n' >&2
  exit 1
fi

if [[ "${END_MARKER}" != "printf '=== Detached source archive ===\\n'" ]]; then
  printf 'Unexpected dump end marker in base script.\n' >&2
  exit 1
fi

{
  head -n 121 "${SOURCE_SCRIPT}"
  cat <<'PATCH'
printf '=== Transactional production dump ===\n'
DUMP_PLAIN="${ARTIFACT_DIR}/production-clone-source.sql"
DUMP_ERROR="${ARTIFACT_DIR}/mysqldump.stderr"

set +e
"${COMPOSE[@]}" exec -T db sh -lc '
  set -eu
  : "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"
  : "${MYSQL_DATABASE:?MYSQL_DATABASE is required}"
  export MYSQL_PWD="${MYSQL_ROOT_PASSWORD}"
  exec mysqldump \
    --user=root \
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
' >"${DUMP_PLAIN}" 2>"${DUMP_ERROR}"
DUMP_STATUS=$?
set -e

chmod 600 "${DUMP_PLAIN}" "${DUMP_ERROR}"

if [[ "${DUMP_STATUS}" -ne 0 ]]; then
  printf 'mysqldump failed with status %s.\n' "${DUMP_STATUS}" >&2
  cat "${DUMP_ERROR}" >&2
  exit "${DUMP_STATUS}"
fi

if [[ -s "${DUMP_ERROR}" ]]; then
  printf 'mysqldump diagnostics:\n'
  cat "${DUMP_ERROR}"
fi

gzip -1 -c "${DUMP_PLAIN}" >"${DUMP_FILE}"
rm -f "${DUMP_PLAIN}"

gzip -t "${DUMP_FILE}"
sha256sum "${DUMP_FILE}" | tee "${DUMP_SHA_FILE}"
chmod 600 "${DUMP_FILE}" "${DUMP_SHA_FILE}"

PATCH
  tail -n +146 "${SOURCE_SCRIPT}"
} >"${PATCHED_SCRIPT}"

chmod 700 "${PATCHED_SCRIPT}"
EXPECTED_MAIN_SHA="${EXPECTED_MAIN_SHA}" bash "${PATCHED_SCRIPT}"
