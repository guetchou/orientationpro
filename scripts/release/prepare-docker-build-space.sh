#!/usr/bin/env bash
set -Eeuo pipefail

minimum_free_kb="${MINIMUM_DOCKER_FREE_KB:-4194304}"
keep_successful_releases="${KEEP_SUCCESSFUL_RELEASES:-3}"
release_root="${1:-}"
current_release_link="${2:-}"
deployments_file="${3:-}"
image_prefix="${4:-}"

[[ "${minimum_free_kb}" =~ ^[0-9]+$ ]] || {
  printf 'MINIMUM_DOCKER_FREE_KB must be a positive integer\n' >&2
  exit 2
}

if (( minimum_free_kb < 1048576 )); then
  printf 'MINIMUM_DOCKER_FREE_KB must be at least 1048576 (1 GiB)\n' >&2
  exit 2
fi

[[ "${keep_successful_releases}" =~ ^[0-9]+$ ]] || {
  printf 'KEEP_SUCCESSFUL_RELEASES must be a positive integer\n' >&2
  exit 2
}

if (( keep_successful_releases < 2 )); then
  printf 'KEEP_SUCCESSFUL_RELEASES must preserve at least two successful releases\n' >&2
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

successful_release_is_preserved() {
  local candidate_sha="$1"
  [[ -f "${deployments_file}" ]] || return 1

  awk -F'\t' 'NF >= 2 { print $2 }' "${deployments_file}" \
    | tac \
    | awk '!seen[$0]++' \
    | head -n "${keep_successful_releases}" \
    | grep -Fxq "${candidate_sha}"
}

prune_release_worktrees() {
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

    if successful_release_is_preserved "${sha}"; then
      continue
    fi

    printf 'Removing old or failed release worktree: %s\n' "${candidate}"
    rm -rf --one-file-system "${candidate}"
  done
  shopt -u nullglob
}

prune_old_project_rollback_images() {
  [[ -n "${image_prefix}" ]] || return 0

  local service
  for service in api web; do
    local repository="${image_prefix}-${service}"
    local -a rollback_refs=()
    mapfile -t rollback_refs < <(
      docker image ls --format '{{.Repository}}:{{.Tag}}' "${repository}" \
        | awk -F: '$NF ~ /^rollback-/ { print }' \
        | sort -r
    )

    if (( ${#rollback_refs[@]} <= 1 )); then
      continue
    fi

    printf 'Preserving latest rollback image: %s\n' "${rollback_refs[0]}"
    local ref
    for ref in "${rollback_refs[@]:1}"; do
      printf 'Removing old project rollback image: %s\n' "${ref}"
      docker image rm "${ref}" || true
    done
  done
}

prune_unused_project_images() {
  [[ -n "${image_prefix}" ]] || return 0

  # Docker Compose annotates its build images with the project label. This
  # removes only unused images belonging to MAKOKI; running images remain
  # protected by Docker and images from other VPS services are untouched.
  docker image prune --all --force \
    --filter "label=com.docker.compose.project=${image_prefix}" || true
}

print_report 'Before Docker space preparation'

if (( $(available_kb) < minimum_free_kb )); then
  docker builder prune --all --force
  docker container prune --force
  prune_release_worktrees
  prune_old_project_rollback_images
  prune_unused_project_images
  docker image prune --force
fi

print_report 'After Docker space preparation'

if (( $(available_kb) < minimum_free_kb )); then
  printf 'Insufficient Docker filesystem space after safe project-scoped cleanup\n' >&2
  exit 1
fi

printf 'Docker build space preflight passed\n'
