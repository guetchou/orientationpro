const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { createAuthRouter } = require('../src/auth-v1');

const request = async (app, path, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test('public registration creates only an unverified user account', async () => {
  const storedAccounts = [];
  const sentMessages = [];
  const store = {
    findAccountByEmail: async () => null,
    createAccount: async (account) => {
      const stored = { ...account, id: 'account-1' };
      storedAccounts.push(stored);
      return stored;
    },
    saveVerificationToken: async () => undefined,
  };
  const email = {
    sendVerification: async (message) => sentMessages.push(message),
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email,
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  const response = await request(app, '/api/v1/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'person@example.test',
      password: 'correct horse battery staple',
      role: 'super_admin',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(body.account, {
    id: 'account-1',
    email: 'person@example.test',
    status: 'pending_verification',
    roles: ['user'],
  });
  assert.equal(storedAccounts[0].role, 'user');
  assert.equal(storedAccounts[0].status, 'pending_verification');
  assert.equal(sentMessages.length, 1);
});

test('an unverified account cannot start a session', async () => {
  const passwordHash = await bcrypt.hash('correct horse battery staple', 4);
  const store = {
    findAccountByEmail: async () => ({
      id: 'account-1',
      email: 'person@example.test',
      passwordHash,
      status: 'pending_verification',
      role: 'user',
    }),
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  const response = await request(app, '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'person@example.test',
      password: 'correct horse battery staple',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, 'ACCOUNT_NOT_VERIFIED');
});

test('email verification activates the account with the issued one-time token', async () => {
  let account;
  let verificationRecord;
  let deliveredToken;
  const store = {
    findAccountByEmail: async (email) => account?.email === email ? account : null,
    createAccount: async (input) => {
      account = { ...input, id: 'account-1' };
      return account;
    },
    saveVerificationToken: async (record) => {
      verificationRecord = record;
    },
    consumeVerificationToken: async ({ tokenHash, now }) => {
      if (
        !verificationRecord ||
        verificationRecord.tokenHash !== tokenHash ||
        verificationRecord.expiresAt <= now
      ) {
        return null;
      }
      verificationRecord = null;
      account = { ...account, status: 'active' };
      return account;
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async ({ token }) => { deliveredToken = token; } },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  await request(app, '/api/v1/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'person@example.test',
      password: 'correct horse battery staple',
    }),
  });
  const response = await request(app, '/api/v1/auth/verify-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: deliveredToken }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.account.status, 'active');
  assert.equal(verificationRecord, null);
});

test('verification resend is neutral and only delivers a fresh 30 minute token to pending accounts', async () => {
  const pending = {
    id: 'account-pending',
    email: 'pending@example.test',
    status: 'pending_verification',
    role: 'user',
  };
  const issuedTokens = [];
  const sentMessages = [];
  const store = {
    issueVerificationToken: async (record) => {
      issuedTokens.push(record);
      return record.email === pending.email ? pending : null;
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async (message) => sentMessages.push(message) },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));
  const resend = (email) => request(app, '/api/v1/auth/verification/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const before = Date.now();
  const pendingResponse = await resend(' Pending@Example.Test ');
  const unknownResponse = await resend('unknown@example.test');
  const activeResponse = await resend('active@example.test');
  const after = Date.now();

  assert.equal(pendingResponse.status, 202);
  assert.equal(unknownResponse.status, 202);
  assert.equal(activeResponse.status, 202);
  assert.equal(await pendingResponse.text(), '');
  assert.equal(await unknownResponse.text(), '');
  assert.equal(await activeResponse.text(), '');
  assert.equal(sentMessages.length, 1);
  assert.equal(sentMessages[0].email, pending.email);
  assert.match(sentMessages[0].token, /^[A-Za-z0-9_-]+$/);
  assert.equal(issuedTokens[0].email, pending.email);
  assert.match(issuedTokens[0].tokenHash, /^[a-f0-9]{64}$/);
  assert.ok(issuedTokens[0].expiresAt.getTime() >= before + (30 * 60 * 1000));
  assert.ok(issuedTokens[0].expiresAt.getTime() <= after + (30 * 60 * 1000));
});

test('an active account starts a revocable session without exposing the refresh token in JSON', async () => {
  const jwtSecret = 'test-jwt-secret-with-at-least-32-characters';
  const passwordHash = await bcrypt.hash('correct horse battery staple', 4);
  let savedSession;
  const store = {
    findAccountByEmail: async () => ({
      id: 'account-1',
      email: 'person@example.test',
      passwordHash,
      status: 'active',
      role: 'user',
    }),
    createSession: async (session) => {
      savedSession = { ...session, id: 'session-1' };
      return savedSession;
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret,
    cookieSecure: false,
  }));

  const response = await request(app, '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'person@example.test',
      password: 'correct horse battery staple',
    }),
  });
  const body = await response.json();
  const cookie = response.headers.get('set-cookie');
  const claims = jwt.verify(body.accessToken, jwtSecret);

  assert.equal(response.status, 200);
  assert.equal(body.refreshToken, undefined);
  assert.equal(body.account.id, 'account-1');
  assert.match(cookie, /^orientationpro_refresh=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.equal(savedSession.accountId, 'account-1');
  assert.match(savedSession.refreshTokenHash, /^[a-f0-9]{64}$/);
  assert.equal(claims.sub, 'account-1');
  assert.equal(claims.sid, 'session-1');
  assert.deepEqual(claims.roles, ['user']);
  assert.ok(claims.exp - claims.iat <= 15 * 60);
});

