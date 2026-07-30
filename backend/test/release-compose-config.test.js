'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const assertionScript = path.join(repoRoot, 'scripts/release/assert-life-project-compose-config.cjs');
const overridePath = path.join(repoRoot, 'scripts/release/life-project-compose.override.yml');

const validConfig = {
  services: {
    api: {
      environment: {
        AUTH_V1_ENABLED: 'true',
        LIFE_PROJECT_API_ENABLED: 'true',
        LEGACY_AUTH_ENABLED: 'false',
        LEGACY_API_ENABLED: 'false',
        DATA_RIGHTS_API_ENABLED: 'false',
        RIASEC_API_ENABLED: 'false',
        RIASEC_ALLOW_DRAFT: 'false',
        CAREER_API_ENABLED: 'false',
        CV_API_V1_ENABLED: 'false',
        FEATURE_CHATBOT: 'false',
        FEATURE_ANALYTICS: 'false',
      },
    },
    web: {
      build: {
        args: { VITE_LIFE_PROJECT_ENABLED: 'true' },
      },
    },
  },
};

test('resolved Compose assertion accepts the exact V6-H environment', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-v6h-compose-'));
  const configPath = path.join(directory, 'compose.json');
  fs.writeFileSync(configPath, JSON.stringify(validConfig));

  try {
    const output = execFileSync(process.execPath, [assertionScript, configPath], { encoding: 'utf8' });
    assert.match(output, /satisfies V6-H/u);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('resolved Compose assertion rejects a historical capability override', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-v6h-compose-invalid-'));
  const configPath = path.join(directory, 'compose.json');
  fs.writeFileSync(configPath, JSON.stringify({
    ...validConfig,
    services: {
      ...validConfig.services,
      api: {
        environment: {
          ...validConfig.services.api.environment,
          LIFE_PROJECT_API_ENABLED: 'false',
          RIASEC_API_ENABLED: 'true',
        },
      },
    },
  }));

  try {
    const result = spawnSync(process.execPath, [assertionScript, configPath], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /LIFE_PROJECT_API_ENABLED/u);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('versioned Compose override contains every V6-H boundary', () => {
  const override = fs.readFileSync(overridePath, 'utf8');
  for (const expected of [
    'AUTH_V1_ENABLED: "true"',
    'LIFE_PROJECT_API_ENABLED: "true"',
    'VITE_LIFE_PROJECT_ENABLED: "true"',
    'LEGACY_AUTH_ENABLED: "false"',
    'RIASEC_API_ENABLED: "false"',
    'CAREER_API_ENABLED: "false"',
    'CV_API_V1_ENABLED: "false"',
    'FEATURE_CHATBOT: "false"',
    'FEATURE_ANALYTICS: "false"',
  ]) {
    assert.ok(override.includes(expected), expected);
  }
});
