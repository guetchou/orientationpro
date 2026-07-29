#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_dir="$(cd -- "$script_dir/../.." && pwd -P)"
command -v docker >/dev/null || { printf 'docker is required\n' >&2; exit 1; }
command -v node >/dev/null || { printf 'node is required\n' >&2; exit 1; }
[[ -d "$repo_dir/backend/node_modules/mysql2" ]] || {
  printf 'Run npm --prefix backend ci before this test\n' >&2
  exit 1
}

test_dir="$(mktemp -d)"
container="makoki-v5-migration-${RANDOM}-$$"
cleanup() {
  docker stop --time 2 "$container" >/dev/null 2>&1 || true
  rm -rf -- "$test_dir"
}
trap cleanup EXIT INT TERM

docker run --detach --rm --name "$container" \
  --publish 127.0.0.1::3306 \
  --tmpfs /var/lib/mysql:rw,noexec,nosuid,size=512m \
  --env MYSQL_ROOT_PASSWORD='v5-disposable-test-only' \
  --env MYSQL_DATABASE='makoki_migration_test' \
  mysql:8.0 >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$container" sh -eu -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root --execute "SELECT 1;"' \
    >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root --execute "SELECT 1;"' \
  >/dev/null

"$script_dir/mysql-backup.sh" \
  --container "$container" \
  --database makoki_migration_test \
  --output "$test_dir/pre-migration.sql"

port="$(docker port "$container" 3306/tcp)"
port="${port##*:}"
[[ "$port" =~ ^[0-9]+$ ]] || { printf 'Could not resolve disposable MySQL port\n' >&2; exit 1; }

export DB_HOST='127.0.0.1'
export DB_PORT="$port"
export DB_USER='root'
export DB_PASSWORD='v5-disposable-test-only'
export DB_NAME='makoki_migration_test'

(cd -- "$repo_dir/backend" && node scripts/migrate.js up)
before="$(docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root makoki_migration_test --execute "SELECT GROUP_CONCAT(version ORDER BY version) FROM schema_migrations;"')"
[[ -n "$before" ]] || { printf 'No migrations were applied\n' >&2; exit 1; }

(cd -- "$repo_dir/backend" && node scripts/migrate.js down)
after_down="$(docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root makoki_migration_test --execute "SELECT GROUP_CONCAT(version ORDER BY version) FROM schema_migrations;"')"
[[ "$after_down" != "$before" ]] || { printf 'Rollback did not change migration state\n' >&2; exit 1; }

(cd -- "$repo_dir/backend" && node scripts/migrate.js up)
after_up="$(docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root makoki_migration_test --execute "SELECT GROUP_CONCAT(version ORDER BY version) FROM schema_migrations;"')"
[[ "$after_up" == "$before" ]] || { printf 'Reapply did not restore migration state\n' >&2; exit 1; }
printf 'Migration up/down/up proof passed with pre-migration backup\n'
