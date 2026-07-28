'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const path = require('node:path');

const { createDatabasePool } = require('../src/db/pool');
const { migrateDown, migrateUp } = require('../src/db/migrate');

const CV_MIGRATION = '005_cv_analysis_v1';
const CLONE_NAME_PATTERN = /(clone|preflight|test)/iu;

const PROTECTED_TABLES = [
  {
    key: 'riasecInstruments',
    name: 'orientation_riasec_instruments',
    orderBy: '`id`',
  },
  {
    key: 'riasecItems',
    name: 'orientation_riasec_items',
    orderBy: '`id`',
  },
  {
    key: 'catalogSources',
    name: 'career_catalog_sources',
    orderBy: '`id`',
  },
  {
    key: 'occupations',
    name: 'career_occupations',
    orderBy: '`id`',
  },
  {
    key: 'occupationAliases',
    name: 'career_occupation_aliases',
    orderBy: '`occupation_id`, `locale`, `alias`',
  },
  {
    key: 'skills',
    name: 'career_skills',
    orderBy: '`id`',
  },
  {
    key: 'occupationSkillLinks',
    name: 'career_occupation_skill_links',
    orderBy: '`occupation_id`, `skill_id`, `relation_kind`',
  },
  {
    key: 'occupationCrosswalks',
    name: 'career_occupation_crosswalks',
    orderBy:
      '`source_occupation_id`, `target_occupation_id`, `mapping_kind`',
  },
];

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

const normalizeValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('hex');

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          normalizeValue(value[key]),
        ]),
    );
  }

  return value;
};

const hashTable = async (
  pool,
  tableName,
  orderBy,
) => {
  const [rows] = await pool.query(
    `SELECT * FROM \`${tableName}\` ORDER BY ${orderBy}`,
  );
  const hash = createHash('sha256');

  for (const row of rows) {
    hash.update(
      JSON.stringify(normalizeValue(row)),
      'utf8',
    );
    hash.update('\n', 'utf8');
  }

  return {
    count: rows.length,
    sha256: hash.digest('hex'),
  };
};

const snapshotProtectedData = async (pool) => {
  const snapshot = {};

  for (const table of PROTECTED_TABLES) {
    snapshot[table.key] = await hashTable(
      pool,
      table.name,
      table.orderBy,
    );
  }

  return snapshot;
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
