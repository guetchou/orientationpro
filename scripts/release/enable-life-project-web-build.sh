#!/usr/bin/env bash
set -Eeuo pipefail

dockerfile="${1:-}"
[[ -f "${dockerfile}" ]] || { printf 'Usage: %s DOCKERFILE\n' "$0" >&2; exit 2; }

temporary="$(mktemp "${dockerfile}.XXXXXX")"
awk '
  BEGIN { inserted = 0 }
  /^ARG[[:space:]]+VITE_LIFE_PROJECT_ENABLED([=[:space:]]|$)/ { next }
  /^ENV[[:space:]]+VITE_LIFE_PROJECT_ENABLED=/ { next }
  /^ARG[[:space:]]+VITE_CV_ANALYSIS_ENABLED([=[:space:]]|$)/ { next }
  /^ENV[[:space:]]+VITE_CV_ANALYSIS_ENABLED=/ { next }
  /^RUN[[:space:]]+npm[[:space:]]+run[[:space:]]+build([[:space:]]|$)/ && !inserted {
    print "ARG VITE_LIFE_PROJECT_ENABLED=false"
    print "ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}"
    print "ARG VITE_CV_ANALYSIS_ENABLED=false"
    print "ENV VITE_CV_ANALYSIS_ENABLED=${VITE_CV_ANALYSIS_ENABLED}"
    print ""
    inserted = 1
  }
  { print }
  END { if (!inserted) exit 42 }
' "${dockerfile}" >"${temporary}" || {
  status=$?
  rm -f "${temporary}"
  if [[ "${status}" == 42 ]]; then
    printf 'RUN npm run build not found in %s\n' "${dockerfile}" >&2
  fi
  exit "${status}"
}

chmod --reference="${dockerfile}" "${temporary}"
chown --reference="${dockerfile}" "${temporary}" 2>/dev/null || true
mv "${temporary}" "${dockerfile}"

for expected in \
  'ARG VITE_LIFE_PROJECT_ENABLED=false' \
  'ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}' \
  'ARG VITE_CV_ANALYSIS_ENABLED=false' \
  'ENV VITE_CV_ANALYSIS_ENABLED=${VITE_CV_ANALYSIS_ENABLED}'; do
  grep -Fqx "${expected}" "${dockerfile}"
  [[ "$(grep -Fxc "${expected}" "${dockerfile}")" == 1 ]]
done

build_line=$(grep -n '^RUN[[:space:]]\+npm[[:space:]]\+run[[:space:]]\+build' "${dockerfile}" | head -n1 | cut -d: -f1)
for marker in \
  'ARG VITE_LIFE_PROJECT_ENABLED=false' \
  'ARG VITE_CV_ANALYSIS_ENABLED=false'; do
  marker_line=$(grep -Fn "${marker}" "${dockerfile}" | cut -d: -f1)
  [[ -n "${marker_line}" && -n "${build_line}" && "${marker_line}" -lt "${build_line}" ]] || {
    printf '%s must be declared before the Vite build\n' "${marker}" >&2
    exit 1
  }
done

printf 'Projet de vie and CV V1 Vite build arguments normalized: %s\n' "${dockerfile}"
