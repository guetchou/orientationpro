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
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${requestPath}`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test('account lifecycle persists in isolated MySQL through the HTTP interface', async () => {
  const pool = createPool();
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));
  const store = createMySqlAuthStore(pool);
  let verificationToken;
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter({
    store,
    email: {
      sendVerification: async ({ token }) => { verificationToken = token; },
      sendPasswordReset: async () => undefined,
    },
    jwtSecret: 'mysql-test-jwt-secret-with-at-least-32-characters',
    cookieSecure: false,
  }));
  const email = `mysql-${Date.now()}@example.test`;

  try {
    const registration = await request(app, '/api/v1/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'correct horse battery staple' }),
    });
    assert.equal(registration.status, 201);

    const verification = await request(app, '/api/v1/auth/verify-email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    });
    assert.equal(verification.status, 200);

    const login = await request(app, '/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'correct horse battery staple' }),
    });
    const loginBody = await login.json();
    const refreshCookie = login.headers.get('set-cookie').split(';')[0];
    assert.equal(login.status, 200);
    assert.deepEqual(loginBody.account.roles, ['user']);

    const current = await request(app, '/api/v1/auth/session', {
      headers: { authorization: `Bearer ${loginBody.accessToken}` },
    });
    assert.equal(current.status, 200);

    const refreshed = await request(app, '/api/v1/auth/refresh', {
      method: 'POST',
      headers: { cookie: refreshCookie },
    });
    const rotatedCookie = refreshed.headers.get('set-cookie').split(';')[0];
    assert.equal(refreshed.status, 200);
    assert.notEqual(rotatedCookie, refreshCookie);

    const logout = await request(app, '/api/v1/auth/logout', {
      method: 'POST',
      headers: { cookie: rotatedCookie },
    });
    assert.equal(logout.status, 204);

    const afterLogout = await request(app, '/api/v1/auth/session', {
      headers: { authorization: `Bearer ${loginBody.accessToken}` },
    });
    assert.equal(afterLogout.status, 401);
  } finally {
    await pool.end();
  }
});

test('ordered migrations roll back completely and can be applied again', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  try {
    await migrateUp(pool, directory);
    const riasecRollback = await migrateDown(pool, directory);
    const authRollback = await migrateDown(pool, directory);
    const [[afterRollback]] = await pool.query(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND (table_name LIKE 'auth\\_%' OR table_name LIKE 'orientation\\_%')`,
    );
    assert.equal(riasecRollback, '002_riasec_foundation');
    assert.equal(authRollback, '001_auth_foundation');
    assert.equal(Number(afterRollback.table_count), 0);

    await migrateUp(pool, directory);
    const [[authTables]] = await pool.query(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name LIKE 'auth\\_%'`,
    );
    const [[orientationTables]] = await pool.query(
      `SELECT COUNT(*) AS table_count
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name LIKE 'orientation\\_%'`,
    );
    assert.equal(Number(authTables.table_count), 9);
    assert.equal(Number(orientationTables.table_count), 5);
  } finally {
    await pool.end();
  }
});
