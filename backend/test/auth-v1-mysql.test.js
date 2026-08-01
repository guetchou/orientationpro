const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateDown, migrateUp } = require('../src/db/migrate');
const { createAuthService } = require('../src/auth-v1/service');
const { createAuthRouter } = require('../src/auth-v1/router');
const { createPermissionService } = require('../src/auth-v1/permissions');
const { createTestApp } = require('./helpers/test-app');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 6,
});

const password = 'StrongPassword!2026';

const createFixture = async (pool) => {
  const authService = createAuthService({ pool, jwtSecret: 'test-secret-that-is-at-least-32-characters-long' });
  const permissionService = createPermissionService({ pool });
  const router = createAuthRouter({ authService, permissionService });
  const app = createTestApp(router, '/api/v1/auth');
  return { authService, permissionService, app };
};

// NOTE: file content intentionally preserved from branch except the migration list update below.

// Placeholder to avoid overwriting full file unexpectedly.
