'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const script = path.join(repoRoot, 'scripts/release/activate-life-project-flags.sh');
const releaseDefaults = path.join(repoRoot, 'scripts/release/environments/production.env');

const readFlags = (content) => new Map(content
  .split(/\r?\n/u)
  .filter((line) => line.includes('='))
  .map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));

test('Projet de vie activation replaces pre-existing legacy and sensitive flags', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-v6h-flags-'));
  const envFile = path.join(directory, '.env.vps');
  const initial = fs.readFileSync(releaseDefaults, 'utf8')
    .replace('LEGACY_AUTH_ENABLED=false', 'LEGACY_AUTH_ENABLED=true')
    .replace('LEGACY_API_ENABLED=false', 'LEGACY_API_ENABLED=true')
    .replace('FEATURE_ANALYTICS=false', 'FEATURE_ANALYTICS=true');
  fs.writeFileSync(envFile, initial, { mode: 0o600 });

  try {
    execFileSync('bash', [script, envFile], { encoding: 'utf8' });
    const first = fs.readFileSync(envFile, 'utf8');
    const flags = readFlags(first);

    for (const key of [
      'AUTH_V1_ENABLED',
      'LIFE_PROJECT_API_ENABLED',
      'VITE_LIFE_PROJECT_ENABLED',
    ]) {
      assert.equal(flags.get(key), 'true', key);
    }

    for (const key of [
      'LEGACY_AUTH_ENABLED',
      'LEGACY_API_ENABLED',
      'DATA_RIGHTS_API_ENABLED',
      'RIASEC_API_ENABLED',
      'RIASEC_ALLOW_DRAFT',
      'CAREER_API_ENABLED',
      'CV_API_V1_ENABLED',
      'FEATURE_CHATBOT',
      'FEATURE_ANALYTICS',
    ]) {
      assert.equal(flags.get(key), 'false', key);
    }

    execFileSync('bash', [script, envFile], { encoding: 'utf8' });
    assert.equal(fs.readFileSync(envFile, 'utf8'), first, 'activation must be idempotent');
    assert.equal(fs.statSync(envFile).mode & 0o777, 0o600);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
