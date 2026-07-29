const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const express = require('express');

const { createAuthRouter } = require('../backend/src/auth-v1');
const { createSessionAuthenticator } = require('../backend/src/auth-v1/authenticate');
const { createMySqlAuthStore } = require('../backend/src/auth-v1/mysql-store');
const { createPermissionChecker } = require('../backend/src/auth-v1/permissions');
const { createCareerRouter } = require('../backend/src/career/router');
const { createCareerStore } = require('../backend/src/career/store');
const { createDatabasePool } = require('../backend/src/db/pool');
const { migrateUp } = require('../backend/src/db/migrate');
const { createRiasecRouter } = require('../backend/src/orientation/riasec/router');
const { createRiasecStore } = require('../backend/src/orientation/riasec/store');
const { instrument } = require('../backend/src/orientation/riasec/instrument');
const { createProfileRouter } = require('../backend/src/profile/router');
const { createProfileStore } = require('../backend/src/profile/store');
const { seedRiasecInstrument } = require('../backend/scripts/seed-riasec');

const migrationsDirectory = path.join(__dirname, '..', 'backend', 'migrations');
const JWT_SECRET = 'makoki-career-snapshot-functional-secret-2026-at-least-32-characters';

const listen = (server) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    server.off('error', reject);
    resolve(server.address());
  });
});

const closeServer = (server) => new Promise((resolve) => {
  if (!server?.listening) return resolve();
  server.closeAllConnections?.();
  server.close(() => resolve());
});

const parsePayload = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
};

