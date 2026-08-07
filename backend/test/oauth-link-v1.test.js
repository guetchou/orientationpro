const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createAuthRouter } = require('../src/auth-v1');

const request = async (app, path, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`, {
      redirect: 'manual',
      ...options,
    });
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
};

const createLinkApp = ({ store, providers, sessionResolver }) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: {},
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
    oauthProviders: providers,
    frontendUrl: 'https://makoki.example',
    oauthCallbackBaseUrl: 'https://api.makoki.example',
    sessionResolver,
    oauthLinkReturnPath: '/parametres',
  }));
  return app;
};

const authorizationUrl = ({ state }) => `https://provider.example/authorize?state=${state}`;
const authenticated = async () => ({ status: 'authenticated', auth: { account: { id: 'acc-1' } } });

test('link/start refuses an unauthenticated request', async () => {
  const app = createLinkApp({
    store: {},
    providers: { google: { authorizationUrl } },
    sessionResolver: async () => ({ status: 'missing' }),
  });
  const res = await request(app, '/api/v1/auth/oauth/google/link/start', { method: 'POST' });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'SESSION_REQUIRED');
});

test('link/start (authenticated) returns an authorization URL and stamps the account on the transaction', async () => {
  let transaction;
  const app = createLinkApp({
    store: { saveOAuthTransaction: async (input) => { transaction = input; } },
    providers: { meta: { authorizationUrl } },
    sessionResolver: authenticated,
  });
  const res = await request(app, '/api/v1/auth/oauth/meta/link/start', { method: 'POST' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.match(body.authorizationUrl, /^https:\/\/provider\.example\/authorize/);
  assert.equal(transaction.provider, 'meta');
  assert.equal(transaction.accountId, 'acc-1');
  assert.match(res.headers.get('set-cookie'), /^orientationpro_oauth_state=/);
});

test('callback links the identity to the account (no session) and returns to settings', async () => {
  let transaction;
  let linkInput;
  const store = {
    saveOAuthTransaction: async (input) => { transaction = input; },
    consumeOAuthTransaction: async () => ({
      accountId: transaction.accountId,
      nonce: transaction.nonce,
      codeVerifier: transaction.codeVerifier,
    }),
    linkOAuthIdentity: async (input) => { linkInput = input; return { status: 'linked' }; },
    createSession: async () => { throw new Error('linking must not create a login session'); },
  };
  const providers = {
    meta: {
      authorizationUrl,
      exchange: async () => ({ provider: 'meta', subject: 'fb-123', email: 'Person@Example.Test', emailVerified: true }),
    },
  };
  const app = createLinkApp({ store, providers, sessionResolver: authenticated });

  const start = await request(app, '/api/v1/auth/oauth/meta/link/start', { method: 'POST' });
  const cookie = start.headers.get('set-cookie').split(';')[0];
  const state = new URL((await start.json()).authorizationUrl).searchParams.get('state');
  const callback = await request(
    app,
    `/api/v1/auth/oauth/meta/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    { headers: { cookie } },
  );

  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), 'https://makoki.example/parametres?link=success&provider=meta');
  assert.equal(linkInput.accountId, 'acc-1');
  assert.equal(linkInput.provider, 'meta');
  assert.equal(linkInput.subject, 'fb-123');
  assert.equal(linkInput.email, 'person@example.test');
});

test('callback surfaces IDENTITY_TAKEN when the identity belongs to another account', async () => {
  let transaction;
  const store = {
    saveOAuthTransaction: async (input) => { transaction = input; },
    consumeOAuthTransaction: async () => ({
      accountId: transaction.accountId,
      nonce: transaction.nonce,
      codeVerifier: transaction.codeVerifier,
    }),
    linkOAuthIdentity: async () => ({ status: 'identity_taken' }),
  };
  const providers = {
    google: {
      authorizationUrl,
      exchange: async () => ({ provider: 'google', subject: 'g-999', email: 'x@example.test', emailVerified: true }),
    },
  };
  const app = createLinkApp({ store, providers, sessionResolver: authenticated });

  const start = await request(app, '/api/v1/auth/oauth/google/link/start', { method: 'POST' });
  const cookie = start.headers.get('set-cookie').split(';')[0];
  const state = new URL((await start.json()).authorizationUrl).searchParams.get('state');
  const callback = await request(
    app,
    `/api/v1/auth/oauth/google/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    { headers: { cookie } },
  );

  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), 'https://makoki.example/parametres?link=error&code=IDENTITY_TAKEN');
});