test('refresh token rotation rejects replay and revokes the session family', async () => {
  const passwordHash = await bcrypt.hash('correct horse battery staple', 4);
  const account = {
    id: 'account-1',
    email: 'person@example.test',
    passwordHash,
    status: 'active',
    role: 'user',
  };
  let currentHash;
  const usedHashes = new Set();
  let familyRevoked = false;
  const store = {
    findAccountByEmail: async () => account,
    createSession: async (session) => {
      currentHash = session.refreshTokenHash;
      return { ...session, id: 'session-1' };
    },
    rotateSession: async ({ refreshTokenHash, nextRefreshTokenHash, expiresAt }) => {
      if (familyRevoked || usedHashes.has(refreshTokenHash)) {
        familyRevoked = true;
        return { status: 'reused' };
      }
      if (refreshTokenHash !== currentHash) return { status: 'invalid' };
      usedHashes.add(currentHash);
      currentHash = nextRefreshTokenHash;
      return {
        status: 'rotated',
        session: { id: 'session-1', accountId: account.id, expiresAt },
        account,
      };
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  const loginResponse = await request(app, '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: account.email,
      password: 'correct horse battery staple',
    }),
  });
  const originalCookie = loginResponse.headers.get('set-cookie').split(';')[0];
  const firstRefresh = await request(app, '/api/v1/auth/refresh', {
    method: 'POST',
    headers: { cookie: originalCookie },
  });
  const rotatedCookie = firstRefresh.headers.get('set-cookie').split(';')[0];
  const replay = await request(app, '/api/v1/auth/refresh', {
    method: 'POST',
    headers: { cookie: originalCookie },
  });
  const replayBody = await replay.json();

  assert.equal(firstRefresh.status, 200);
  assert.notEqual(rotatedCookie, originalCookie);
  assert.equal(replay.status, 401);
  assert.equal(replayBody.error.code, 'SESSION_REVOKED');
  assert.equal(familyRevoked, true);
});

test('current session is returned only after server-side session validation', async () => {
  const jwtSecret = 'test-jwt-secret-with-at-least-32-characters';
  const account = {
    id: 'account-1',
    email: 'person@example.test',
    status: 'active',
    role: 'user',
  };
  const accessToken = jwt.sign(
    { role: account.role, sid: 'session-1' },
    jwtSecret,
    {
      subject: account.id,
      expiresIn: 15 * 60,
      issuer: 'orientationpro-api',
      audience: 'orientationpro-clients',
    },
  );
  let validationInput;
  const store = {
    findActiveSession: async (input) => {
      validationInput = input;
      return { session: { id: 'session-1' }, account };
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret,
    cookieSecure: false,
  }));

  const response = await request(app, '/api/v1/auth/session', {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.account.id, account.id);
  assert.equal(validationInput.sessionId, 'session-1');
  assert.equal(validationInput.accountId, account.id);
});

test('logout revokes the refresh session and clears its cookie', async () => {
  let revokedHash;
  const store = {
    revokeSessionByRefreshHash: async ({ refreshTokenHash }) => {
      revokedHash = refreshTokenHash;
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  const response = await request(app, '/api/v1/auth/logout', {
    method: 'POST',
    headers: { cookie: 'orientationpro_refresh=refresh-token-value' },
  });
  const cookie = response.headers.get('set-cookie');

  assert.equal(response.status, 204);
  assert.match(revokedHash, /^[a-f0-9]{64}$/);
  assert.match(cookie, /^orientationpro_refresh=;/);
});

test('password reset requests do not disclose whether an account exists', async () => {
  const savedTokens = [];
  const sentMessages = [];
  const account = {
    id: 'account-1',
    email: 'person@example.test',
    status: 'active',
    role: 'user',
  };
  const store = {
    findAccountByEmail: async (email) => email === account.email ? account : null,
    savePasswordResetToken: async (record) => savedTokens.push(record),
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendPasswordReset: async (message) => sentMessages.push(message) },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));
  const requestReset = (email) => request(app, '/api/v1/auth/password-reset/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const existing = await requestReset(account.email);
  const missing = await requestReset('missing@example.test');
  const existingBody = await existing.json();
  const missingBody = await missing.json();

  assert.equal(existing.status, 202);
  assert.equal(missing.status, 202);
  assert.deepEqual(existingBody, missingBody);
  assert.equal(savedTokens.length, 1);
  assert.equal(sentMessages.length, 1);
  assert.match(savedTokens[0].tokenHash, /^[a-f0-9]{64}$/);
});

test('password reset confirmation changes credentials and revokes existing sessions', async () => {
  const account = {
    id: 'account-1',
    email: 'person@example.test',
    passwordHash: await bcrypt.hash('old correct horse battery staple', 4),
    status: 'active',
    role: 'user',
  };
  let sessionsRevoked = false;
  const store = {
    findAccountByEmail: async () => account,
    consumePasswordResetToken: async ({ tokenHash, passwordHash }) => {
      assert.match(tokenHash, /^[a-f0-9]{64}$/);
      account.passwordHash = passwordHash;
      sessionsRevoked = true;
      return account;
    },
    createSession: async (session) => ({ ...session, id: 'session-new' }),
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: { sendVerification: async () => undefined },
    jwtSecret: 'test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));

  const confirm = await request(app, '/api/v1/auth/password-reset/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      token: 'valid-password-reset-token',
      password: 'new correct horse battery staple',
    }),
  });
  const login = await request(app, '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: account.email,
      password: 'new correct horse battery staple',
    }),
  });

  assert.equal(confirm.status, 204);
  assert.equal(login.status, 200);
  assert.equal(sessionsRevoked, true);
});
