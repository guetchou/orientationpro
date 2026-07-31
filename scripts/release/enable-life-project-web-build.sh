#!/usr/bin/env bash
set -Eeuo pipefail

dockerfile="${1:-}"
[[ -f "${dockerfile}" ]] || { printf 'Usage: %s DOCKERFILE\n' "$0" >&2; exit 2; }

temporary="$(mktemp "${dockerfile}.XXXXXX")"
awk '
  BEGIN { inserted = 0 }
  /^ARG[[:space:]]+VITE_LIFE_PROJECT_ENABLED([=[:space:]]|$)/ { next }
  /^ENV[[:space:]]+VITE_LIFE_PROJECT_ENABLED=/ { next }
  /^RUN[[:space:]]+npm[[:space:]]+run[[:space:]]+build([[:space:]]|$)/ && !inserted {
    print "ARG VITE_LIFE_PROJECT_ENABLED=false"
    print "ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}"
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

grep -qx 'ARG VITE_LIFE_PROJECT_ENABLED=false' "${dockerfile}"
grep -qx 'ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}' "${dockerfile}"
[[ "$(grep -c '^ARG VITE_LIFE_PROJECT_ENABLED=false$' "${dockerfile}")" == 1 ]]
[[ "$(grep -c '^ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}$' "${dockerfile}")" == 1 ]]

arg_line=$(grep -n '^ARG VITE_LIFE_PROJECT_ENABLED=false$' "${dockerfile}" | cut -d: -f1)
build_line=$(grep -n '^RUN[[:space:]]\+npm[[:space:]]\+run[[:space:]]\+build' "${dockerfile}" | head -n1 | cut -d: -f1)
[[ -n "${arg_line}" && -n "${build_line}" && "${arg_line}" -lt "${build_line}" ]] || {
  printf 'VITE_LIFE_PROJECT_ENABLED must be declared before the Vite build\n' >&2
  exit 1
}

printf 'Projet de vie Vite build argument normalized: %s\n' "${dockerfile}"
