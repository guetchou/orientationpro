'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { REDACTED, redactForLog, redactText } = require('../src/security/redaction');

test('redacts sensitive fields recursively without mutating input', () => {
  const input = {
    requestId: 'req-123',
    authorization: 'Bearer access-value',
    profile: { email: 'person@example.test', answers: ['sensitive answer'] },
    metadata: { attempt: 2 },
  };
  assert.deepEqual(redactForLog(input), {
    requestId: 'req-123',
    authorization: REDACTED,
    profile: { email: REDACTED, answers: REDACTED },
    metadata: { attempt: 2 },
  });
  assert.equal(input.profile.email, 'person@example.test');
});

test('redacts bearer credentials embedded in error messages', () => {
  const output = redactForLog(new Error('upstream rejected Bearer abc.def.ghi'));
  assert.deepEqual(output, {
    name: 'Error',
    message: `upstream rejected Bearer ${REDACTED}`,
    code: undefined,
  });
  assert.equal(redactText('Bearer opaque-token'), `Bearer ${REDACTED}`);
});

test('never serializes buffers or circular values', () => {
  const input = { raw: Buffer.from('private document') };
  input.self = input;
  assert.deepEqual(redactForLog(input), {
    raw: '[BUFFER 16 bytes]',
    self: '[CIRCULAR]',
  });
});
