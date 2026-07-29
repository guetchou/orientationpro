'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const { createProfileSynthesisStore } = require('../src/profile/synthesis-store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('profile synthesis is immutable, idempotent and account-scoped in MySQL', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = crypto.randomUUID();
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const attemptId = crypto.randomUUID();
  const resultId = crypto.randomUUID();
  const recommendationId = crypto.randomUUID();
  const instrumentId = `synthesis-instrument-${suffix}`;
  const store = createProfileSynthesisStore(pool);

  await migrateUp(pool, directory);
  try {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
      [accountA, `synthesis-a-${suffix}@example.test`, accountB, `synthesis-b-${suffix}@example.test`],
    );
    await pool.query(
      `INSERT INTO orientation_riasec_instruments (
         id, slug, version, locale, status, title, response_scale, dimensions_json,
         methodology, source_kind, source_reference, license_text, disclaimer,
         scoring_version, content_hash
       ) VALUES (?, ?, 1, 'fr', 'draft', 'Synthèse test', JSON_OBJECT(),
                 JSON_ARRAY('R','I','A','S','E','C'), 'Test', 'original',
                 'test', 'test', 'test', 'riasec-makoki-scoring-v2', ?)`,
      [instrumentId, instrumentId, 'a'.repeat(64)],
    );
    await pool.query(
      `INSERT INTO orientation_riasec_attempts (
         id, account_id, instrument_id, status, item_order, completed_at
       ) VALUES (?, ?, ?, 'completed', JSON_ARRAY(), CURRENT_TIMESTAMP(3))`,
      [attemptId, accountA, instrumentId],
    );
    await pool.query(
      `INSERT INTO orientation_results (
         id, attempt_id, account_id, instrument_id, result_type,
         algorithm_version, primary_code, display_code, scores_json,
         ranking_json, differentiation_json, response_pattern_json, result_snapshot
       ) VALUES (?, ?, ?, ?, 'riasec', 'riasec-makoki-scoring-v2', NULL, 'S/E-I',
                 JSON_OBJECT('S', JSON_OBJECT('normalized', 80)),
                 JSON_OBJECT('codeStatus', 'tied'),
                 JSON_OBJECT('kind', 'descriptive', 'percentile', NULL),
                 JSON_OBJECT(), JSON_OBJECT())`,
      [resultId, attemptId, accountA, instrumentId],
    );
    await pool.query(
      `INSERT INTO account_profiles (
         account_id, first_name, last_name, city, country_code,
         current_situation, primary_goal, mobility_scope, completion_percent
       ) VALUES (?, 'Maya', 'Test', 'Paris', 'FR', 'job_seeker', 'find_job',
                 'international', 100)`,
      [accountA],
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
                   JSON_OBJECT('occupationId', 'occupation-1', 'preferredLabel', 'Analyste',
                               'recommendationScore', 88, 'fitScore', 84)
                 ))))`,
      [recommendationId, accountA, resultId, 'b'.repeat(64), 'c'.repeat(64)],
    );

    const first = await store.create({ accountId: accountA });
    assert.equal(first.created, true);
    const repeated = await store.create({ accountId: accountA });
    assert.equal(repeated.created, false);
    assert.equal(repeated.snapshot.id, first.snapshot.id);

    await pool.query(`UPDATE account_profiles SET primary_goal = 'career_change' WHERE account_id = ?`, [accountA]);
    const changed = await store.create({ accountId: accountA });
    assert.equal(changed.created, true);
    assert.notEqual(changed.snapshot.inputFingerprint, first.snapshot.inputFingerprint);

    const reread = await store.get(accountA, first.snapshot.id);
    assert.deepEqual(reread.synthesis, first.synthesis);
    assert.equal(await store.get(accountB, first.snapshot.id), null);
    assert.equal((await store.list(accountA)).length, 2);
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.query('DELETE FROM orientation_riasec_instruments WHERE id = ?', [instrumentId]);
    await pool.end();
  }
});
