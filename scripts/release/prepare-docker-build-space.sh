#!/usr/bin/env bash
set -Eeuo pipefail

minimum_free_kb="${MINIMUM_DOCKER_FREE_KB:-4194304}"
release_root="${1:-}"
current_release_link="${2:-}"
deployments_file="${3:-}"

[[ "${minimum_free_kb}" =~ ^[0-9]+$ ]] || {
  printf 'MINIMUM_DOCKER_FREE_KB must be a positive integer\n' >&2
  exit 2
}

if (( minimum_free_kb < 1048576 )); then
  printf 'MINIMUM_DOCKER_FREE_KB must be at least 1048576 (1 GiB)\n' >&2
  exit 2
fi

if [[ -n "${release_root}" ]]; then
  [[ -d "${release_root}" ]] || { printf 'release root not found: %s\n' "${release_root}" >&2; exit 2; }
  [[ -n "${current_release_link}" ]] || { printf 'current release link is required\n' >&2; exit 2; }
  [[ -n "${deployments_file}" ]] || { printf 'deployments file is required\n' >&2; exit 2; }
fi

docker_root="${DOCKER_ROOT_OVERRIDE:-$(docker info --format '{{.DockerRootDir}}')}"
[[ -d "${docker_root}" ]] || { printf 'Docker root not found: %s\n' "${docker_root}" >&2; exit 2; }

available_kb() {
  df -Pk "${docker_root}" | awk 'NR == 2 { print $4 }'
}

print_report() {
  local label="$1"
  printf '%s: docker_root=%s available_kb=%s required_kb=%s\n' \
    "${label}" "${docker_root}" "$(available_kb)" "${minimum_free_kb}"
  docker system df || true
}

prune_failed_releases() {
  [[ -n "${release_root}" ]] || return 0

  local current_release=''
  current_release="$(readlink -f "${current_release_link}" 2>/dev/null || true)"

  shopt -s nullglob
  for candidate in "${release_root}"/[0-9a-f]*; do
    [[ -d "${candidate}/.git" ]] || continue
    [[ "${candidate}" != "${current_release}" ]] || continue

    local sha
    sha="$(basename "${candidate}")"
    [[ "${sha}" =~ ^[0-9a-f]{40}$ ]] || continue

    if [[ -f "${deployments_file}" ]] && awk -F'\t' -v sha="${sha}" '$2 == sha { found = 1 } END { exit !found }' "${deployments_file}"; then
      continue
    fi

    printf 'Removing failed unreferenced release worktree: %s\n' "${candidate}"
    rm -rf --one-file-system "${candidate}"
  done
  shopt -u nullglob
}

print_report 'Before Docker space preparation'

if (( $(available_kb) < minimum_free_kb )); then
  docker builder prune --all --force
  docker container prune --force
  docker image prune --force
  prune_failed_releases
fi

print_report 'After Docker space preparation'

if (( $(available_kb) < minimum_free_kb )); then
  printf 'Insufficient Docker filesystem space after safe cleanup\n' >&2
  exit 1
fi

printf 'Docker build space preflight passed\n'
