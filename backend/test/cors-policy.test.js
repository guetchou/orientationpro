'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { CorsOriginRejectedError, createCorsOriginValidator } = require('../src/security/cors-policy');

test('allows requests with no Origin header (server-to-server, curl)', () => {
  const validate = createCorsOriginValidator(new Set(['https://makoki.example']));
  validate(undefined, (err, allowed) => {
    assert.equal(err, null);
    assert.equal(allowed, true);
  });
});

test('allows an origin present in the allow-list', () => {
  const validate = createCorsOriginValidator(new Set(['https://makoki.example']));
  validate('https://makoki.example', (err, allowed) => {
    assert.equal(err, null);
    assert.equal(allowed, true);
  });
});

test('rejects an origin absent from the allow-list with a typed 403 error, not a generic 500', () => {
  const validate = createCorsOriginValidator(new Set(['https://makoki.example']));
  validate('https://evil.example', (err, allowed) => {
    assert.ok(err instanceof CorsOriginRejectedError);
    assert.equal(err.statusCode, 403);
    assert.equal(err.code, 'CORS_ORIGIN_NOT_ALLOWED');
    assert.equal(allowed, undefined);
  });
});
