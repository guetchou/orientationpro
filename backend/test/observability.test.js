'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createJsonLogger, sanitizeEvent } = require('../src/observability/logger');
const { resolveRequestId } = require('../src/observability/correlation');
const {
  MAX_ROUTE_TEMPLATES,
  createMetricsRegistry,
  normalizeRoute,
} = require('../src/observability/metrics');

test('structured logs use an allowlist and redact sensitive canaries', () => {
  let output = '';
  const logger = createJsonLogger({
    write: (line) => { output += line; },
    clock: () => new Date('2026-07-29T00:00:00.000Z'),
    routeTemplates: ['/api/v1/profile'],
  });
  logger.write({
    event: 'request.completed',
    requestId: '550e8400-e29b-41d4-a716-446655440000',
    route: '/api/v1/profile?email=person@example.test',
    statusCode: 200,
    authorization: 'Bearer secret-canary',
    result: 'document token secret-canary',
    body: { email: 'person@example.test' },
  });

  const parsed = JSON.parse(output);
  assert.equal(parsed.timestamp, '2026-07-29T00:00:00.000Z');
  assert.equal(parsed.authorization, undefined);
  assert.equal(parsed.body, undefined);
  assert.equal(parsed.result, undefined);
  assert.equal(parsed.route, '/api/v1/profile');
  assert.doesNotMatch(output, /secret-canary|person@example\.test/);
});

test('sanitizer validates each field contract independently', () => {
  const sanitized = sanitizeEvent({
    event: 'request.completed',
    requestId: 24242424,
    durationMs: 12.5,
    route: '/api/v1/search?q=alice-987654',
    errorCode: 'OPAQUE987654',
    statusCode: 987654,
  }, {
    routeTemplates: ['/api/v1/search'],
  });
  assert.deepEqual(sanitized, {
    event: 'request.completed',
    durationMs: 12.5,
    route: '/api/v1/search',
  });
});

test('correlation identifiers accept only bounded safe values', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';
  assert.equal(resolveRequestId(uuid), uuid);
  assert.equal(resolveRequestId('bad id', () => 'generated-id'), 'generated-id');
  assert.equal(resolveRequestId('Bearer secret', () => 'generated-id'), 'generated-id');
});

test('metrics remove identifiers and expose bounded label dimensions', () => {
  const routeTemplate = '/api/v1/life-projects/:projectId/actions/:actionId';
  const registry = createMetricsRegistry({ routeTemplates: [routeTemplate] });
  registry.recordRequest({
    method: 'GET',
    route: '/api/v1/life-projects/project-secret-987654/actions/550e8400-e29b-41d4-a716-446655440000?q=private',
    statusCode: 404,
    durationMs: 81,
  });
  assert.equal(
    normalizeRoute(
      '/api/v1/life-projects/project-secret-987654/actions/550e8400-e29b-41d4-a716-446655440000?q=private',
      [routeTemplate],
    ),
    routeTemplate,
  );
  assert.deepEqual(registry.snapshot(), {
    requests: { [`GET|${routeTemplate}|4xx`]: 1 },
    latencyBuckets: { [`GET|${routeTemplate}|100`]: 1 },
  });
});

test('metrics cardinality stays bounded under attacker-controlled paths and statuses', () => {
  const routeTemplate = '/api/v1/search/:term';
  const registry = createMetricsRegistry({ routeTemplates: [routeTemplate] });
  for (let index = 0; index < 1_000; index += 1) {
    registry.recordRequest({
      method: 'GET',
      route: `/api/v1/search/person-${index}?q=private-${index}`,
      statusCode: 200,
      durationMs: 10,
    });
  }
  registry.recordRequest({
    method: 'GET',
    route: '/unregistered/person-secret',
    statusCode: 987654,
    durationMs: -1,
  });

  assert.deepEqual(registry.snapshot(), {
    requests: {
      [`GET|${routeTemplate}|2xx`]: 1_000,
      'GET|unknown|unknown': 1,
    },
    latencyBuckets: {
      [`GET|${routeTemplate}|25`]: 1_000,
      'GET|unknown|unknown': 1,
    },
  });

  assert.throws(
    () => createMetricsRegistry({
      routeTemplates: Array.from(
        { length: MAX_ROUTE_TEMPLATES + 1 },
        (_, index) => `/route-${index}`,
      ),
    }),
    /OBSERVABILITY_ROUTE_TEMPLATES_LIMIT/,
  );
});
