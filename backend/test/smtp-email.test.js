const test = require('node:test');
const assert = require('node:assert/strict');

const { createSmtpEmailAdapter } = require('../src/auth-v1/smtp-email');

const env = {
  APP_WEB_URL: 'https://makoki.org',
  SMTP_FROM: 'MAKOKI <no-reply@makoki.org>',
  SMTP_ENVELOPE_FROM: 'bounce@makoki.org',
};

test('verification email requires explicit SMTP recipient acceptance and logs sanitized delivery', async () => {
  const logs = [];
  const transporter = {
    sendMail: async (message) => ({
      messageId: '<first@example>',
      accepted: ['person@example.com'],
      rejected: [],
      pending: [],
      response: '250 2.0.0 queued as 123',
      envelope: message.envelope,
    }),
    verify: async () => true,
  };
  const adapter = createSmtpEmailAdapter(env, {
    transporter,
    logger: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });

  const result = await adapter.sendVerification({ email: 'person@example.com', token: 'secret-token' });

  assert.equal(result.messageId, '<first@example>');
  assert.deepEqual(result.accepted, ['pe***@example.com']);
  assert.equal(logs[0][0], 'auth_email_delivery_accepted');
  assert.doesNotMatch(JSON.stringify(logs), /secret-token/);
  assert.doesNotMatch(JSON.stringify(logs), /person@example\.com/);
});

test('verification resend rejects misleading SMTP success when recipient is rejected', async () => {
  const logs = [];
  const transporter = {
    sendMail: async (message) => ({
      messageId: '<resend@example>',
      accepted: [],
      rejected: ['person@example.com'],
      pending: [],
      response: '550 5.7.1 rejected',
      envelope: message.envelope,
    }),
  };
  const adapter = createSmtpEmailAdapter(env, {
    transporter,
    logger: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });

  await assert.rejects(
    adapter.sendVerification({ email: 'person@example.com', token: 'resend-secret' }),
    { code: 'SMTP_RECIPIENT_NOT_ACCEPTED' },
  );
  assert.equal(logs[0][0], 'auth_email_delivery_not_accepted');
  assert.doesNotMatch(JSON.stringify(logs), /resend-secret/);
});

test('transport errors are propagated and logged without credentials or tokens', async () => {
  const logs = [];
  const smtpError = Object.assign(new Error('authentication failed'), {
    code: 'EAUTH',
    responseCode: 535,
    command: 'AUTH PLAIN',
    response: '535 authentication credentials invalid',
  });
  const transporter = { sendMail: async () => { throw smtpError; } };
  const adapter = createSmtpEmailAdapter(env, {
    transporter,
    logger: { info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
  });

  await assert.rejects(
    adapter.sendVerification({ email: 'person@example.com', token: 'never-log-me' }),
    smtpError,
  );
  assert.equal(logs[0][0], 'auth_email_delivery_failed');
  assert.doesNotMatch(JSON.stringify(logs), /never-log-me|person@example\.com/);
});
