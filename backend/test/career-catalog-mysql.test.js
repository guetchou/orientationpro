const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('occupation catalog preserves provenance and enforces RIASEC ranges', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sourceId = `internal:test:${suffix}`;
  const occupationId = `${sourceId}:occupation`;

  await migrateUp(pool, directory);
  try {
    await pool.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256,
         record_count, metadata_json
       ) VALUES (?, 'internal', 'test', 'fr', 'Catalogue de test', 'https://example.test/source',
                 'Test license', 'https://example.test/license', 'Attribution de test', ?, 1, JSON_OBJECT())`,
      [sourceId, 'a'.repeat(64)],
    );

    await pool.execute(
      `INSERT INTO career_occupations (
         id, catalog_source_id, source_code, locale, preferred_label, description,
         riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
         riasec_display_code, riasec_profile_status, riasec_provenance_json, metadata_json
       ) VALUES (?, ?, 'TEST-01', 'fr', 'Métier de test', 'Description de test',
                 90, 80, 70, 30, 20, 10, 'RIA', 'reviewed',
                 JSON_OBJECT('reviewed', TRUE), JSON_OBJECT())`,
      [occupationId, sourceId],
    );

    const [[occupation]] = await pool.query(
      `SELECT preferred_label, riasec_r, riasec_display_code,
              riasec_profile_status, local_relevance_status
       FROM career_occupations WHERE id = ?`,
      [occupationId],
    );
    assert.equal(occupation.preferred_label, 'Métier de test');
    assert.equal(Number(occupation.riasec_r), 90);
    assert.equal(occupation.riasec_display_code, 'RIA');
    assert.equal(occupation.riasec_profile_status, 'reviewed');
    assert.equal(occupation.local_relevance_status, 'unreviewed');

    await assert.rejects(
      pool.execute(
        `UPDATE career_occupations SET riasec_r = 101 WHERE id = ?`,
        [occupationId],
      ),
    );

    await pool.execute(
      `INSERT INTO career_occupation_aliases (
         occupation_id, locale, alias, alias_kind, source_reference
       ) VALUES (?, 'fr', 'Appellation locale de test', 'local', 'revue-test')`,
      [occupationId],
    );
    const [[aliasCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM career_occupation_aliases WHERE occupation_id = ?',
      [occupationId],
    );
    assert.equal(Number(aliasCount.count), 1);
  } finally {
    await pool.query('DELETE FROM career_occupations WHERE catalog_source_id = ?', [sourceId]);
    await pool.query('DELETE FROM career_catalog_sources WHERE id = ?', [sourceId]);
    await pool.end();
  }
});
