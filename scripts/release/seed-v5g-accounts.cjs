'use strict';

const path = require('node:path');
const { createRequire } = require('node:module');

const backendRequire = createRequire(path.resolve(__dirname, '../../backend/package.json'));
const bcrypt = backendRequire('bcrypt');
const mysql = backendRequire('mysql2/promise');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const main = async () => {
  const pool = mysql.createPool({
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: 2,
  });
  const passwordHash = await bcrypt.hash(required('V5G_TEST_PASSWORD'), 12);
  const accounts = [
    ['11111111-1111-4111-8111-111111111111', required('V5G_ACCOUNT_A_EMAIL')],
    ['22222222-2222-4222-8222-222222222222', required('V5G_ACCOUNT_B_EMAIL')],
  ];
  try {
    for (const [id, email] of accounts) {
      await pool.execute(
        `INSERT INTO auth_accounts (id, email, password_hash, status)
         VALUES (?, ?, ?, 'active')`,
        [id, email, passwordHash],
      );
      await pool.execute(
        'INSERT INTO auth_account_roles (account_id, role_id) VALUES (?, ?)',
        [id, 'user'],
      );
    }
    process.stdout.write('seeded_accounts=2\n');
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  process.stderr.write(`V5-G account seed failed: ${error.message}\n`);
  process.exitCode = 1;
});
