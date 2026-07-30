#!/usr/bin/env bash
set -Eeuo pipefail

dockerfile="${1:-}"
[[ -f "${dockerfile}" ]] || { printf 'Usage: %s DOCKERFILE\n' "$0" >&2; exit 2; }

if ! grep -q '^ARG VITE_LIFE_PROJECT_ENABLED' "${dockerfile}"; then
  temporary="$(mktemp "${dockerfile}.XXXXXX")"
  awk '
    BEGIN { inserted = 0 }
    /^RUN npm run build([[:space:]]|$)/ && !inserted {
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
fi

grep -qx 'ARG VITE_LIFE_PROJECT_ENABLED=false' "${dockerfile}"
grep -qx 'ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}' "${dockerfile}"

arg_line=$(grep -n '^ARG VITE_LIFE_PROJECT_ENABLED=false$' "${dockerfile}" | cut -d: -f1)
build_line=$(grep -n '^RUN npm run build' "${dockerfile}" | head -n1 | cut -d: -f1)
[[ -n "${arg_line}" && -n "${build_line}" && "${arg_line}" -lt "${build_line}" ]] || {
  printf 'VITE_LIFE_PROJECT_ENABLED must be declared before the Vite build\n' >&2
  exit 1
}

printf 'Projet de vie Vite build argument verified: %s\n' "${dockerfile}"
