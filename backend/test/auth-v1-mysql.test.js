const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const express = require('express');
const mysql = require('mysql2/promise');

const { createAuthRouter } = require('../src/auth-v1');
const { createMySqlAuthStore } = require('../src/auth-v1/mysql-store');
const { migrateUp, migrateDown } = require('../src/db/migrate');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

const request = async (app, requestPath, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${requestPath}`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const authApplication = ({ store, email, jwtSecret }) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email,
    jwtSecret,
    cookieSecure: false,
  }));
  return app;
};

test('account lifecycle persists in isolated MySQL through the HTTP interface', async () => {
  const pool = createPool();
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));
  const store = createMySqlAuthStore(pool);
  let verificationToken;
  const app = authApplication({
    store,
    email: {
      sendVerification: async ({ token }) => { verificationToken = token; },
      sendPasswordReset: async () => undefined,
    },
    jwtSecret: 'mysql-test-jwt-secret-with-at-least-32-characters',
  });
  const email = `mysql-${Date.now()}@example.test`;

  try {
    const registration = await request(app, '/api/v1/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'correct horse battery staple' }),
    });
    assert.equal(registration.status, 201);
    assert.equal((await request(app, '/api/v1/auth/verify-email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    })).status, 200);
    const login = await request(app, '/api/v1/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'correct horse battery staple' }),
    });
    const loginBody = await login.json();
    const refreshCookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal(login.status, 200);
    assert.deepEqual(loginBody.account.roles, ['user']);
    assert.equal((await request(app, '/api/v1/auth/session', {
      headers: { authorization: `Bearer ${loginBody.accessToken}` },
    })).status, 200);
    const refreshed = await request(app, '/api/v1/auth/refresh', {
      method: 'POST', headers: { cookie: refreshCookie },
    });
    const rotatedCookie = refreshed.headers.get('set-cookie').split(';')[0];
    assert.equal(refreshed.status, 200);
    assert.notEqual(rotatedCookie, refreshCookie);
    assert.equal((await request(app, '/api/v1/auth/logout', {
      method: 'POST', headers: { cookie: rotatedCookie },
    })).status, 204);
    assert.equal((await request(app, '/api/v1/auth/session', {
      headers: { authorization: `Bearer ${loginBody.accessToken}` },
    })).status, 401);
  } finally {
    await pool.end();
  }
});

test('password recovery changes credentials and revokes existing MySQL sessions', async () => {
  const pool = createPool();
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));
  const store = createMySqlAuthStore(pool);
  let verificationToken;
  let passwordResetToken;
  const app = authApplication({
    store,
    email: {
      sendVerification: async ({ token }) => { verificationToken = token; },
      sendPasswordReset: async ({ token }) => { passwordResetToken = token; },
    },
    jwtSecret: 'mysql-test-jwt-secret-with-at-least-32-characters',
  });
  const email = `mysql-reset-${Date.now()}@example.test`;
  const oldPassword = 'old correct horse battery staple';
  const newPassword = 'new correct horse battery staple';

  try {
    assert.equal((await request(app, '/api/v1/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: oldPassword }),
    })).status, 201);
    assert.equal((await request(app, '/api/v1/auth/verify-email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    })).status, 200);
    const login = await request(app, '/api/v1/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: oldPassword }),
    });
    const refreshCookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal(login.status, 200);
    assert.equal((await request(app, '/api/v1/auth/password-reset/request', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })).status, 202);
    assert.ok(passwordResetToken);
    assert.equal((await request(app, '/api/v1/auth/password-reset/confirm', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: passwordResetToken, password: newPassword }),
    })).status, 204);
    assert.equal((await request(app, '/api/v1/auth/refresh', {
      method: 'POST', headers: { cookie: refreshCookie },
    })).status, 401);
    assert.equal((await request(app, '/api/v1/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: oldPassword }),
    })).status, 401);
    assert.equal((await request(app, '/api/v1/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword }),
    })).status, 200);
    assert.equal((await request(app, '/api/v1/auth/password-reset/confirm', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: passwordResetToken, password: newPassword }),
    })).status, 400);
  } finally {
    await pool.end();
  }
});

test('ordered migrations roll back completely and can be applied again', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  try {
    await migrateUp(pool, directory);
    const [appliedRows] = await pool.query(
      'SELECT version FROM schema_migrations ORDER BY applied_at DESC, version DESC',
    );
    const expectedRollbackOrder = appliedRows.map((row) => row.version);
    const rolledBack = [];
    while (true) {
      const version = await migrateDown(pool, directory);
      if (!version) break;
      rolledBack.push(version);
    }
    assert.deepEqual(rolledBack, expectedRollbackOrder);
    assert.deepEqual(rolledBack, [
      '010_profile_synthesis_snapshots',
      '009_career_recommendation_snapshots',
      '008_profile_intelligence_v1',
      '007_social_auth',
      '006_esco_fr_catalog',
      '005_cv_analysis_v1',
      '004_career_catalog_permissions',
      '003_occupation_catalog',
      '002_riasec_foundation',
      '001_auth_foundation',
    ]);

    const [[afterRollback]] = await pool.query(
      `SELECT COUNT(*) AS table_count FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND (table_name LIKE 'auth\\_%' OR table_name LIKE 'orientation\\_%'
              OR table_name LIKE 'career\\_%' OR table_name LIKE 'profile_synthesis\\_%'
              OR table_name LIKE 'cv\\_%')`,
    );
    assert.equal(Number(afterRollback.table_count), 0);

    await migrateUp(pool, directory);
    const tableCount = async (pattern) => {
      const [[row]] = await pool.query(
        `SELECT COUNT(*) AS table_count FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name LIKE ?`,
        [pattern],
      );
      return Number(row.table_count);
    };
    assert.equal(await tableCount('auth\\_%'), 11);
    assert.equal(await tableCount('orientation\\_%'), 5);
    assert.equal(await tableCount('career\\_%'), 8);
    assert.equal(await tableCount('profile_synthesis\\_%'), 1);
    assert.equal(await tableCount('cv\\_%'), 1);
    const [[careerPermissions]] = await pool.query(
      `SELECT COUNT(*) AS permission_count FROM auth_permissions
       WHERE id IN ('career.catalog.read', 'career.match.read_own')`,
    );
    const [[cvPermissions]] = await pool.query(
      `SELECT COUNT(*) AS permission_count FROM auth_permissions WHERE id LIKE 'cv.%'`,
    );
    assert.equal(Number(careerPermissions.permission_count), 2);
    assert.equal(Number(cvPermissions.permission_count), 4);
  } finally {
    await pool.end();
  }
});
