'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const { createDatabasePool } = require('../src/db/pool');
const { migrateDown, migrateUp } = require('../src/db/migrate');

const CV_MIGRATION = '005_cv_analysis_v1';
const CLONE_NAME_PATTERN = /(clone|preflight|test)/iu;

const requireCloneGuard = () => {
  const databaseName = String(process.env.DB_NAME || '');

  if (process.env.RELEASE_PREFLIGHT_CONFIRM_CLONE !== 'true') {
    throw new Error(
      'RELEASE_PREFLIGHT_CONFIRM_CLONE=true is required.',
    );
  }

  if (!CLONE_NAME_PATTERN.test(databaseName)) {
    throw new Error(
      'DB_NAME must identify a clone, preflight or test database.',
    );
  }

  return databaseName;
};

const tableExists = async (pool, tableName) => {
  const [[row]] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = ?`,
    [tableName],
  );

  return Number(row.count) === 1;
};

const migrationExists = async (pool, version) => {
  const [[row]] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM schema_migrations
     WHERE version = ?`,
    [version],
  );

  return Number(row.count) === 1;
};

const scalarCount = async (pool, sql) => {
  const [[row]] = await pool.query(sql);
  return Number(row.count);
};

const checksumQuery = async (pool, sql) => {
  const [[row]] = await pool.query(sql);

  return {
    count: Number(row.count),
    sha256: row.sha256,
  };
};

const snapshotProtectedData = async (pool) => {
  await pool.query(
    'SET SESSION group_concat_max_len = 16777216',
  );

  return {
    riasecInstruments: await checksumQuery(
      pool,
      `SELECT
         COUNT(*) AS count,
         SHA2(
           COALESCE(
             GROUP_CONCAT(
               CONCAT_WS(
                 '||',
                 id,
                 slug,
                 version,
                 locale,
                 status,
                 content_hash
               )
               ORDER BY id
               SEPARATOR '\n'
             ),
             ''
           ),
           256
         ) AS sha256
       FROM orientation_riasec_instruments`,
    ),
    riasecItems: await checksumQuery(
      pool,
      `SELECT
         COUNT(*) AS count,
         SHA2(
           COALESCE(
             GROUP_CONCAT(
               CONCAT_WS(
                 '||',
                 id,
                 instrument_id,
                 position,
                 dimension,
                 prompt,
                 reverse_scored
               )
               ORDER BY id
               SEPARATOR '\n'
             ),
             ''
           ),
           256
         ) AS sha256
       FROM orientation_riasec_items`,
    ),
    catalogSources: await checksumQuery(
      pool,
      `SELECT
         COUNT(*) AS count,
         SHA2(
           COALESCE(
             GROUP_CONCAT(
               CONCAT_WS(
                 '||',
                 id,
                 source_kind,
                 source_version,
                 locale,
                 content_sha256,
                 record_count
               )
               ORDER BY id
               SEPARATOR '\n'
             ),
             ''
           ),
           256
         ) AS sha256
       FROM career_catalog_sources`,
    ),
    occupations: await checksumQuery(
      pool,
      `SELECT
         COUNT(*) AS count,
         SHA2(
           COALESCE(
             GROUP_CONCAT(
               CONCAT_WS(
                 '||',
                 id,
                 catalog_source_id,
                 source_code,
                 locale,
                 preferred_label,
                 status,
                 COALESCE(riasec_r, ''),
                 COALESCE(riasec_i, ''),
                 COALESCE(riasec_a, ''),
                 COALESCE(riasec_s, ''),
                 COALESCE(riasec_e, ''),
                 COALESCE(riasec_c, ''),
                 COALESCE(riasec_display_code, ''),
                 riasec_profile_status
               )
               ORDER BY id
               SEPARATOR '\n'
             ),
             ''
           ),
           256
         ) AS sha256
       FROM career_occupations`,
    ),
  };
};

const assertCvMigrationApplied = async (pool) => {
  assert.equal(
    await migrationExists(pool, CV_MIGRATION),
    true,
  );
  assert.equal(
    await tableExists(pool, 'cv_analyses'),
    true,
  );
  assert.equal(
    await scalarCount(
      pool,
      `SELECT COUNT(*) AS count
       FROM auth_permissions
       WHERE id LIKE 'cv.%'`,
    ),
    4,
  );
  assert.equal(
    await scalarCount(
      pool,
      `SELECT COUNT(*) AS count
       FROM auth_role_permissions
       WHERE permission_id LIKE 'cv.%'`,
    ),
    28,
  );
};

const main = async () => {
  const databaseName = requireCloneGuard();
  const pool = createDatabasePool(process.env);
  const migrationsDirectory = path.join(
    __dirname,
    '..',
    'migrations',
  );

  try {
    await migrateUp(pool, migrationsDirectory);
    await assertCvMigrationApplied(pool);

    const protectedBefore = await snapshotProtectedData(pool);
    const rolledBack = await migrateDown(
      pool,
      migrationsDirectory,
    );

    assert.equal(rolledBack, CV_MIGRATION);
    assert.equal(
      await migrationExists(pool, CV_MIGRATION),
      false,
    );
    assert.equal(
      await tableExists(pool, 'cv_analyses'),
      false,
    );

    const protectedAfterDown = await snapshotProtectedData(pool);
    assert.deepEqual(protectedAfterDown, protectedBefore);

    await migrateUp(pool, migrationsDirectory);
    await assertCvMigrationApplied(pool);

    const protectedAfterReapply =
      await snapshotProtectedData(pool);
    assert.deepEqual(protectedAfterReapply, protectedBefore);

    process.stdout.write(`${JSON.stringify({
      databaseName,
      migration: CV_MIGRATION,
      cycle: ['up', 'down', 'up'],
      protectedData: protectedAfterReapply,
      cvPermissions: 4,
      cvRolePermissions: 28,
      success: true,
    }, null, 2)}\n`);
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  process.stderr.write(
    `CV migration preflight failed: ${error.message}\n`,
  );
  process.exitCode = 1;
});
