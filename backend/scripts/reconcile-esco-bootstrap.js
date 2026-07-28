'use strict';

const { createDatabasePool } = require('../src/db/pool');

const SOURCE_ID = 'esco:1.2.1:fr';

const reconcile = async (env = process.env) => {
  const expectedHash = env.EXPECTED_BOOTSTRAP_HASH;
  if (!/^[0-9a-f]{64}$/u.test(expectedHash || '')) {
    throw new Error('EXPECTED_BOOTSTRAP_HASH is required.');
  }
  const pool = createDatabasePool(env);
  const connection = await pool.getConnection();
  try {
    const [[source]] = await connection.query(
      'SELECT content_sha256 FROM career_catalog_sources WHERE id = ? LIMIT 1',
      [SOURCE_ID],
    );
    if (!source || source.content_sha256 !== expectedHash) {
      return { action: 'skipped', reason: source ? 'different-source-hash' : 'source-absent' };
    }
    const [[protectedRows]] = await connection.query(
      `SELECT
         SUM(local_relevance_status <> 'unreviewed' OR local_relevance_notes IS NOT NULL) AS local_annotations,
         (SELECT COUNT(*) FROM career_occupation_crosswalks c
          JOIN career_occupations o ON o.id = c.target_occupation_id
          WHERE o.catalog_source_id = ?) AS crosswalks
       FROM career_occupations
       WHERE catalog_source_id = ?`,
      [SOURCE_ID, SOURCE_ID],
    );
    if (Number(protectedRows.local_annotations || 0) || Number(protectedRows.crosswalks || 0)) {
      throw new Error('Temporary ESCO bootstrap has protected annotations or crosswalks; refusing cleanup.');
    }
    await connection.beginTransaction();
    const [occupations] = await connection.execute(
      'DELETE FROM career_occupations WHERE catalog_source_id = ?',
      [SOURCE_ID],
    );
    const [skills] = await connection.execute(
      'DELETE FROM career_skills WHERE catalog_source_id = ?',
      [SOURCE_ID],
    );
    await connection.commit();
    return { action: 'removed-temporary-bootstrap', occupations: occupations.affectedRows, skills: skills.affectedRows };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

if (require.main === module) {
  reconcile().then((result) => console.log(JSON.stringify(result))).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { reconcile };
