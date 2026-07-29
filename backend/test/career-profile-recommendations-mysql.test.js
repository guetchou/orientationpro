'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const { createCareerStore } = require('../src/career/store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('profile recommendations and immutable snapshots remain account-isolated in MySQL', async () => {
  const pool = createPool();
  const migrationsDirectory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, migrationsDirectory);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const short = suffix.slice(-20);
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const instrumentId = `profile-rec-${short}`;
  const attemptId = crypto.randomUUID();
  const resultId = crypto.randomUUID();
  const educationId = crypto.randomUUID();
  const profileSkillId = crypto.randomUUID();
  const onetSource = `onet:profile-rec:${short}:en`;
  const escoSource = `esco:profile-rec:${short}:fr`;
  const onetGeneral = `${onetSource}:general`;
  const onetSkilled = `${onetSource}:skilled`;
  const escoSkilled = `${escoSource}:occupation`;
  const escoSkillId = `${escoSource}:skill`;
  const escoSkillUri = `http://data.europa.eu/esco/skill/profile-rec-${short}`;
  const onetVersion = `30.3-${short}`;
  const escoVersion = `1.2.1-${short}`;
  const store = createCareerStore(pool);

  try {
    await pool.execute(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'test-hash', 'active'), (?, ?, 'test-hash', 'active')`,
      [accountA, `profile-rec-a-${short}@example.test`, accountB, `profile-rec-b-${short}@example.test`],
    );
    await pool.execute(
      `INSERT INTO orientation_riasec_instruments (
         id, slug, version, locale, status, title, response_scale,
         dimensions_json, methodology, source_kind, source_reference,
         license_text, disclaimer, scoring_version, content_hash, published_at
       ) VALUES (?, ?, 1, 'fr', 'active', 'Instrument test', JSON_OBJECT(), JSON_ARRAY('R','I','A','S','E','C'),
                'Méthode de test', 'internal', 'test', 'Test only', 'Test only', 'test-v1', ?, CURRENT_TIMESTAMP(3))`,
      [instrumentId, instrumentId, 'c'.repeat(64)],
    );
    await pool.execute(
      `INSERT INTO orientation_riasec_attempts (
         id, account_id, instrument_id, status, item_order, completed_at
       ) VALUES (?, ?, ?, 'completed', JSON_ARRAY(), CURRENT_TIMESTAMP(3))`,
      [attemptId, accountA, instrumentId],
    );
    await pool.execute(
      `INSERT INTO orientation_results (
         id, attempt_id, account_id, instrument_id, result_type,
         algorithm_version, primary_code, display_code, scores_json,
         ranking_json, differentiation_json, response_pattern_json, result_snapshot
       ) VALUES (?, ?, ?, ?, 'riasec', 'test-riasec-v1', 'SIC', 'SIC',
         JSON_OBJECT(
           'R', JSON_OBJECT('normalized', 20),
           'I', JSON_OBJECT('normalized', 70),
           'A', JSON_OBJECT('normalized', 30),
           'S', JSON_OBJECT('normalized', 90),
           'E', JSON_OBJECT('normalized', 35),
           'C', JSON_OBJECT('normalized', 45)
         ), JSON_OBJECT(), JSON_OBJECT(), JSON_OBJECT(), JSON_OBJECT())`,
      [resultId, attemptId, accountA, instrumentId],
    );
    await pool.execute(
      `INSERT INTO account_profiles (
         account_id, first_name, last_name, city, country_code,
         current_situation, primary_goal, mobility_scope, completion_percent
       ) VALUES (?, 'Maya', 'Test', 'Paris', 'FR', 'job_seeker', 'find_job', 'international', 100)`,
      [accountA],
    );
    await pool.execute(
      `INSERT INTO account_education_history (
         id, account_id, education_level, status, diploma_name, country_code, end_year
       ) VALUES (?, ?, 'licence', 'completed', 'Licence test', 'FR', 2025)`,
      [educationId, accountA],
    );
    await pool.execute(
      `INSERT INTO account_profile_skills (
         id, account_id, label, esco_uri, proficiency, source, confirmation_status
       ) VALUES (?, ?, 'Analyser des données de test', ?, 'expert', 'declared', 'confirmed')`,
      [profileSkillId, accountA, escoSkillUri],
    );

    await pool.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256,
         record_count, metadata_json
       ) VALUES
         (?, 'onet', ?, 'en', 'O*NET profile recommendation test', 'https://example.test/onet', 'CC BY 4.0', 'https://example.test/license', 'O*NET test', ?, 2, JSON_OBJECT()),
         (?, 'esco', ?, 'fr', 'ESCO profile recommendation test', 'https://example.test/esco', 'CC BY 4.0', 'https://example.test/license', 'ESCO test', ?, 2, JSON_OBJECT())`,
      [onetSource, onetVersion, 'd'.repeat(64), escoSource, escoVersion, 'e'.repeat(64)],
    );
    await pool.execute(
      `INSERT INTO career_occupations (
         id, catalog_source_id, source_code, locale, preferred_label, description,
         isco_code, job_zone, riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
         riasec_display_code, riasec_profile_status, riasec_provenance_json,
         local_relevance_status, metadata_json
       ) VALUES
         (?, ?, 'GENERAL', 'en', 'General close occupation', 'General occupation.',
          NULL, 4, 20, 72, 28, 93, 34, 44, 'SIC', 'direct',
          JSON_OBJECT('source', 'O*NET'), 'relevant', JSON_OBJECT()),
         (?, ?, 'SKILLED', 'en', 'Skill-backed occupation', 'Skill-backed occupation.',
          NULL, 4, 22, 68, 32, 88, 36, 46, 'SIC', 'direct',
          JSON_OBJECT('source', 'O*NET'), 'relevant', JSON_OBJECT()),
         (?, ?, ?, 'fr', 'métier soutenu par les compétences', 'Métier de test avec compétence ESCO.',
          '2421', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'missing',
          JSON_OBJECT('source', 'ESCO'), 'unreviewed', JSON_OBJECT())`,
      [onetGeneral, onetSource, onetSkilled, onetSource, escoSkilled, escoSource, `http://data.europa.eu/esco/occupation/profile-rec-${short}`],
    );
    await pool.execute(
      `INSERT INTO career_skills (
         id, catalog_source_id, source_code, locale, preferred_label, description, skill_kind, metadata_json
       ) VALUES (?, ?, ?, 'fr', 'Analyser des données de test', 'Compétence ESCO de test.', 'skill', JSON_OBJECT())`,
      [escoSkillId, escoSource, escoSkillUri],
    );
    await pool.execute(
      `INSERT INTO career_occupation_skill_links (
         occupation_id, skill_id, relation_kind, importance_score, provenance_json
       ) VALUES (?, ?, 'essential', 100, JSON_OBJECT('source', 'ESCO'))`,
      [escoSkilled, escoSkillId],
    );
    await pool.execute(
      `INSERT INTO career_occupation_crosswalks (
         source_occupation_id, target_occupation_id, mapping_kind, confidence_score,
         confidence_level, review_status, source_reference, source_version, mapped_at,
         provenance_json
       ) VALUES (?, ?, 'close', NULL, 'unknown', 'official', 'test-crosswalk', 'test-v1', NULL, JSON_OBJECT('source', 'test'))`,
      [onetSkilled, escoSkilled],
    );

    const recommendation = await store.recommendProfileCareers({ accountId: accountA, resultId, locale: 'fr', limit: 2 });
    assert.equal(recommendation.result.id, resultId);
    assert.equal(recommendation.versioning.recommendationAlgorithmVersion, 'career-profile-context-v2');
    assert.equal(recommendation.versioning.catalogSources.find((source) => source.kind === 'onet').version, onetVersion);
    assert.match(recommendation.versioning.inputFingerprint, /^[a-f0-9]{64}$/u);
    assert.match(recommendation.versioning.profileFingerprint, /^[a-f0-9]{64}$/u);
    assert.equal(recommendation.matching.matches[0].occupationId, onetSkilled);
    assert.equal(recommendation.matching.matches[0].profileComponents.education.frameworkKind, 'four_level');

    const firstSnapshot = await store.createRecommendationSnapshot({ accountId: accountA, resultId, locale: 'fr', limit: 2 });
    assert.equal(firstSnapshot.created, true);
    assert.equal(firstSnapshot.snapshot.immutable, true);
    assert.equal(firstSnapshot.snapshot.onetSources[0].version, onetVersion);

    const repeatedSnapshot = await store.createRecommendationSnapshot({ accountId: accountA, resultId, locale: 'fr', limit: 2 });
    assert.equal(repeatedSnapshot.created, false);
    assert.equal(repeatedSnapshot.snapshot.id, firstSnapshot.snapshot.id);

    await pool.execute("UPDATE account_profiles SET primary_goal = 'career_change' WHERE account_id = ?", [accountA]);
    const changedSnapshot = await store.createRecommendationSnapshot({ accountId: accountA, resultId, locale: 'fr', limit: 2 });
    assert.equal(changedSnapshot.created, true);
    assert.notEqual(changedSnapshot.snapshot.id, firstSnapshot.snapshot.id);
    assert.notEqual(changedSnapshot.snapshot.profileFingerprint, firstSnapshot.snapshot.profileFingerprint);

    const reread = await store.getRecommendationSnapshot({ accountId: accountA, snapshotId: firstSnapshot.snapshot.id });
    assert.deepEqual(reread.recommendation, firstSnapshot.recommendation);
    assert.equal(await store.getRecommendationSnapshot({ accountId: accountB, snapshotId: firstSnapshot.snapshot.id }), null);
    assert.equal(await store.recommendProfileCareers({ accountId: accountB, resultId, locale: 'fr', limit: 2 }), null);
  } finally {
    await pool.query('DELETE FROM career_occupation_skill_links WHERE occupation_id = ?', [escoSkilled]);
    await pool.query('DELETE FROM career_occupation_crosswalks WHERE source_occupation_id IN (?, ?)', [onetGeneral, onetSkilled]);
    await pool.query('DELETE FROM career_skills WHERE catalog_source_id = ?', [escoSource]);
    await pool.query('DELETE FROM career_occupations WHERE catalog_source_id IN (?, ?)', [onetSource, escoSource]);
    await pool.query('DELETE FROM career_catalog_sources WHERE id IN (?, ?)', [onetSource, escoSource]);
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.query('DELETE FROM orientation_riasec_instruments WHERE id = ?', [instrumentId]);
    await pool.end();
  }
});
