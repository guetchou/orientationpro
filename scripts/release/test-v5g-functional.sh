#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_dir="$(cd -- "$script_dir/../.." && pwd -P)"

: "${V5G_EVIDENCE_DIR:?V5G_EVIDENCE_DIR must name persistent restricted storage}"
[[ "$V5G_EVIDENCE_DIR" = /* ]] || { printf 'V5G_EVIDENCE_DIR must be absolute\n' >&2; exit 2; }
[[ "$V5G_EVIDENCE_DIR" != /tmp/* ]] || { printf 'V5G_EVIDENCE_DIR cannot be under /tmp\n' >&2; exit 2; }
[[ ! -e "$V5G_EVIDENCE_DIR" ]] || { printf 'Refusing to overwrite evidence: %s\n' "$V5G_EVIDENCE_DIR" >&2; exit 2; }

mysql_port="${V5G_MYSQL_PORT:-3312}"
api_port="${V5G_API_PORT:-4192}"
web_port="${V5G_WEB_PORT:-4193}"
container="makoki-v5g-mysql-$$"
runtime_dir="$(mktemp -d)"
api_pid=''
web_pid=''

cleanup() {
  local exit_code=$?
  for pid in "$web_pid" "$api_pid"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
  docker rm -f "$container" >/dev/null 2>&1 || true
  find "$runtime_dir" -type f -delete 2>/dev/null || true
  find "$runtime_dir" -depth -type d -empty -delete 2>/dev/null || true
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

for port in "$mysql_port" "$api_port" "$web_port"; do
  if ss -ltn | awk '{print $4}' | grep -Eq ":${port}$"; then
    printf 'Refusing occupied port: %s\n' "$port" >&2
    exit 2
  fi
done

mkdir -p "$V5G_EVIDENCE_DIR"
chmod 700 "$V5G_EVIDENCE_DIR"
git_sha="$(git -C "$repo_dir" rev-parse HEAD)"
test_password='V5G-only-correct-horse-battery-staple'
account_a='v5g-account-a@example.test'
account_b='v5g-account-b@example.test'

docker run -d --name "$container" \
  --tmpfs /var/lib/mysql:rw,noexec,nosuid,size=1g \
  -p "127.0.0.1:${mysql_port}:3306" \
  -e MYSQL_ROOT_PASSWORD=v5g_root_password \
  -e MYSQL_DATABASE=orientationpro_v5g \
  -e MYSQL_USER=orientationpro_v5g \
  -e MYSQL_PASSWORD=v5g_database_password \
  mysql:8.0 >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$container" mysqladmin ping -uroot -pv5g_root_password --silent >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$container" mysqladmin ping -uroot -pv5g_root_password --silent >/dev/null

db_env=(
  DB_HOST=127.0.0.1
  DB_PORT="$mysql_port"
  DB_USER=orientationpro_v5g
  DB_PASSWORD=v5g_database_password
  DB_NAME=orientationpro_v5g
)
for _ in $(seq 1 30); do
  if docker exec "$container" mysql \
    -uorientationpro_v5g -pv5g_database_password \
    -D orientationpro_v5g -Nse 'SELECT 1' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$container" mysql \
  -uorientationpro_v5g -pv5g_database_password \
  -D orientationpro_v5g -Nse 'SELECT 1' >/dev/null

migrated=false
for _ in $(seq 1 5); do
  if env "${db_env[@]}" node "$repo_dir/backend/scripts/migrate.js" up; then
    migrated=true
    break
  fi
  sleep 2
done
[[ "$migrated" == true ]] || { printf 'Migrations did not complete\n' >&2; exit 1; }
env "${db_env[@]}" \
  V5G_TEST_PASSWORD="$test_password" \
  V5G_ACCOUNT_A_EMAIL="$account_a" \
  V5G_ACCOUNT_B_EMAIL="$account_b" \
  node "$repo_dir/scripts/release/seed-v5g-accounts.cjs"

env "${db_env[@]}" \
  PORT="$api_port" \
  NODE_ENV=test \
  APP_VERSION="$git_sha" \
  APP_WEB_URL="http://127.0.0.1:${web_port}" \
  CORS_ORIGINS="http://127.0.0.1:${web_port}" \
  AUTH_V1_ENABLED=true \
  LIFE_PROJECT_API_ENABLED=true \
  LEGACY_AUTH_ENABLED=false \
  DATA_RIGHTS_API_ENABLED=false \
  RIASEC_API_ENABLED=false \
  CAREER_API_ENABLED=false \
  CV_API_V1_ENABLED=false \
  JWT_SECRET='v5g-isolated-jwt-secret-with-more-than-32-characters' \
  RATE_LIMIT_KEY_SECRET='v5g-isolated-rate-limit-secret-32-chars-minimum' \
  RATE_LIMIT_GENERAL_MAX=10000 \
  RATE_LIMIT_AUTH_MAX=100 \
  RATE_LIMIT_EXPENSIVE_MAX=10000 \
  SMTP_HOST=127.0.0.1 \
  SMTP_PORT=1 \
  SMTP_USER=unused \
  SMTP_PASSWORD=unused \
  SMTP_FROM=noreply@example.test \
  node "$repo_dir/backend/src/server.js" >"$runtime_dir/api.log" 2>&1 &
api_pid=$!

for _ in $(seq 1 60); do
  if curl --fail --silent "http://127.0.0.1:${api_port}/api/test/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl --fail --silent "http://127.0.0.1:${api_port}/api/test/health" >/dev/null

(
  cd "$repo_dir"
  VITE_LIFE_PROJECT_ENABLED=true \
  VITE_API_URL="http://127.0.0.1:${api_port}/api" \
  npm run build
  npm run preview -- --host 127.0.0.1 --port "$web_port" --strictPort
) >"$runtime_dir/web.log" 2>&1 &
web_pid=$!

for _ in $(seq 1 60); do
  if curl --fail --silent "http://127.0.0.1:${web_port}/login" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl --fail --silent "http://127.0.0.1:${web_port}/login" >/dev/null

V5G_WEB_URL="http://127.0.0.1:${web_port}" \
V5G_API_ROOT="http://127.0.0.1:${api_port}/api" \
V5G_PLAYWRIGHT_OUTPUT="$V5G_EVIDENCE_DIR/playwright" \
V5G_ACCOUNT_A_EMAIL="$account_a" \
V5G_ACCOUNT_B_EMAIL="$account_b" \
V5G_TEST_PASSWORD="$test_password" \
npx playwright test --config="$repo_dir/playwright.v5g.config.ts"

V5G_API_ROOT="http://127.0.0.1:${api_port}/api" \
V5G_ACCOUNT_A_EMAIL="$account_a" \
V5G_ACCOUNT_B_EMAIL="$account_b" \
V5G_TEST_PASSWORD="$test_password" \
V5G_GIT_SHA="$git_sha" \
node "$repo_dir/scripts/release/v5g-business-load.cjs" >"$V5G_EVIDENCE_DIR/business-load.json"

docker exec "$container" mysql -uorientationpro_v5g -pv5g_database_password \
  -D orientationpro_v5g -Nse \
  "SELECT CONCAT('accounts=', COUNT(*)) FROM auth_accounts;
   SELECT CONCAT('projects=', COUNT(*)) FROM life_projects;" \
  >"$V5G_EVIDENCE_DIR/database-counts.txt"

if grep -Eiq 'bearer |authorization|password|refresh.token|verification.token|cookie' "$runtime_dir/api.log"; then
  printf 'Sensitive pattern found in API logs\n' >&2
  exit 1
fi

mkdir -p "$V5G_EVIDENCE_DIR/accessibility"
(
  cd "$repo_dir"
  npm audit --json >"$V5G_EVIDENCE_DIR/dependencies-root-all.json" || true
  npm audit --omit=dev --json >"$V5G_EVIDENCE_DIR/dependencies-root-production.json" || true
  npm --prefix backend audit --json >"$V5G_EVIDENCE_DIR/dependencies-backend-all.json" || true
  npm --prefix backend audit --omit=dev --json >"$V5G_EVIDENCE_DIR/dependencies-backend-production.json" || true
)
node "$repo_dir/scripts/security/v5g-dependency-matrix.cjs" \
  "rootAll=$V5G_EVIDENCE_DIR/dependencies-root-all.json" \
  "rootProduction=$V5G_EVIDENCE_DIR/dependencies-root-production.json" \
  "backendAll=$V5G_EVIDENCE_DIR/dependencies-backend-all.json" \
  "backendProduction=$V5G_EVIDENCE_DIR/dependencies-backend-production.json" \
  "gitSha=$git_sha" >"$V5G_EVIDENCE_DIR/dependency-matrix.json"
node "$repo_dir/scripts/release/v5g-manual-evidence-gate.cjs" \
  "$V5G_EVIDENCE_DIR/accessibility" >"$V5G_EVIDENCE_DIR/manual-accessibility-gate.json" || true

node - "$V5G_EVIDENCE_DIR" "$git_sha" <<'NODE'
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const [directory, gitSha] = process.argv.slice(2);
const files = [];
const walk = (current) => {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name !== 'manifest.json') {
      const relative = path.relative(directory, absolute);
      files.push({
        path: relative,
        sha256: crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex'),
      });
    }
  }
};
walk(directory);
const manifest = {
  schemaVersion: 'makoki.v5g-evidence-manifest.v1',
  gitSha,
  generatedAt: new Date().toISOString(),
  command: 'scripts/release/test-v5g-functional.sh',
  environment: 'Linux, Firefox Playwright, Node, MySQL 8 tmpfs',
  files,
  limitations: [
    'not Safari macOS',
    'not VoiceOver',
    'not NVDA',
    'not production traffic',
  ],
};
fs.writeFileSync(path.join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
NODE
node "$repo_dir/scripts/release/v5g-final-gate.cjs" \
  "$V5G_EVIDENCE_DIR" >"$V5G_EVIDENCE_DIR/final-gate.json"
node - "$V5G_EVIDENCE_DIR" <<'NODE'
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const directory = process.argv[2];
const manifestPath = path.join(directory, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const gatePath = path.join(directory, 'final-gate.json');
manifest.files.push({
  path: 'final-gate.json',
  sha256: crypto.createHash('sha256').update(fs.readFileSync(gatePath)).digest('hex'),
});
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
NODE
chmod -R go-rwx "$V5G_EVIDENCE_DIR"
printf 'V5-G evidence collected; consult final-gate.json for the decision: %s\n' "$V5G_EVIDENCE_DIR"
