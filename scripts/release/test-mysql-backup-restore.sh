#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
command -v docker >/dev/null || { printf 'docker is required\n' >&2; exit 1; }

test_dir="$(mktemp -d)"
container="makoki-v5-restore-${RANDOM}-$$"
cleanup() {
  docker stop --time 2 "$container" >/dev/null 2>&1 || true
  rm -rf -- "$test_dir"
}
trap cleanup EXIT INT TERM

docker run --detach --rm --name "$container" \
  --network none \
  --tmpfs /var/lib/mysql:rw,noexec,nosuid,size=512m \
  --env MYSQL_ROOT_PASSWORD='v5-disposable-test-only' \
  mysql:8.0 >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$container" sh -eu -c \
    'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root -e "SELECT 1;"' \
    >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root -e "SELECT 1;"' \
  >/dev/null

docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root -e "
    CREATE DATABASE makoki_restore_test;
    CREATE TABLE makoki_restore_test.proof (id INT PRIMARY KEY, label VARCHAR(64) NOT NULL);
    INSERT INTO makoki_restore_test.proof VALUES (1, '\''alpha'\''), (2, '\''beta'\'');
  "'

backup="$test_dir/makoki.sql"
"$script_dir/mysql-backup.sh" \
  --container "$container" \
  --database makoki_restore_test \
  --output "$backup"

docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root -e "DROP DATABASE makoki_restore_test;"'

"$script_dir/mysql-restore.sh" \
  --container "$container" \
  --input "$backup" \
  --confirm-disposable-target

actual="$(docker exec "$container" sh -eu -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --batch --skip-column-names --user=root -e "SELECT CONCAT(COUNT(*), '\'':'\'', SUM(id), '\'':'\'', GROUP_CONCAT(label ORDER BY id)) FROM makoki_restore_test.proof;"')"
[[ "$actual" == '2:3:alpha,beta' ]] || { printf 'Restore proof mismatch\n' >&2; exit 1; }
printf 'Backup/restore proof passed: row count, identifiers and ordered values match\n'
