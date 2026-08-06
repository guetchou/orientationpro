#!/usr/bin/env sh
set -eu

NETWORK="${NETWORK:-proxy-net}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-orientationpro_riasec-api-1}"
BACKEND_ALIAS="${BACKEND_ALIAS:-riasec-api}"
WEB_CONTAINER="${WEB_CONTAINER:-orientationpro-web-1}"

if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  echo "ERREUR: réseau Docker introuvable: $NETWORK" >&2
  exit 1
fi

if ! docker inspect "$BACKEND_CONTAINER" >/dev/null 2>&1; then
  echo "ERREUR: conteneur backend introuvable: $BACKEND_CONTAINER" >&2
  exit 1
fi

if ! docker inspect "$WEB_CONTAINER" >/dev/null 2>&1; then
  echo "ERREUR: conteneur frontend introuvable: $WEB_CONTAINER" >&2
  exit 1
fi

if ! docker inspect "$BACKEND_CONTAINER" \
  --format '{{json .NetworkSettings.Networks}}' | grep -q '"proxy-net"'; then
  docker network connect --alias "$BACKEND_ALIAS" "$NETWORK" "$BACKEND_CONTAINER"
fi

if ! docker inspect "$WEB_CONTAINER" \
  --format '{{json .NetworkSettings.Networks}}' | grep -q '"proxy-net"'; then
  docker network connect "$NETWORK" "$WEB_CONTAINER"
fi

if ! docker exec "$WEB_CONTAINER" getent hosts "$BACKEND_ALIAS" >/dev/null; then
  echo "ERREUR: $WEB_CONTAINER ne résout pas $BACKEND_ALIAS" >&2
  exit 1
fi

for provider in google meta; do
  status="$(
    docker exec "$WEB_CONTAINER" sh -lc \
      "wget -S -O /dev/null http://$BACKEND_ALIAS:6464/api/v1/auth/oauth/$provider/start 2>&1" \
      | awk '/HTTP\/1\.1/ { print $2; exit }'
  )"

  if [ "$status" != "302" ]; then
    echo "ERREUR: OAuth $provider retourne $status au lieu de 302" >&2
    exit 1
  fi

done

echo "OK: frontend et backend OAuth partagent $NETWORK via l'alias $BACKEND_ALIAS."