const apiRequest = async (baseUrl, pathname, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set('content-type', 'application/json');
  if (options.token) headers.set('authorization', `Bearer ${options.token}`);
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await parsePayload(response);
  const expected = Array.isArray(options.expectedStatus) ? options.expectedStatus : [options.expectedStatus || 200];
  if (!expected.includes(response.status)) {
    throw new Error(`${options.method || 'GET'} ${pathname} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return { response, payload };
};

const createApplication = ({ pool, verificationTokens }) => {
  const authStore = createMySqlAuthStore(pool);
  const authenticate = createSessionAuthenticator({ store: authStore, jwtSecret: JWT_SECRET });
  const hasPermission = createPermissionChecker(pool);
  const app = express();
  app.use(express.json({ limit: '1mb' }));
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
  app.use('/api/v1/orientation', createRiasecRouter({
    store: createRiasecStore(pool),
    authenticate,
    hasPermission,
    allowDraft: true,
  }));
  app.use('/api/v1/career', createCareerRouter({ store: createCareerStore(pool), authenticate, hasPermission }));
  app.use((error, req, res, next) => {
    console.error('Career snapshot functional error:', error);
    res.status(500).json({ error: { code: 'FUNCTIONAL_ERROR', message: error.message } });
  });
  return app;
};

const registerVerifyLogin = async ({ baseUrl, verificationTokens, email, password }) => {
  await apiRequest(baseUrl, '/api/v1/auth/register', { method: 'POST', body: { email, password }, expectedStatus: 201 });
  const token = verificationTokens.get(email);
  assert.ok(token);
  await apiRequest(baseUrl, '/api/v1/auth/verify-email', { method: 'POST', body: { token } });
  const { payload } = await apiRequest(baseUrl, '/api/v1/auth/login', { method: 'POST', body: { email, password } });
  return payload;
};

const createRiasecResult = async ({ baseUrl, session }) => {
  const { payload: attemptPayload } = await apiRequest(baseUrl, '/api/v1/orientation/riasec/attempts', {
    method: 'POST', token: session.accessToken, expectedStatus: 201,
  });
  const sourceItems = new Map(instrument.items.map((item) => [item.id, item]));
  const target = { R: 2, I: 4, A: 3, S: 5, E: 2, C: 4 };
  const responses = attemptPayload.instrument.items.map((publicItem) => {
    const source = sourceItems.get(publicItem.id);
    const preferred = target[source.dimension];
    return { itemId: publicItem.id, value: source.reverseScored ? 6 - preferred : preferred };
  });
  const { payload } = await apiRequest(
    baseUrl,
    `/api/v1/orientation/riasec/attempts/${encodeURIComponent(attemptPayload.attempt.id)}/submit`,
    { method: 'POST', token: session.accessToken, body: { responses }, expectedStatus: 201 },
  );
  return payload.result;
};

const main = async () => {
  for (const name of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    assert.ok(process.env[name], `${name} is required`);
  }
  const pool = createDatabasePool(process.env);
  const verificationTokens = new Map();
  let server;
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const short = suffix.slice(-18);
  const onetSource = `onet:e2e-snapshot:${short}:en`;
  const escoSource = `esco:e2e-snapshot:${short}:fr`;
  const onetOccupation = `${onetSource}:occupation`;
  const escoOccupation = `${escoSource}:occupation`;
  const escoSkill = `${escoSource}:skill`;
  const escoSkillUri = `http://data.europa.eu/esco/skill/e2e-snapshot-${short}`;
  const password = 'correct horse battery staple';

  try {
    await migrateUp(pool, migrationsDirectory);
    await seedRiasecInstrument(pool);
    await pool.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256, record_count, metadata_json
       ) VALUES
         (?, 'onet', ?, 'en', 'O*NET E2E', 'https://example.test/onet', 'CC BY 4.0', 'https://example.test/license', 'O*NET test', ?, 1, JSON_OBJECT()),
         (?, 'esco', ?, 'fr', 'ESCO E2E', 'https://example.test/esco', 'CC BY 4.0', 'https://example.test/license', 'ESCO test', ?, 2, JSON_OBJECT())`,
      [onetSource, `30.3-${short}`, 'a'.repeat(64), escoSource, `1.2.1-${short}`, 'b'.repeat(64)],
    );
    await pool.execute(
      `INSERT INTO career_occupations (
         id, catalog_source_id, source_code, locale, preferred_label, description,
         isco_code, job_zone, riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
         riasec_display_code, riasec_profile_status, riasec_provenance_json, local_relevance_status, metadata_json
       ) VALUES
         (?, ?, 'E2E-01', 'en', 'Profile snapshot occupation', 'Test occupation.', NULL, 4,
          20, 70, 30, 90, 35, 45, 'SIC', 'direct', JSON_OBJECT('source', 'O*NET'), 'relevant', JSON_OBJECT()),
         (?, ?, ?, 'fr', 'métier de snapshot', 'Métier français de test.', '2421', NULL,
          NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'missing', JSON_OBJECT('source', 'ESCO'), 'unreviewed', JSON_OBJECT())`,
      [onetOccupation, onetSource, escoOccupation, escoSource, `http://data.europa.eu/esco/occupation/e2e-snapshot-${short}`],
    );
    await pool.execute(
      `INSERT INTO career_skills (id, catalog_source_id, source_code, locale, preferred_label, description, skill_kind, metadata_json)
       VALUES (?, ?, ?, 'fr', 'analyser des données', 'Compétence de test.', 'skill', JSON_OBJECT())`,
      [escoSkill, escoSource, escoSkillUri],
    );
    await pool.execute(
      `INSERT INTO career_occupation_skill_links (occupation_id, skill_id, relation_kind, importance_score, provenance_json)
       VALUES (?, ?, 'essential', 100, JSON_OBJECT('source', 'ESCO'))`,
      [escoOccupation, escoSkill],
    );
    await pool.execute(
      `INSERT INTO career_occupation_crosswalks (
         source_occupation_id, target_occupation_id, mapping_kind, confidence_score,
         confidence_level, review_status, source_reference, source_version, mapped_at, provenance_json
       ) VALUES (?, ?, 'close', NULL, 'unknown', 'official', 'e2e', 'e2e-v1', NULL, JSON_OBJECT('source', 'test'))`,
      [onetOccupation, escoOccupation],
    );

    server = http.createServer(createApplication({ pool, verificationTokens }));
    const address = await listen(server);
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const primary = await registerVerifyLogin({ baseUrl, verificationTokens, email: `snapshot-primary-${short}@example.test`, password });
    const secondary = await registerVerifyLogin({ baseUrl, verificationTokens, email: `snapshot-secondary-${short}@example.test`, password });

    const profileBody = {
      first_name: 'Maya', last_name: 'Test', city: 'Paris', country_code: 'FR',
      current_situation: 'job_seeker', primary_goal: 'find_job', mobility_scope: 'international',
    };
    await apiRequest(baseUrl, '/api/v1/profile', { method: 'PUT', token: primary.accessToken, body: profileBody });
    await apiRequest(baseUrl, '/api/v1/profile/education', {
      method: 'PUT', token: primary.accessToken,
      body: { education: [{ education_level: 'licence', status: 'completed', diploma_name: 'Licence test', end_year: 2025 }] },
    });
    await apiRequest(baseUrl, '/api/v1/profile/skills', {
      method: 'PUT', token: primary.accessToken,
      body: { skills: [{ label: 'texte client ignoré', esco_uri: escoSkillUri, proficiency: 'advanced' }] },
    });

    const result = await createRiasecResult({ baseUrl, session: primary });
    const { payload: recommendation } = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}?locale=fr&limit=10`,
      { token: primary.accessToken },
    );
    assert.equal(recommendation.versioning.recommendationAlgorithmVersion, 'career-profile-context-v2');
    assert.equal(recommendation.matching.matches[0].preferredLabel, 'métier de snapshot');
    assert.equal(recommendation.matching.matches[0].profileComponents.education.frameworkKind, 'four_level');

    const { payload: firstSnapshot } = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}/snapshots?locale=fr&limit=10`,
      { method: 'POST', token: primary.accessToken, expectedStatus: 201 },
    );
    const { payload: repeatedSnapshot } = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}/snapshots?locale=fr&limit=10`,
      { method: 'POST', token: primary.accessToken, expectedStatus: 200 },
    );
    assert.equal(repeatedSnapshot.snapshot.id, firstSnapshot.snapshot.id);

    await apiRequest(baseUrl, '/api/v1/profile', {
      method: 'PUT', token: primary.accessToken,
      body: { ...profileBody, primary_goal: 'career_change' },
    });
    const { payload: changedSnapshot } = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}/snapshots?locale=fr&limit=10`,
      { method: 'POST', token: primary.accessToken, expectedStatus: 201 },
    );
    assert.notEqual(changedSnapshot.snapshot.profileFingerprint, firstSnapshot.snapshot.profileFingerprint);

    const { payload: reread } = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendation-snapshots/${encodeURIComponent(firstSnapshot.snapshot.id)}`,
      { token: primary.accessToken },
    );
    assert.deepEqual(reread.recommendation, firstSnapshot.recommendation);
    const isolation = await apiRequest(
      baseUrl,
      `/api/v1/career/recommendation-snapshots/${encodeURIComponent(firstSnapshot.snapshot.id)}`,
      { token: secondary.accessToken, expectedStatus: 404 },
    );
    assert.equal(isolation.payload.error.code, 'CAREER_SNAPSHOT_NOT_FOUND');

    console.log(JSON.stringify({
      status: 'passed',
      resultId: result.id,
      firstSnapshotId: firstSnapshot.snapshot.id,
      changedSnapshotId: changedSnapshot.snapshot.id,
      onetVersion: firstSnapshot.snapshot.onetSources[0].version,
      escoVersion: firstSnapshot.snapshot.escoSources[0].version,
      isolation: '404 CAREER_SNAPSHOT_NOT_FOUND',
    }, null, 2));
    console.log('CAREER PROFILE SNAPSHOT E2E PASSED');
  } finally {
    await closeServer(server);
    await pool.query('DELETE FROM career_occupation_skill_links WHERE occupation_id = ?', [escoOccupation]).catch(() => undefined);
    await pool.query('DELETE FROM career_occupation_crosswalks WHERE source_occupation_id = ?', [onetOccupation]).catch(() => undefined);
    await pool.query('DELETE FROM career_skills WHERE catalog_source_id = ?', [escoSource]).catch(() => undefined);
    await pool.query('DELETE FROM career_occupations WHERE catalog_source_id IN (?, ?)', [onetSource, escoSource]).catch(() => undefined);
    await pool.query('DELETE FROM career_catalog_sources WHERE id IN (?, ?)', [onetSource, escoSource]).catch(() => undefined);
    await pool.query("DELETE FROM auth_accounts WHERE email LIKE 'snapshot-%@example.test'").catch(() => undefined);
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
