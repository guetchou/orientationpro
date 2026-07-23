const crypto = require('node:crypto');

const { createDatabasePool } = require('../src/db/pool');
const { ALGORITHM_VERSION } = require('../src/orientation/riasec/scoring');
const { instrument } = require('../src/orientation/riasec/instrument');

const hashInstrument = (value) => crypto
  .createHash('sha256')
  .update(JSON.stringify({
    id: value.id,
    version: value.version,
    locale: value.locale,
    methodology: value.methodology,
    items: value.items,
  }))
  .digest('hex');

const seedRiasecInstrument = async (pool, value = instrument) => {
  const contentHash = hashInstrument(value);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [[existing]] = await connection.query(
      `SELECT
         instrument.id,
         instrument.status,
         instrument.content_hash,
         COUNT(item.id) AS item_count
       FROM orientation_riasec_instruments instrument
       LEFT JOIN orientation_riasec_items item
         ON item.instrument_id = instrument.id
       WHERE instrument.id = ?
       GROUP BY instrument.id, instrument.status, instrument.content_hash
       FOR UPDATE`,
      [value.id],
    );

    const itemCountMatches = Number(existing?.item_count) === value.items.length;
    if (existing && existing.content_hash === contentHash && itemCountMatches) {
      await connection.commit();
      return {
        status: 'unchanged',
        instrumentId: value.id,
        contentHash,
        itemCount: value.items.length,
      };
    }

    if (existing && existing.status !== 'draft') {
      const error = new Error('A published or pilot instrument cannot be changed or repaired in place. Create a new version.');
      error.code = 'IMMUTABLE_RIASEC_INSTRUMENT';
      throw error;
    }

    await connection.query(
      `INSERT INTO orientation_riasec_instruments (
         id, slug, version, locale, status, title, methodology,
         source_kind, source_reference, license_text, disclaimer,
         scoring_version, content_hash
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         methodology = VALUES(methodology),
         source_kind = VALUES(source_kind),
         source_reference = VALUES(source_reference),
         license_text = VALUES(license_text),
         disclaimer = VALUES(disclaimer),
         scoring_version = VALUES(scoring_version),
         content_hash = VALUES(content_hash),
         updated_at = CURRENT_TIMESTAMP(3)`,
      [
        value.id,
        value.slug,
        value.version,
        value.locale,
        value.status,
        value.title,
        value.methodology,
        value.source.kind,
        value.source.reference,
        value.source.license,
        value.disclaimer,
        ALGORITHM_VERSION,
        contentHash,
      ],
    );

    await connection.query(
      'DELETE FROM orientation_riasec_items WHERE instrument_id = ?',
      [value.id],
    );

    for (const item of value.items) {
      await connection.query(
        `INSERT INTO orientation_riasec_items (
           id, instrument_id, position, dimension, prompt, reverse_scored
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          value.id,
          item.position,
          item.dimension,
          item.prompt,
          item.reverseScored,
        ],
      );
    }

    await connection.commit();
    return {
      status: existing ? 'updated-draft' : 'created',
      instrumentId: value.id,
      contentHash,
      itemCount: value.items.length,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  try {
    const result = await seedRiasecInstrument(pool);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`RIASEC seed failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  hashInstrument,
  seedRiasecInstrument,
};
