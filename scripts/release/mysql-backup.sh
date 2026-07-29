#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  printf 'Usage: %s --container NAME --database NAME --output FILE\n' "$0" >&2
}

container=''
database=''
output=''
while [[ $# -gt 0 ]]; do
  case "$1" in
    --container) container="${2:-}"; shift 2 ;;
    --database) database="${2:-}"; shift 2 ;;
    --output) output="${2:-}"; shift 2 ;;
    *) usage; exit 2 ;;
  esac
done

[[ "$container" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]] || { printf 'Invalid container name\n' >&2; exit 2; }
[[ "$database" =~ ^[a-zA-Z0-9_]+$ ]] || { printf 'Invalid database name\n' >&2; exit 2; }
[[ -n "$output" && "$output" != */ ]] || { printf 'Invalid output file\n' >&2; exit 2; }
[[ ! -e "$output" ]] || { printf 'Refusing to overwrite existing backup: %s\n' "$output" >&2; exit 1; }
command -v docker >/dev/null || { printf 'docker is required\n' >&2; exit 1; }
command -v sha256sum >/dev/null || { printf 'sha256sum is required\n' >&2; exit 1; }

output_dir="$(dirname -- "$output")"
mkdir -p -- "$output_dir"
tmp_file="$(mktemp "${output}.tmp.XXXXXX")"
cleanup() { [[ ! -e "$tmp_file" ]] || rm -f -- "$tmp_file"; }
trap cleanup EXIT
chmod 0600 "$tmp_file"

docker inspect "$container" >/dev/null
docker exec "$container" sh -eu -c \
  'MYSQL_PWD="${MYSQL_ROOT_PASSWORD:?}" exec mysqldump --user=root --single-transaction --routines --triggers --hex-blob --set-gtid-purged=OFF --databases "$1"' \
  sh "$database" >"$tmp_file"

[[ -s "$tmp_file" ]] || { printf 'Backup is empty\n' >&2; exit 1; }
grep -Fq -- "CREATE DATABASE" "$tmp_file" || { printf 'Backup lacks database declaration\n' >&2; exit 1; }
mv -- "$tmp_file" "$output"
sha256sum -- "$output" >"${output}.sha256"
chmod 0600 "$output" "${output}.sha256"
printf 'Backup created: %s\n' "$output"
