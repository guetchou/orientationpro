const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const jwt = require('jsonwebtoken');

const { createSessionAuthenticator } = require('../src/auth-v1/authenticate');

const jwtSecret = 'test-jwt-secret-with-at-least-32-characters';

const request = async (app, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}/private`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const accessToken = ({
  issuer = 'orientationpro-api',
  audience = 'orientationpro-clients',
} = {}) => jwt.sign(
  { roles: ['user'], sid: 'session-1' },
  jwtSecret,
  {
    subject: 'account-1',
    expiresIn: 15 * 60,
    issuer,
    audience,
    algorithm: 'HS256',
  },
);

const createApp = (store) => {
  const app = express();
  app.get('/private', createSessionAuthenticator({ store, jwtSecret }), (req, res) => {
    res.status(200).json({ auth: req.auth });
  });
  app.use((error, req, res, next) => {
    res.status(503).json({ error: { code: 'DEPENDENCY_FAILURE', message: error.message } });
  });
  return app;
};

test('invalid access tokens are rejected before database validation', async () => {
  let validationCalled = false;
  const response = await request(createApp({
    findActiveSession: async () => {
      validationCalled = true;
    },
  }), {
    headers: { authorization: 'Bearer invalid-token' },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'INVALID_SESSION');
  assert.equal(validationCalled, false);
});

test('missing bearer credentials are rejected before database validation', async () => {
  let validationCalled = false;
  const response = await request(createApp({
    findActiveSession: async () => {
      validationCalled = true;
    },
  }));
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'SESSION_REQUIRED');
  assert.equal(validationCalled, false);
});

test('tokens issued for another API are rejected before database validation', async () => {
  let validationCalled = false;
  const response = await request(createApp({
    findActiveSession: async () => {
      validationCalled = true;
    },
  }), {
    headers: {
      authorization: `Bearer ${accessToken({
        issuer: 'another-api',
        audience: 'another-client',
      })}`,
    },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'INVALID_SESSION');
  assert.equal(validationCalled, false);
});

test('a revoked or expired server-side session is rejected', async () => {
  const response = await request(createApp({
    findActiveSession: async () => null,
  }), {
    headers: { authorization: `Bearer ${accessToken()}` },
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'INVALID_SESSION');
});

test('an active server-side session populates the authenticated account context', async () => {
  const response = await request(createApp({
    findActiveSession: async ({ sessionId, accountId }) => ({
      session: { id: sessionId },
      account: {
        id: accountId,
        email: 'person@example.test',
        status: 'active',
        roles: ['user'],
      },
    }),
  }), {
    headers: { authorization: `Bearer ${accessToken()}` },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.auth.account.id, 'account-1');
  assert.equal(body.auth.sessionId, 'session-1');
});

test('database failures are forwarded instead of being disguised as invalid credentials', async () => {
  const response = await request(createApp({
    findActiveSession: async () => {
      throw new Error('database unavailable');
    },
  }), {
    headers: { authorization: `Bearer ${accessToken()}` },
  });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.error.code, 'DEPENDENCY_FAILURE');
  assert.equal(body.error.message, 'database unavailable');
});
