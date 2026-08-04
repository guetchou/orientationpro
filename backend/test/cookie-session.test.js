'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const {
  createCookieSessionMiddleware,
  normalizeAllowedOrigins,
} = require('../src/auth-v1/cookie-session');
const { parseOriginList } = require('../src/auth-v1/bootstrap');

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
