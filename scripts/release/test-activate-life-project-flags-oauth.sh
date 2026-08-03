#!/usr/bin/env bash
set -Eeuo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
script="${root_dir}/scripts/release/activate-life-project-flags.sh"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

make_env() {
  cat >"$1" <<'ENV'
AUTH_V1_ENABLED=false
LEGACY_AUTH_ENABLED=false
LEGACY_API_ENABLED=false
DATA_RIGHTS_API_ENABLED=false
LIFE_PROJECT_API_ENABLED=false
RIASEC_API_ENABLED=false
RIASEC_ALLOW_DRAFT=false
CAREER_API_ENABLED=false
CV_API_V1_ENABLED=false
FEATURE_CHATBOT=false
FEATURE_ANALYTICS=false
VITE_LIFE_PROJECT_ENABLED=false
VITE_CV_ANALYSIS_ENABLED=false
JWT_SECRET=12345678901234567890123456789012
APP_WEB_URL=https://makoki.org
OAUTH_CALLBACK_BASE_URL=https://makoki.org
GOOGLE_OAUTH_CLIENT_ID=google-client
GOOGLE_OAUTH_CLIENT_SECRET=google-secret
META_APP_ID=meta-app
META_APP_SECRET=meta-secret
META_GRAPH_API_VERSION=v23.0
ENV
}

missing_env="${tmp_dir}/missing.env"
make_env "${missing_env}"
sed -i '/^GOOGLE_OAUTH_CLIENT_SECRET=/d' "${missing_env}"
if bash "${script}" "${missing_env}" >"${tmp_dir}/missing.out" 2>&1; then
  echo 'Expected missing Google secret to block activation.' >&2
  exit 1
fi
grep -q 'GOOGLE_OAUTH_CLIENT_SECRET is required' "${tmp_dir}/missing.out"
grep -qx 'AUTH_V1_ENABLED=false' "${missing_env}"

bad_url_env="${tmp_dir}/bad-url.env"
make_env "${bad_url_env}"
sed -i 's#^OAUTH_CALLBACK_BASE_URL=.*#OAUTH_CALLBACK_BASE_URL=https://api.example.invalid#' "${bad_url_env}"
if bash "${script}" "${bad_url_env}" >"${tmp_dir}/bad-url.out" 2>&1; then
  echo 'Expected an invalid production callback base URL to block activation.' >&2
  exit 1
fi
grep -q 'OAUTH_CALLBACK_BASE_URL must be https://makoki.org' "${tmp_dir}/bad-url.out"

valid_env="${tmp_dir}/valid.env"
make_env "${valid_env}"
bash "${script}" "${valid_env}" >"${tmp_dir}/valid.out"
grep -qx 'AUTH_V1_ENABLED=true' "${valid_env}"
grep -qx 'LIFE_PROJECT_API_ENABLED=true' "${valid_env}"
grep -qx 'VITE_LIFE_PROJECT_ENABLED=true' "${valid_env}"
grep -qx 'VITE_CV_ANALYSIS_ENABLED=true' "${valid_env}"
grep -q 'OAuth providers' "${tmp_dir}/valid.out"

echo 'OAuth production activation guard test passed'
