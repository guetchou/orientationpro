'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  createMemoryRateLimiter,
  createOpaqueKeyFactory,
} = require('../src/security/rate-limit');

const response = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    body: null,
    setHeader: (name, value) => headers.set(name, value),
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    headers,
  };
};

test('rate limiter allows the configured quota then returns stable 429', () => {
  let now = 1_000;
  const limiter = createMemoryRateLimiter({
    max: 2,
    windowMs: 1_000,
    clock: () => now,
    keyGenerator: () => 'opaque-key',
    scope: 'auth',
  });
  const request = { ip: '198.51.100.4' };
  let nextCalls = 0;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const res = response();
    limiter(request, res, () => { nextCalls += 1; });
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers.get('RateLimit-Remaining'), String(2 - attempt));
  }

  const blocked = response();
  limiter(request, blocked, () => { nextCalls += 1; });
  assert.equal(nextCalls, 2);
  assert.equal(blocked.statusCode, 429);
  assert.deepEqual(blocked.body, {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Trop de requêtes. Réessayez plus tard.',
    scope: 'auth',
  });
  assert.equal(blocked.headers.get('Retry-After'), '1');

  now = 2_001;
  const reset = response();
  limiter(request, reset, () => { nextCalls += 1; });
  assert.equal(reset.statusCode, 200);
  assert.equal(nextCalls, 3);
});

test('rate limiter bounds key cardinality and fails closed at capacity', () => {
  let key = 'key-one';
  const limiter = createMemoryRateLimiter({
    max: 10,
    maxEntries: 1,
    windowMs: 60_000,
    clock: () => 1_000,
    keyGenerator: () => key,
    scope: 'general',
  });
  let nextCalls = 0;
  limiter({}, response(), () => { nextCalls += 1; });
  key = 'key-two';
  const saturated = response();
  limiter({}, saturated, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(saturated.statusCode, 503);
  assert.deepEqual(saturated.body, {
    success: false,
    code: 'RATE_LIMIT_CAPACITY_EXCEEDED',
    message: 'Le service limite temporairement les nouvelles requêtes.',
    scope: 'general',
  });
  assert.deepEqual(limiter.snapshot(), {
    entries: 1,
    windowMs: 60_000,
    max: 10,
    maxEntries: 1,
  });
});

test('opaque keys separate IP and authenticated account without exposing either value', () => {
  const factory = createOpaqueKeyFactory({ secret: 's'.repeat(32), scope: 'expensive' });
  const first = factory({ ip: '203.0.113.7', auth: { account: { id: 'account-one' } } });
  const second = factory({ ip: '203.0.113.7', auth: { account: { id: 'account-two' } } });
  assert.notEqual(first, second);
  assert.doesNotMatch(first, /203\.0\.113\.7|account-one/);
  assert.match(first, /^[0-9a-f]{64}$/);
});

test('invalid quotas, capacity and weak explicit secrets fail closed', () => {
  assert.throws(() => createMemoryRateLimiter({ max: 0 }), /RATE_LIMIT_MAX_INVALID/);
  assert.throws(() => createMemoryRateLimiter({ maxEntries: 0 }), /RATE_LIMIT_MAX_ENTRIES_INVALID/);
  assert.throws(
    () => createOpaqueKeyFactory({ secret: 'short' }),
    /RATE_LIMIT_SECRET_TOO_SHORT/,
  );
});
