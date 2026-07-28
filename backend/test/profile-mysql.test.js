'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const { createProfileStore } = require('../src/profile/store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('adaptive profile persists education, sourced skills and account-scoped hypothesis decisions', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sourceVersion = `test-${crypto.createHash('sha256').update(suffix).digest('hex').slice(0, 12)}`;
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const hypothesisId = crypto.randomUUID();
  const cvSkillId = crypto.randomUUID();
  const sourceId = `esco:${sourceVersion}:fr`;
  const catalogSkillId = `${sourceId}:skill`;
  const escoUri = `http://data.europa.eu/esco/skill/profile-test-${suffix}`;

  await migrateUp(pool, directory);
  try {
    await pool.execute(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'test-hash', 'active'), (?, ?, 'test-hash', 'active')`,
      [accountA, `profile-a-${suffix}@example.test`, accountB, `profile-b-${suffix}@example.test`],
    );

    await pool.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256,
         record_count, metadata_json
       ) VALUES (?, 'esco', ?, 'fr', 'Catalogue ESCO profil test',
                 'https://example.test/profile-source', 'Test license',
                 'https://example.test/license', 'Attribution test', ?, 1, JSON_OBJECT())`,
      [sourceId, sourceVersion, 'b'.repeat(64)],
    );
    await pool.execute(
      `INSERT INTO career_skills (
         id, catalog_source_id, source_code, locale, preferred_label,
         description, skill_kind, metadata_json
       ) VALUES (?, ?, ?, 'fr', 'Analyser des données de test',
                 'Compétence ESCO simulée pour le profil.', 'skill', JSON_OBJECT())`,
      [catalogSkillId, sourceId, escoUri],
    );

    await pool.execute(
      `INSERT INTO account_profile_skills (
         id, account_id, label, esco_uri, proficiency, source,
         confirmation_status, evidence
       ) VALUES (?, ?, 'Compétence extraite du CV', NULL, 'intermediate',
                 'cv', 'confirmed', 'CV de test')`,
      [cvSkillId, accountA],
    );
    await pool.execute(
      `INSERT INTO account_profile_hypotheses (
         id, account_id, hypothesis_type, value_json, rationale, confidence, status
       ) VALUES (?, ?, 'preferred_environment', JSON_OBJECT('value', 'collaboratif'),
                 'Déduit de réponses de test.', 0.750, 'proposed')`,
      [hypothesisId, accountA],
    );

    const store = createProfileStore(pool);
    const savedProfile = await store.upsertProfile(accountA, {
      first_name: 'Maya',
      last_name: 'M',
      city: 'Brazzaville',
      country_code: 'CG',
      current_situation: 'student',
      primary_goal: 'choose_studies',
      mobility_scope: 'national',
      account_id: accountB,
    });
    assert.equal(savedProfile.profile.account_id, accountA);
    assert.equal(savedProfile.profile.completion_percent, 100);

    const withEducation = await store.replaceEducation(accountA, [{
      education_level: 'licence',
      status: 'completed',
      diploma_name: 'Licence informatique',
      field_of_study: 'Informatique',
      institution: 'Université de test',
      country_code: 'CG',
      start_year: 2020,
      end_year: 2023,
      account_id: accountB,
    }]);
    assert.equal(withEducation.education.length, 1);
    assert.equal(withEducation.education[0].account_id, accountA);

    const withSkills = await store.replaceDeclaredSkills(accountA, [{
      label: 'Analyser des données de test',
      esco_uri: escoUri,
      proficiency: 'advanced',
      account_id: accountB,
    }]);
    assert.equal(withSkills.skills.length, 2);
    assert.equal(withSkills.skills.filter((skill) => skill.source === 'declared').length, 1);
    assert.equal(withSkills.skills.filter((skill) => skill.source === 'cv').length, 1);
    assert.ok(withSkills.skills.every((skill) => skill.account_id === accountA));

    const forbiddenDecision = await store.updateHypothesisStatus(accountB, hypothesisId, 'confirmed');
    assert.equal(forbiddenDecision, null);
    const confirmed = await store.updateHypothesisStatus(accountA, hypothesisId, 'confirmed');
    assert.equal(confirmed.hypotheses[0].status, 'confirmed');

    const suggestions = await store.searchSkills({ query: 'Analyser', locale: 'fr', limit: 8 });
    assert.equal(suggestions.length, 1);
    assert.equal(suggestions[0].esco_uri, escoUri);
    assert.equal(suggestions[0].label, 'Analyser des données de test');

    const isolatedProfile = await store.getProfile(accountB);
    assert.equal(isolatedProfile.profile, null);
    assert.deepEqual(isolatedProfile.education, []);
    assert.deepEqual(isolatedProfile.skills, []);
    assert.deepEqual(isolatedProfile.hypotheses, []);
  } finally {
    await pool.execute('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.execute('DELETE FROM career_skills WHERE catalog_source_id = ?', [sourceId]);
    await pool.execute('DELETE FROM career_catalog_sources WHERE id = ?', [sourceId]);
    await pool.end();
  }
});
