'use strict';

const fs = require('node:fs');

const [configPath] = process.argv.slice(2);
if (!configPath) {
  process.stderr.write('Usage: node assert-life-project-compose-config.cjs CONFIG_JSON\n');
  process.exit(2);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const api = config?.services?.api;
const web = config?.services?.web;

if (!api || !web) {
  throw new Error('Resolved Compose configuration must contain api and web services.');
}

const environment = api.environment || {};
const buildArgs = web.build?.args || {};

const expectedEnvironment = Object.freeze({
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
});

for (const [key, expected] of Object.entries(expectedEnvironment)) {
  const actual = String(environment[key] ?? '');
  if (actual !== expected) {
    throw new Error(`Resolved api environment mismatch for ${key}: expected ${expected}, received ${actual || 'missing'}.`);
  }
}

if (String(buildArgs.VITE_LIFE_PROJECT_ENABLED ?? '') !== 'true') {
  throw new Error('Resolved web build argument VITE_LIFE_PROJECT_ENABLED must be true.');
}

process.stdout.write('Resolved Compose configuration satisfies V6-H.\n');
