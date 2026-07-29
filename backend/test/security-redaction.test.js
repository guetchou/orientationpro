'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { REDACTED, redactForLog, redactText } = require('../src/security/redaction');

test('serializes only explicitly allowlisted structured fields', () => {
  const input = {
    requestId: 'req-123',
    authorization: 'Bearer access-value',
    note: 'person@example.test secret=raw-value',
    profile: { email: 'person@example.test', answers: ['sensitive answer'] },
    metadata: {
      attempt: 2,
      response: 'raw document',
      note: 'Cookie: session=private',
    },
  };

  assert.deepEqual(redactForLog(input), {
    requestId: 'req-123',
    metadata: { attempt: 2 },
  });
  assert.equal(input.profile.email, 'person@example.test');
});

test('redacts bearer, email, cookie and labeled secrets in allowed messages', () => {
  const error = new Error(
    'person@example.test Cookie: session=private secret=raw Bearer abc.def.ghi',
  );
  error.code = 'secret=private';
  const output = redactForLog(error);

  assert.deepEqual(output, {
    name: 'Error',
    message: `${REDACTED} Cookie: ${REDACTED}`,
    code: `secret=${REDACTED}`,
  });
  assert.equal(
    redactText('response=raw-cv answer=private'),
    `response=${REDACTED} answer=${REDACTED}`,
  );
  assert.equal(redactForLog('sk-test-private-value'), REDACTED);
});

test('never serializes buffers or circular allowlisted values', () => {
  const metadata = { attempt: 1 };
  metadata.metadata = metadata;

  assert.deepEqual(redactForLog({
    metadata,
    note: Buffer.from('private document'),
  }), {
    metadata: {
      attempt: 1,
      metadata: '[CIRCULAR]',
    },
  });
  assert.equal(redactForLog(Buffer.from('private document')), '[BUFFER 16 bytes]');
});
