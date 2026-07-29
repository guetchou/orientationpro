#!/usr/bin/env bash
set -Eeuo pipefail

env_file="${1:-}"
[[ -f "$env_file" ]] || { printf 'Usage: %s ENV_FILE\n' "$0" >&2; exit 2; }

required_flags=(
  AUTH_V1_ENABLED
  LEGACY_AUTH_ENABLED
  LEGACY_API_ENABLED
  DATA_RIGHTS_API_ENABLED
  LIFE_PROJECT_API_ENABLED
  RIASEC_API_ENABLED
  RIASEC_ALLOW_DRAFT
  CAREER_API_ENABLED
  CV_API_V1_ENABLED
  FEATURE_CHATBOT
  FEATURE_ANALYTICS
)

for flag in "${required_flags[@]}"; do
  value="$(awk -F= -v key="$flag" '$1 == key { print $2 }' "$env_file")"
  [[ "$value" == 'false' ]] || { printf '%s must be false in release defaults\n' "$flag" >&2; exit 1; }
done
printf 'Release defaults verified: all feature flags are disabled\n'
