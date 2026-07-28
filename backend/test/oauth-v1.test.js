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
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const createApp = ({ store, provider }) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: {},
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
    oauthProviders: { google: provider },
    frontendUrl: 'https://makoki.example',
    oauthCallbackBaseUrl: 'https://api.makoki.example',
  }));
  return app;
};

test('OAuth start stores a hashed one-time transaction and uses PKCE', async () => {
  let transaction;
  let authorizationInput;
  const app = createApp({
    store: {
      saveOAuthTransaction: async (input) => { transaction = input; },
    },
    provider: {
      authorizationUrl: (input) => {
        authorizationInput = input;
        return `https://accounts.example/authorize?state=${input.state}`;
      },
    },
  });

  const response = await request(app, '/api/v1/auth/oauth/google/start');
  const cookie = response.headers.get('set-cookie');

  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /^https:\/\/accounts\.example\/authorize/);
  assert.match(cookie, /^orientationpro_oauth_state=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.equal(transaction.provider, 'google');
  assert.match(transaction.stateHash, /^[a-f0-9]{64}$/);
  assert.ok(transaction.expiresAt > new Date());
  assert.equal(authorizationInput.redirectUri, 'https://api.makoki.example/api/v1/auth/oauth/google/callback');
  assert.match(authorizationInput.codeChallenge, /^[A-Za-z0-9_-]{43}$/);
  assert.ok(authorizationInput.nonce);
});

test('OAuth callback creates the canonical refresh session without exposing provider tokens', async () => {
  let transaction;
  let exchangeInput;
  let resolvedIdentity;
  let createdSession;
  const account = {
    id: 'account-social',
    email: 'person@example.test',
    status: 'active',
    roles: ['user'],
  };
  const provider = {
    authorizationUrl: ({ state }) => `https://accounts.example/authorize?state=${state}`,
    exchange: async (input) => {
      exchangeInput = input;
      return {
        provider: 'google',
        subject: 'google-subject',
        email: 'Person@Example.Test',
        emailVerified: true,
      };
    },
  };
  const store = {
    saveOAuthTransaction: async (input) => { transaction = input; },
    consumeOAuthTransaction: async ({ stateHash, provider: providerName }) => {
      assert.equal(stateHash, transaction.stateHash);
      assert.equal(providerName, 'google');
      return { nonce: transaction.nonce, codeVerifier: transaction.codeVerifier };
    },
    resolveOAuthIdentity: async (input) => {
      resolvedIdentity = input;
      return { status: 'authenticated', account };
    },
    createSession: async (input) => {
      createdSession = input;
      return { ...input, id: 'session-social' };
    },
  };
  const app = createApp({ store, provider });

  const start = await request(app, '/api/v1/auth/oauth/google/start');
  const cookie = start.headers.get('set-cookie').split(';')[0];
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const callback = await request(
    app,
    `/api/v1/auth/oauth/google/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    { headers: { cookie } },
  );
  const callbackCookies = callback.headers.getSetCookie
    ? callback.headers.getSetCookie()
    : [callback.headers.get('set-cookie')];

  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), 'https://makoki.example/login?oauth=success');
  assert.ok(callbackCookies.some((value) => /^orientationpro_refresh=/.test(value)));
  assert.equal(exchangeInput.nonce, transaction.nonce);
  assert.equal(exchangeInput.codeVerifier, transaction.codeVerifier);
  assert.equal(resolvedIdentity.email, 'person@example.test');
  assert.equal(resolvedIdentity.provider, 'google');
  assert.match(resolvedIdentity.passwordHash, /^\$2[aby]\$/);
  assert.equal(createdSession.accountId, account.id);
  assert.match(createdSession.refreshTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(exchangeInput).includes('access_token'), false);
});

test('OAuth callback refuses automatic linking when the email already belongs to a Compte', async () => {
  let transaction;
  let sessionCreated = false;
  const provider = {
    authorizationUrl: ({ state }) => `https://accounts.example/authorize?state=${state}`,
    exchange: async () => ({
      provider: 'google',
      subject: 'new-google-subject',
      email: 'existing@example.test',
      emailVerified: true,
    }),
  };
  const store = {
    saveOAuthTransaction: async (input) => { transaction = input; },
    consumeOAuthTransaction: async () => ({
      nonce: transaction.nonce,
      codeVerifier: transaction.codeVerifier,
    }),
    resolveOAuthIdentity: async () => ({ status: 'link_required' }),
    createSession: async () => { sessionCreated = true; },
  };
  const app = createApp({ store, provider });
  const start = await request(app, '/api/v1/auth/oauth/google/start');
  const cookie = start.headers.get('set-cookie').split(';')[0];
  const state = new URL(start.headers.get('location')).searchParams.get('state');
  const callback = await request(
    app,
    `/api/v1/auth/oauth/google/callback?code=authorization-code&state=${encodeURIComponent(state)}`,
    { headers: { cookie } },
  );

  assert.equal(callback.status, 302);
  assert.equal(
    callback.headers.get('location'),
    'https://makoki.example/login?oauth=error&code=ACCOUNT_LINK_REQUIRED',
  );
  assert.equal(sessionCreated, false);
});
