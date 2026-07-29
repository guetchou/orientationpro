const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const express = require('express');

const { createAuthRouter } = require('../backend/src/auth-v1');
const { createSessionAuthenticator } = require('../backend/src/auth-v1/authenticate');
const { createMySqlAuthStore } = require('../backend/src/auth-v1/mysql-store');
const { createDatabasePool } = require('../backend/src/db/pool');
const { migrateUp } = require('../backend/src/db/migrate');
const { createProfileSynthesisRouter } = require('../backend/src/profile/synthesis-router');
const { createProfileSynthesisStore } = require('../backend/src/profile/synthesis-store');

const migrationsDirectory = path.join(__dirname, '..', 'backend', 'migrations');
const JWT_SECRET = 'makoki-profile-synthesis-functional-secret-at-least-32-characters';

const apiRequest = async (baseUrl, pathname, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set('content-type', 'application/json');
  if (options.token) headers.set('authorization', `Bearer ${options.token}`);
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  const expected = Array.isArray(options.expectedStatus) ? options.expectedStatus : [options.expectedStatus || 200];
  assert.ok(expected.includes(response.status), `${pathname} returned ${response.status}: ${text}`);
  return payload;
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  const verificationTokens = new Map();
  const suffix = crypto.randomUUID();
  const instrumentId = `synthesis-e2e-${suffix}`;
  const attemptId = crypto.randomUUID();
  const resultId = crypto.randomUUID();
  const recommendationId = crypto.randomUUID();
  let server;

  try {
    await migrateUp(pool, migrationsDirectory);
    const authStore = createMySqlAuthStore(pool);
    const authenticate = createSessionAuthenticator({ store: authStore, jwtSecret: JWT_SECRET });
    const app = express();
    app.use(express.json());
    app.use('/api/v1/auth', createAuthRouter({
      store: authStore, jwtSecret: JWT_SECRET, cookieSecure: false,
      email: {
        sendVerification: async ({ email, token }) => verificationTokens.set(email, token),
        sendPasswordReset: async () => undefined,
      },
    }));
    app.use('/api/v1/profile/syntheses', createProfileSynthesisRouter({
      store: createProfileSynthesisStore(pool), authenticate,
    }));
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const password = 'correct horse battery staple';

    const register = async (email) => {
      await apiRequest(baseUrl, '/api/v1/auth/register', { method: 'POST', body: { email, password }, expectedStatus: 201 });
      await apiRequest(baseUrl, '/api/v1/auth/verify-email', { method: 'POST', body: { token: verificationTokens.get(email) } });
      return apiRequest(baseUrl, '/api/v1/auth/login', { method: 'POST', body: { email, password } });
    };

    const primary = await register(`synthesis-primary-${suffix}@example.test`);
    const secondary = await register(`synthesis-secondary-${suffix}@example.test`);

    await pool.query(
      `INSERT INTO orientation_riasec_instruments (
         id, slug, version, locale, status, title, response_scale, dimensions_json,
         methodology, source_kind, source_reference, license_text, disclaimer,
         scoring_version, content_hash
       ) VALUES (?, ?, 1, 'fr', 'draft', 'Synthèse E2E', JSON_OBJECT(),
                 JSON_ARRAY('R','I','A','S','E','C'), 'Test', 'original',
                 'test', 'test', 'test', 'riasec-makoki-scoring-v2', ?)`,
      [instrumentId, instrumentId, 'd'.repeat(64)],
    );
    await pool.query(
      `INSERT INTO orientation_riasec_attempts (
         id, account_id, instrument_id, status, item_order, completed_at
       ) VALUES (?, ?, ?, 'completed', JSON_ARRAY(), CURRENT_TIMESTAMP(3))`,
      [attemptId, primary.account.id, instrumentId],
    );
    await pool.query(
      `INSERT INTO orientation_results (
         id, attempt_id, account_id, instrument_id, result_type, algorithm_version,
         primary_code, display_code, scores_json, ranking_json, differentiation_json,
         response_pattern_json, result_snapshot
       ) VALUES (?, ?, ?, ?, 'riasec', 'riasec-makoki-scoring-v2', NULL, 'S/E-I',
                 JSON_OBJECT('S', JSON_OBJECT('normalized', 80)),
                 JSON_OBJECT('codeStatus', 'tied'),
                 JSON_OBJECT('kind', 'descriptive', 'percentile', NULL),
                 JSON_OBJECT(), JSON_OBJECT())`,
      [resultId, attemptId, primary.account.id, instrumentId],
    );
    await pool.query(
      `INSERT INTO account_profiles (
         account_id, first_name, last_name, city, country_code, current_situation,
         primary_goal, mobility_scope, completion_percent
       ) VALUES (?, 'Maya', 'E2E', 'Paris', 'FR', 'job_seeker', 'find_job',
                 'international', 100)`,
      [primary.account.id],
    );
    await pool.query(
      `INSERT INTO career_recommendation_snapshots (
         id, account_id, orientation_result_id, recommendation_algorithm_version,
         riasec_algorithm_version, preparation_adapter_version, requested_locale,
         include_locally_excluded, limit_count, input_fingerprint, profile_fingerprint,
         onet_sources_json, esco_sources_json, snapshot_json
       ) VALUES (?, ?, ?, 'career-profile-context-v2', 'riasec-makoki-scoring-v2',
                 'onet-job-zone-adapter-v1', 'fr', FALSE, 10, ?, ?, JSON_ARRAY(),
                 JSON_ARRAY(), JSON_OBJECT('matching', JSON_OBJECT('matches', JSON_ARRAY(
                   JSON_OBJECT('occupationId', 'occupation-e2e', 'preferredLabel', 'Analyste E2E',
                               'recommendationScore', 90, 'fitScore', 86)
                 ))))`,
      [recommendationId, primary.account.id, resultId, 'e'.repeat(64), 'f'.repeat(64)],
    );

    const first = await apiRequest(baseUrl, '/api/v1/profile/syntheses', {
      method: 'POST', token: primary.accessToken, body: {}, expectedStatus: 201,
    });
    const repeated = await apiRequest(baseUrl, '/api/v1/profile/syntheses', {
      method: 'POST', token: primary.accessToken, body: {}, expectedStatus: 200,
    });
    assert.equal(repeated.snapshot.id, first.snapshot.id);
    assert.equal(first.synthesis.summary.keySignals.riasecCodeStatus, 'tied');

    const reread = await apiRequest(baseUrl, `/api/v1/profile/syntheses/${encodeURIComponent(first.snapshot.id)}`, { token: primary.accessToken });
    assert.deepEqual(reread.synthesis, first.synthesis);

    const isolation = await apiRequest(baseUrl, `/api/v1/profile/syntheses/${encodeURIComponent(first.snapshot.id)}`, {
      token: secondary.accessToken, expectedStatus: 404,
    });
    assert.equal(isolation.error.code, 'PROFILE_SYNTHESIS_NOT_FOUND');

    console.log(JSON.stringify({
      status: 'passed', synthesisId: first.snapshot.id,
      inputFingerprint: first.snapshot.inputFingerprint,
      isolation: '404 PROFILE_SYNTHESIS_NOT_FOUND',
    }, null, 2));
    console.log('PROFILE SYNTHESIS E2E PASSED');
  } finally {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    await pool.query("DELETE FROM auth_accounts WHERE email LIKE 'synthesis-%@example.test'").catch(() => undefined);
    await pool.query('DELETE FROM orientation_riasec_instruments WHERE id = ?', [instrumentId]).catch(() => undefined);
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
