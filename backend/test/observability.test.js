'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createJsonLogger, sanitizeEvent } = require('../src/observability/logger');
const { resolveRequestId } = require('../src/observability/correlation');
const { createMetricsRegistry, normalizeRoute } = require('../src/observability/metrics');

test('structured logs use an allowlist and redact sensitive canaries', () => {
  let output = '';
  const logger = createJsonLogger({
    write: (line) => { output += line; },
    clock: () => new Date('2026-07-29T00:00:00.000Z'),
  });
  logger.write({
    event: 'request.completed',
    requestId: 'request-12345678',
    route: '/api/v1/profile',
    statusCode: 200,
    authorization: 'Bearer secret-canary',
    result: 'document token secret-canary',
    body: { email: 'person@example.test' },
  });

  const parsed = JSON.parse(output);
  assert.equal(parsed.timestamp, '2026-07-29T00:00:00.000Z');
  assert.equal(parsed.authorization, undefined);
  assert.equal(parsed.body, undefined);
  assert.equal(parsed.result, '[REDACTED]');
  assert.doesNotMatch(output, /secret-canary|person@example\.test/);
});

test('sanitizer rejects objects and bounds strings', () => {
  const sanitized = sanitizeEvent({
    event: 'x'.repeat(300),
    durationMs: 12.5,
    route: { raw: '/secret' },
  });
  assert.equal(sanitized.event.length, 160);
  assert.equal(sanitized.durationMs, 12.5);
  assert.equal(sanitized.route, undefined);
});

test('correlation identifiers accept only bounded safe values', () => {
  assert.equal(resolveRequestId('client-request-123'), 'client-request-123');
  assert.equal(resolveRequestId('bad id', () => 'generated-id'), 'generated-id');
  assert.equal(resolveRequestId('Bearer secret', () => 'generated-id'), 'generated-id');
});

test('metrics remove identifiers and expose bounded label dimensions', () => {
  const registry = createMetricsRegistry();
  registry.recordRequest({
    method: 'GET',
    route: '/api/v1/life-projects/123/actions/550e8400-e29b-41d4-a716-446655440000',
    statusCode: 404,
    durationMs: 81,
  });
  assert.equal(
    normalizeRoute('/api/v1/life-projects/123/actions/550e8400-e29b-41d4-a716-446655440000'),
    '/api/v1/life-projects/:id/actions/:id',
  );
  assert.deepEqual(registry.snapshot(), {
    requests: { 'GET|/api/v1/life-projects/:id/actions/:id|4xx': 1 },
    latencyBuckets: { 'GET|/api/v1/life-projects/:id/actions/:id|100': 1 },
  });
});
