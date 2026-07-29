'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const { createHttpObservability } = require('../src/observability/http');
const { createJsonLogger } = require('../src/observability/logger');
const { createMetricsRegistry } = require('../src/observability/metrics');

const createResponse = () => {
  const response = new EventEmitter();
  response.statusCode = 200;
  response.headers = new Map();
  response.setHeader = (name, value) => response.headers.set(name, value);
  return response;
};

test('runtime correlation and logs exclude request secrets and free-form payloads', () => {
  let output = '';
  let now = 100;
  const logger = createJsonLogger({
    write: (line) => { output += line; },
    clock: () => new Date('2026-07-29T00:00:00.000Z'),
  });
  const metrics = createMetricsRegistry();
  const runtime = createHttpObservability({ logger, metrics, clock: () => now });
  const request = {
    method: 'POST',
    path: '/api/v1/profile',
    originalUrl: '/api/v1/profile?email=canary@example.test',
    headers: {
      authorization: 'Bearer token-canary',
      'x-request-id': 'safe-request-1234',
    },
    body: { document: 'document-canary', answer: 'answer-canary' },
    get(name) { return this.headers[name.toLowerCase()]; },
  };
  const response = createResponse();
  let nextCalled = false;

  runtime.requestMiddleware(request, response, () => { nextCalled = true; });
  now = 145;
  response.emit('finish');

  assert.equal(nextCalled, true);
  assert.equal(request.requestId, 'safe-request-1234');
  assert.equal(response.headers.get('X-Request-Id'), 'safe-request-1234');
  assert.match(output, /request\.completed/);
  assert.doesNotMatch(output, /token-canary|canary@example\.test|document-canary|answer-canary/);
  assert.deepEqual(metrics.snapshot(), {
    requests: { 'POST|/api/v1/profile|2xx': 1 },
    latencyBuckets: { 'POST|/api/v1/profile|50': 1 },
  });
});

test('error logging emits only a bounded technical code', () => {
  let output = '';
  const runtime = createHttpObservability({
    logger: createJsonLogger({ write: (line) => { output += line; } }),
    metrics: createMetricsRegistry(),
  });
  runtime.logError({
    request: {
      requestId: 'safe-request-1234',
      method: 'POST',
      path: '/api/v1/cv/analyses',
      body: { email: 'private@example.test' },
    },
    error: Object.assign(new Error('Bearer token-canary private@example.test'), { code: 'UPLOAD_REJECTED' }),
    statusCode: 413,
  });

  const event = JSON.parse(output);
  assert.equal(event.errorCode, 'UPLOAD_REJECTED');
  assert.equal(event.statusCode, 413);
  assert.doesNotMatch(output, /token-canary|private@example\.test|Bearer/);
});
