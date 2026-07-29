#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  printf 'Usage: %s --container NAME --input FILE --confirm-disposable-target\n' "$0" >&2
}

container=''
input=''
confirmed='false'
while [[ $# -gt 0 ]]; do
  case "$1" in
    --container) container="${2:-}"; shift 2 ;;
    --input) input="${2:-}"; shift 2 ;;
    --confirm-disposable-target) confirmed='true'; shift ;;
    *) usage; exit 2 ;;
  esac
done

[[ "$container" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]*$ ]] || { printf 'Invalid container name\n' >&2; exit 2; }
[[ -f "$input" && -r "$input" ]] || { printf 'Backup is not readable\n' >&2; exit 2; }
[[ "$confirmed" == 'true' ]] || { printf 'Explicit disposable-target confirmation is required\n' >&2; exit 2; }
[[ -f "${input}.sha256" ]] || { printf 'Checksum file is required\n' >&2; exit 2; }
command -v docker >/dev/null || { printf 'docker is required\n' >&2; exit 1; }
command -v sha256sum >/dev/null || { printf 'sha256sum is required\n' >&2; exit 1; }

(cd -- "$(dirname -- "$input")" && sha256sum --check --status "$(basename -- "$input").sha256")
docker inspect "$container" >/dev/null
docker exec -i "$container" sh -eu -c \
  'MYSQL_PWD="${MYSQL_ROOT_PASSWORD:?}" exec mysql --user=root' <"$input"
printf 'Restore completed on explicitly confirmed disposable target\n'
