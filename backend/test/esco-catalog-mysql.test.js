'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');
const { migrateDown, migrateUp } = require('../src/db/migrate');
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

test('French ESCO presentation remains linked to O*NET RIASEC and explicit English fallback', async () => {
  const pool = createPool();
  const migrationsDirectory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, migrationsDirectory);
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const onetSource = `onet:test:${suffix}:en`;
  const escoSource = `esco:test:${suffix}:fr`;
  const onetNurse = `${onetSource}:29-1141.00`;
  const onetAccountant = `${onetSource}:13-2011.00`;
  const escoNurse = `${escoSource}:nurse`;
  const skill = `${escoSource}:skill:care`;
  const store = createCareerStore(pool);

  try {
    await pool.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256,
         record_count, metadata_json
       ) VALUES
         (?, 'onet', '30.3', 'en', 'O*NET test', 'https://example.test/onet', 'CC BY 4.0', 'https://example.test/license', 'O*NET attribution', ?, 2, JSON_OBJECT()),
         (?, 'esco', '1.2.1', 'fr', 'ESCO test', 'https://example.test/esco', 'CC BY 4.0', 'https://example.test/license', 'ESCO attribution', ?, 1, JSON_OBJECT())`,
      [onetSource, 'a'.repeat(64), escoSource, 'b'.repeat(64)],
    );
    await pool.execute(
      `INSERT INTO career_occupations (
         id, catalog_source_id, source_code, locale, preferred_label, description,
         isco_code, riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
         riasec_display_code, riasec_profile_status, riasec_provenance_json, metadata_json
       ) VALUES
         (?, ?, '29-1141.00', 'en', 'Registered Nurses', 'Assess patient health problems.', NULL, 20, 70, 30, 90, 35, 45, 'SIC', 'direct', JSON_OBJECT('source', 'O*NET'), JSON_OBJECT()),
         (?, ?, '13-2011.00', 'en', 'Accountants and Auditors', 'Examine financial statements.', NULL, 10, 55, 15, 25, 60, 90, 'CEI', 'direct', JSON_OBJECT('source', 'O*NET'), JSON_OBJECT()),
         (?, ?, 'http://data.europa.eu/esco/occupation/nurse', 'fr', 'infirmier/infirmière', 'Dispense des soins infirmiers.', '2221', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'missing', JSON_OBJECT('source', 'ESCO'), JSON_OBJECT())`,
      [onetNurse, onetSource, onetAccountant, onetSource, escoNurse, escoSource],
    );
    await pool.execute(
      `INSERT INTO career_occupation_aliases (occupation_id, locale, alias, alias_kind, source_reference)
       VALUES (?, 'fr', 'infirmier', 'alternate', ?)`,
      [escoNurse, escoSource],
    );
    await pool.execute(
      `INSERT INTO career_skills (id, catalog_source_id, source_code, locale, preferred_label, description, skill_kind, metadata_json)
       VALUES (?, ?, 'http://data.europa.eu/esco/skill/care', 'fr', 'prodiguer des soins', 'Fournir des soins.', 'skill', JSON_OBJECT())`,
      [skill, escoSource],
    );
    await pool.execute(
      `INSERT INTO career_occupation_skill_links (occupation_id, skill_id, relation_kind, importance_score, provenance_json)
       VALUES (?, ?, 'essential', NULL, JSON_OBJECT('source', 'ESCO'))`,
      [escoNurse, skill],
    );
    await pool.execute(
      `INSERT INTO career_occupation_crosswalks (
         source_occupation_id, target_occupation_id, mapping_kind, confidence_score,
         confidence_level, review_status, source_reference, source_version, mapped_at,
         provenance_json
       ) VALUES (?, ?, 'close', NULL, 'unknown', 'official', 'https://example.test/crosswalk.csv', 'official-2023-08', NULL, JSON_OBJECT('source', 'European Commission'))`,
      [onetNurse, escoNurse],
    );

    const french = await store.searchOccupations({ query: 'infirmier', locale: 'fr' });
    assert.equal(french.length, 1);
    assert.equal(french[0].id, onetNurse);
    assert.equal(french[0].preferredLabel, 'infirmier/infirmière');
    assert.equal(french[0].translationStatus, 'available');
    assert.equal(french[0].riasec.S, 90);
    assert.equal(french[0].riasecSource.kind, 'onet');
    assert.equal(french[0].presentationSource.kind, 'esco');
    assert.equal(french[0].crosswalk.reviewStatus, 'official');
    assert.equal(french[0].crosswalk.confidenceScore, null);
    assert.equal(french[0].crosswalk.confidenceLevel, 'unknown');
    assert.equal(french[0].crosswalk.mappedAt, null);

    const detail = await store.getOccupation({ occupationId: onetNurse, locale: 'fr' });
    assert.equal(detail.aliases[0].label, 'infirmier');
    assert.equal(detail.skills[0].preferredLabel, 'prodiguer des soins');

    const fallback = await store.getOccupation({ occupationId: onetAccountant, locale: 'fr' });
    assert.equal(fallback.preferredLabel, 'Accountants and Auditors');
    assert.equal(fallback.locale, 'en');
    assert.equal(fallback.fallbackLocale, 'en');
    assert.equal(fallback.translationStatus, 'unavailable');

    // 007 social auth et 008 profil sont au-dessus de la 006 ESCO : on les
    // retire d'abord pour que le rollback suivant cible bien la 006, dont le
    // retrait doit etre refuse.
    while (true) {
      const [[latest]] = await pool.query(
        'SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1',
      );
      if (!latest || latest.version <= '006_esco_fr_catalog') break;
      await migrateDown(pool, migrationsDirectory);
    }

    await assert.rejects(migrateDown(pool, migrationsDirectory));
    const [[migrationStillApplied]] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM schema_migrations
       WHERE version = '006_esco_fr_catalog'`,
    );
    const [[confidenceColumnStillPresent]] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'career_occupation_crosswalks'
         AND column_name = 'confidence_level'`,
    );
    assert.equal(Number(migrationStillApplied.count), 1);
    assert.equal(Number(confidenceColumnStillPresent.count), 1);
  } finally {
    await pool.query('DELETE FROM career_occupation_skill_links WHERE occupation_id = ?', [escoNurse]);
    await pool.query('DELETE FROM career_occupation_crosswalks WHERE source_occupation_id IN (?, ?)', [onetNurse, onetAccountant]);
    await pool.query('DELETE FROM career_occupation_aliases WHERE occupation_id = ?', [escoNurse]);
    await pool.query('DELETE FROM career_skills WHERE catalog_source_id = ?', [escoSource]);
    await pool.query('DELETE FROM career_occupations WHERE catalog_source_id IN (?, ?)', [onetSource, escoSource]);
    await pool.query('DELETE FROM career_catalog_sources WHERE id IN (?, ?)', [onetSource, escoSource]);
    await pool.end();
  }
});
