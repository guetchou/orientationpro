'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  LEGACY_ROUTE_MOUNTS,
  isLegacyApiEnabled,
  mountLegacyApi,
} = require('../src/security/legacy-api');

const createRoutes = () => Object.fromEntries(
  LEGACY_ROUTE_MOUNTS.map(({ key }) => [key, { key }]),
);

test('legacy APIs fail closed unless explicitly enabled', () => {
  assert.equal(isLegacyApiEnabled({}), false);
  assert.equal(isLegacyApiEnabled({ LEGACY_API_ENABLED: 'false' }), false);
  assert.equal(isLegacyApiEnabled({ LEGACY_API_ENABLED: 'TRUE' }), false);
  assert.equal(isLegacyApiEnabled({ LEGACY_API_ENABLED: 'true' }), true);

  const mounted = [];
  const result = mountLegacyApi({
    app: { use: (...args) => mounted.push(args) },
    env: { LEGACY_API_ENABLED: 'false' },
    routes: createRoutes(),
  });
  assert.deepEqual(result, []);
  assert.deepEqual(mounted, []);
});

test('explicit enable mounts the complete reviewed legacy route set', () => {
  const mounted = [];
  const routes = createRoutes();
  const result = mountLegacyApi({
    app: { use: (path, router) => mounted.push({ path, router }) },
    env: { LEGACY_API_ENABLED: 'true' },
    routes,
  });

  assert.deepEqual(result, LEGACY_ROUTE_MOUNTS.map(({ path }) => path));
  assert.deepEqual(
    mounted.map(({ path }) => path),
    LEGACY_ROUTE_MOUNTS.map(({ path }) => path),
  );
  for (const { key } of LEGACY_ROUTE_MOUNTS) {
    assert.equal(mounted.find(({ router }) => router === routes[key])?.router, routes[key]);
  }
});

test('enabled legacy API refuses an incomplete route inventory', () => {
  assert.throws(
    () => mountLegacyApi({
      app: { use: () => undefined },
      env: { LEGACY_API_ENABLED: 'true' },
      routes: {},
    }),
    /LEGACY_API_ROUTE_REQUIRED:cv/,
  );
});
