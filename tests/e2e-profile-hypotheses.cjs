const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const express = require('express');
const { createAuthRouter } = require('../backend/src/auth-v1');
const { createSessionAuthenticator } = require('../backend/src/auth-v1/authenticate');
const { createMySqlAuthStore } = require('../backend/src/auth-v1/mysql-store');
const { createDatabasePool } = require('../backend/src/db/pool');
const { migrateUp } = require('../backend/src/db/migrate');
const { createProfileRouter } = require('../backend/src/profile/router');
const { createProfileStore } = require('../backend/src/profile/store');

const JWT_SECRET = 'makoki-profile-hypotheses-functional-secret-at-least-32-characters';
const migrationsDirectory = path.join(__dirname, '..', 'backend', 'migrations');

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => resolve(server.address()));
});
const closeServer = (server) => new Promise((resolve) => {
  if (!server?.listening) return resolve();
  server.closeAllConnections?.();
  server.close(() => resolve());
});
const payloadOf = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
const request = async (baseUrl, pathname, { method = 'GET', token, body, expected = 200 } = {}) => {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (body !== undefined) headers.set('content-type', 'application/json');
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await payloadOf(response);
  if (response.status !== expected) throw new Error(`${method} ${pathname} => ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  const verificationTokens = new Map();
  let server;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const password = 'correct horse battery staple';
  try {
    await migrateUp(pool, migrationsDirectory);
    const authStore = createMySqlAuthStore(pool);
    const authenticate = createSessionAuthenticator({ store: authStore, jwtSecret: JWT_SECRET });
    const app = express();
    app.use(express.json());
    app.use('/api/v1/auth', createAuthRouter({
      store: authStore,
      jwtSecret: JWT_SECRET,
      cookieSecure: false,
      email: {
        sendVerification: async ({ email, token }) => verificationTokens.set(email, token),
        sendPasswordReset: async () => undefined,
      },
    }));
    app.use('/api/v1/profile', createProfileRouter({ store: createProfileStore(pool), authenticate }));
    app.use((error, req, res, next) => res.status(500).json({ error: { code: 'E2E_ERROR', message: error.message } }));
    server = http.createServer(app);
    const address = await listen(server);
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const register = async (email) => {
      await request(baseUrl, '/api/v1/auth/register', { method: 'POST', body: { email, password }, expected: 201 });
      await request(baseUrl, '/api/v1/auth/verify-email', { method: 'POST', body: { token: verificationTokens.get(email) } });
      return request(baseUrl, '/api/v1/auth/login', { method: 'POST', body: { email, password } });
    };
    const primaryEmail = `hyp-primary-${suffix}@example.test`;
    const secondaryEmail = `hyp-secondary-${suffix}@example.test`;
    const primary = await register(primaryEmail);
    const secondary = await register(secondaryEmail);

    await request(baseUrl, '/api/v1/profile', {
      method: 'PUT', token: primary.accessToken,
      body: {
        first_name: 'Maya', last_name: 'Test', city: 'Paris', country_code: 'FR',
        current_situation: 'student', primary_goal: 'choose_studies', mobility_scope: 'unknown',
      },
    });

    const first = await request(baseUrl, '/api/v1/profile/hypotheses/generate', { method: 'POST', token: primary.accessToken });
    assert.equal(first.hypothesisGeneration.generatorVersion, 'profile-hypotheses-v1');
    assert.ok(first.hypotheses.length >= 2);
    assert.ok(first.hypotheses.every((item) => item.status === 'proposed'));

    const repeated = await request(baseUrl, '/api/v1/profile/hypotheses/generate', { method: 'POST', token: primary.accessToken });
    assert.equal(repeated.hypothesisGeneration.createdCount, 0);
    const mobility = repeated.hypotheses.find((item) => item.value_json.key === 'mobility.clarify');
    assert.ok(mobility);
    await request(baseUrl, `/api/v1/profile/hypotheses/${encodeURIComponent(mobility.id)}`, {
      method: 'PATCH', token: primary.accessToken, body: { status: 'rejected' },
    });

    const secondaryProfile = await request(baseUrl, '/api/v1/profile', { token: secondary.accessToken });
    assert.deepEqual(secondaryProfile.hypotheses, []);
    const forbidden = await request(baseUrl, `/api/v1/profile/hypotheses/${encodeURIComponent(mobility.id)}`, {
      method: 'PATCH', token: secondary.accessToken, body: { status: 'confirmed' }, expected: 404,
    });
    assert.equal(forbidden.error.code, 'PROFILE_HYPOTHESIS_NOT_FOUND');

    await request(baseUrl, '/api/v1/profile', {
      method: 'PUT', token: primary.accessToken,
      body: {
        first_name: 'Maya', last_name: 'Test', city: 'Paris', country_code: 'FR',
        current_situation: 'student', primary_goal: 'career_change', mobility_scope: 'international',
      },
    });
    const changed = await request(baseUrl, '/api/v1/profile/hypotheses/generate', { method: 'POST', token: primary.accessToken });
    assert.notEqual(changed.hypothesisGeneration.profileFingerprint, first.hypothesisGeneration.profileFingerprint);
    assert.equal(changed.hypotheses.find((item) => item.id === mobility.id).status, 'rejected');
    assert.equal(changed.hypotheses.some((item) => item.status === 'proposed' && item.value_json.key === 'mobility.clarify'), false);

    console.log('PROFILE HYPOTHESES E2E PASSED');
  } finally {
    await closeServer(server);
    await pool.query("DELETE FROM auth_accounts WHERE email LIKE 'hyp-%@example.test'").catch(() => undefined);
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
