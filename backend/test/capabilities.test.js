const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const {
  SCHEMA_VERSION,
  assertCapabilityConfiguration,
  createCapabilityRegistry,
} = require('../src/capabilities/registry');
const { createCapabilitiesRouter } = require('../src/capabilities/router');

const request = async (app, path) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const byId = (registry, id) => registry.capabilities.find((entry) => entry.id === id);

test('capability registry is deterministic and never exposes environment values', () => {
  const env = {
    AUTH_V1_ENABLED: 'true',
    RIASEC_API_ENABLED: 'true',
    CAREER_API_ENABLED: 'true',
    CV_API_V1_ENABLED: 'true',
    LIFE_PROJECT_API_ENABLED: 'true',
    DATA_RIGHTS_API_ENABLED: 'true',
    LEGACY_AUTH_ENABLED: 'false',
    DB_PASSWORD: 'must-never-leak',
  };

  const first = createCapabilityRegistry(env);
  const second = createCapabilityRegistry({ ...env });

  assert.deepEqual(first, second);
  assert.equal(first.schemaVersion, SCHEMA_VERSION);
  assert.equal(first.configurationValid, true);
  assert.equal(JSON.stringify(first).includes('must-never-leak'), false);
  assert.equal(byId(first, 'identity.auth-v1').status, 'active');
  assert.equal(byId(first, 'orientation.riasec').status, 'experimental');
  assert.equal(byId(first, 'career.recommendations').status, 'active');
  assert.equal(byId(first, 'cv.analysis-v1').status, 'active');
  assert.equal(byId(first, 'privacy.data-rights-v1').status, 'experimental');
  assert.equal(byId(first, 'privacy.data-rights-v1').configured, true);
  assert.equal(byId(first, 'identity.auth-legacy').status, 'disabled');
  assert.equal(byId(first, 'life-project.core-v1').status, 'experimental');
  assert.equal(byId(first, 'life-project.core-v1').configured, true);
  assert.equal(byId(first, 'life-project.core-v1').version, 'makoki-life-project-api-v1');
  assert.ok(byId(first, 'life-project.core-v1').publicLimitations
    .some((entry) => entry.includes('Parcours autonome unique')));
  assert.deepEqual(byId(first, 'life-project.core-v1').dependencies, [
    'identity.auth-v1',
    'orientation.riasec',
  ]);
});

test('life-project activation embeds RIASEC even when the standalone flag is disabled', () => {
  const registry = createCapabilityRegistry({
    AUTH_V1_ENABLED: 'true',
    LIFE_PROJECT_API_ENABLED: 'true',
    RIASEC_API_ENABLED: 'false',
  });

  assert.equal(byId(registry, 'life-project.core-v1').configured, true);
  assert.equal(byId(registry, 'orientation.riasec').configured, true);
  assert.equal(byId(registry, 'orientation.riasec').status, 'experimental');
  assert.equal(byId(registry, 'orientation.riasec').configuration.key, 'LIFE_PROJECT_API_ENABLED');
  assert.ok(byId(registry, 'orientation.riasec').publicLimitations
    .some((entry) => entry.includes('Étape intégrée')));
});

test('disabled configuration produces explicit disabled capabilities', () => {
  const registry = createCapabilityRegistry({});

  assert.equal(byId(registry, 'identity.auth-v1').configured, false);
  assert.equal(byId(registry, 'profile.core-v1').status, 'disabled');
  assert.equal(byId(registry, 'orientation.riasec').status, 'disabled');
  assert.equal(byId(registry, 'career.recommendations').status, 'disabled');
  assert.equal(byId(registry, 'cv.analysis-v1').status, 'disabled');
  assert.equal(byId(registry, 'privacy.data-rights-v1').status, 'disabled');
  assert.equal(byId(registry, 'life-project.core-v1').status, 'disabled');
});

test('dependent APIs cannot be configured without Auth V1', () => {
  for (const [key, capabilityId] of [
    ['RIASEC_API_ENABLED', 'orientation.riasec'],
    ['CAREER_API_ENABLED', 'career.recommendations'],
    ['CV_API_V1_ENABLED', 'cv.analysis-v1'],
    ['LIFE_PROJECT_API_ENABLED', 'life-project.core-v1'],
    ['DATA_RIGHTS_API_ENABLED', 'privacy.data-rights-v1'],
  ]) {
    assert.throws(
      () => assertCapabilityConfiguration({ [key]: 'true' }),
      (error) => {
        assert.equal(error.code, 'CAPABILITY_CONFIGURATION_INVALID');
        assert.equal(error.details[0].capabilityId, capabilityId);
        assert.equal(error.details[0].requiredConfiguration, 'AUTH_V1_ENABLED');
        return true;
      },
    );
  }
});

test('public endpoint exposes the versioned registry without caching', async () => {
  const app = express();
  app.use('/api/v1/capabilities', createCapabilitiesRouter({
    env: {
      AUTH_V1_ENABLED: 'true',
      RIASEC_API_ENABLED: 'true',
      CAREER_API_ENABLED: 'false',
      CV_API_V1_ENABLED: 'false',
      LIFE_PROJECT_API_ENABLED: 'false',
      DATA_RIGHTS_API_ENABLED: 'false',
      LEGACY_AUTH_ENABLED: 'false',
    },
  }));

  const response = await request(app, '/api/v1/capabilities');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(body.schemaVersion, SCHEMA_VERSION);
  assert.equal(byId(body, 'orientation.riasec').status, 'experimental');
  assert.equal(byId(body, 'career.recommendations').status, 'disabled');
  assert.equal(byId(body, 'privacy.data-rights-v1').status, 'disabled');
  assert.equal(byId(body, 'life-project.core-v1').status, 'disabled');
});
