#!/usr/bin/env bash
set -Eeuo pipefail

env_file="${1:-}"
[[ -f "${env_file}" ]] || { printf 'Usage: %s ENV_FILE\n' "$0" >&2; exit 2; }

upsert_flag() {
  local key="$1"
  local value="$2"
  local temporary
  temporary="$(mktemp "${env_file}.XXXXXX")"

  awk -F= -v key="${key}" -v value="${value}" '
    BEGIN { found = 0 }
    $1 == key { print key "=" value; found = 1; next }
    { print }
    END { if (!found) print key "=" value }
  ' "${env_file}" >"${temporary}"

  chmod --reference="${env_file}" "${temporary}"
  chown --reference="${env_file}" "${temporary}" 2>/dev/null || true
  mv "${temporary}" "${env_file}"
}

required_true=(
  AUTH_V1_ENABLED
  LIFE_PROJECT_API_ENABLED
  VITE_LIFE_PROJECT_ENABLED
)

required_false=(
  LEGACY_AUTH_ENABLED
  LEGACY_API_ENABLED
  DATA_RIGHTS_API_ENABLED
  RIASEC_API_ENABLED
  RIASEC_ALLOW_DRAFT
  CAREER_API_ENABLED
  CV_API_V1_ENABLED
  FEATURE_CHATBOT
  FEATURE_ANALYTICS
)

for flag in "${required_true[@]}"; do
  upsert_flag "${flag}" true
done

for flag in "${required_false[@]}"; do
  upsert_flag "${flag}" false
done

read_flag() {
  local key="$1"
  awk -F= -v key="${key}" '$1 == key { value = $2 } END { print value }' "${env_file}"
}

for flag in "${required_true[@]}"; do
  [[ "$(read_flag "${flag}")" == true ]] || {
    printf '%s must be true for the Projet de vie production release\n' "${flag}" >&2
    exit 1
  }
done

for flag in "${required_false[@]}"; do
  [[ "$(read_flag "${flag}")" == false ]] || {
    printf '%s must be false during the Projet de vie production release\n' "${flag}" >&2
    exit 1
  }
done

printf 'Projet de vie release flags verified\n'
