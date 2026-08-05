'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const jwt = require('jsonwebtoken');

const {
  createCookieSessionMiddleware,
  normalizeAllowedOrigins,
} = require('../src/auth-v1/cookie-session');
const { parseOriginList } = require('../src/auth-v1/bootstrap');
const {
  accessTokenFromRequest,
  createSessionResolver,
} = require('../src/auth-v1/authenticate');

const request = async (app, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}/api/v1/auth/refresh`, {
      method: 'POST',
      ...options,
    });
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const createApp = () => {
  const app = express();
  app.use(createCookieSessionMiddleware({
    frontendUrl: 'https://makoki.org',
    allowedOrigins: ['https://www.makoki.org', 'not-a-url'],
    cookieSecure: true,
  }));
  app.post('/api/v1/auth/refresh', (_req, res) => res.status(200).json({ ok: true }));
  return app;
};

const jwtSecret = 'test-jwt-secret-with-at-least-32-characters';
const accessToken = jwt.sign(
  { sid: 'session-1' },
  jwtSecret,
  {
    subject: 'account-1',
    issuer: 'orientationpro-api',
    audience: 'orientationpro-clients',
    algorithm: 'HS256',
    expiresIn: '15m',
  },
);

const activeSession = {
  account: {
    id: 'account-1',
    email: 'person@example.test',
    status: 'active',
    roles: ['user'],
  },
  session: { id: 'session-1' },
};

test('normalizes and deduplicates explicitly configured frontend origins', () => {
  const origins = normalizeAllowedOrigins(
    'https://makoki.org/path',
    ['https://www.makoki.org/login', 'https://makoki.org', 'invalid'],
  );
  assert.deepEqual([...origins].sort(), [
    'https://makoki.org',
    'https://www.makoki.org',
  ]);
  assert.deepEqual(parseOriginList(' https://makoki.org,https://www.makoki.org ,, '), [
    'https://makoki.org',
    'https://www.makoki.org',
  ]);
});

test('accepts the canonical frontend origin for a production mutation', async () => {
  const response = await request(createApp(), {
    headers: { Origin: 'https://makoki.org' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test('accepts an explicitly configured alternate public origin after OAuth return', async () => {
  const response = await request(createApp(), {
    headers: { Origin: 'https://www.makoki.org' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test('rejects an unconfigured foreign origin', async () => {
  const response = await request(createApp(), {
    headers: { Origin: 'https://attacker.example' },
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'CSRF_ORIGIN_REJECTED');
});

test('rejects a production mutation without Origin', async () => {
  const response = await request(createApp());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'CSRF_ORIGIN_REJECTED');
});

test('reads the access token directly from the HttpOnly cookie for protected routes', () => {
  const req = {
    headers: {
      cookie: `other=value; orientationpro_access=${encodeURIComponent(accessToken)}`,
    },
  };
  assert.equal(accessTokenFromRequest(req), accessToken);
});

test('keeps bearer authentication for API clients and gives it precedence', () => {
  const bearer = jwt.sign(
    { sid: 'session-bearer' },
    jwtSecret,
    {
      subject: 'account-1',
      issuer: 'orientationpro-api',
      audience: 'orientationpro-clients',
      algorithm: 'HS256',
      expiresIn: '15m',
    },
  );
  const req = {
    headers: {
      authorization: `Bearer ${bearer}`,
      cookie: `orientationpro_access=${encodeURIComponent(accessToken)}`,
    },
  };
  assert.equal(accessTokenFromRequest(req), bearer);
});

test('resolves an authenticated protected API session from the access cookie', async () => {
  const calls = [];
  const resolver = createSessionResolver({
    jwtSecret,
    store: {
      findActiveSession: async (input) => {
        calls.push(input);
        return activeSession;
      },
    },
  });

  const result = await resolver({
    headers: {
      cookie: `orientationpro_access=${encodeURIComponent(accessToken)}`,
    },
  });

  assert.equal(result.status, 'authenticated');
  assert.deepEqual(result.auth.account.roles, ['user']);
  assert.equal(result.auth.sessionId, 'session-1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].accountId, 'account-1');
  assert.equal(calls[0].sessionId, 'session-1');
});
