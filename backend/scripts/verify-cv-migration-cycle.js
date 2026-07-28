'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');
const { migrateDown, migrateUp } = require('../src/db/migrate');

const CV_MIGRATION = '005_cv_analysis_v1';
const CLONE_NAME_PATTERN = /(clone|preflight|test)/iu;
const PROTECTED_TABLES = [
  ['riasecInstruments', 'orientation_riasec_instruments', '`id`'],
  ['riasecItems', 'orientation_riasec_items', '`id`'],
  ['catalogSources', 'career_catalog_sources', '`id`'],
  ['occupations', 'career_occupations', '`id`'],
  ['occupationAliases', 'career_occupation_aliases', '`occupation_id`, `locale`, `alias`'],
  ['skills', 'career_skills', '`id`'],
  ['occupationSkillLinks', 'career_occupation_skill_links', '`occupation_id`, `skill_id`, `relation_kind`'],
  ['occupationCrosswalks', 'career_occupation_crosswalks', '`source_occupation_id`, `target_occupation_id`, `mapping_kind`'],
];

const requireCloneGuard = () => {
  const databaseName = String(process.env.DB_NAME || '');
  if (process.env.RELEASE_PREFLIGHT_CONFIRM_CLONE !== 'true') throw new Error('RELEASE_PREFLIGHT_CONFIRM_CLONE=true is required.');
  if (!CLONE_NAME_PATTERN.test(databaseName)) throw new Error('DB_NAME must identify a clone, preflight or test database.');
  return databaseName;
};
const tableExists = async (pool, tableName) => Number((await pool.execute('SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?', [tableName]))[0][0].count) === 1;
const migrationExists = async (pool, version) => Number((await pool.execute('SELECT COUNT(*) AS count FROM schema_migrations WHERE version=?', [version]))[0][0].count) === 1;
const latestMigration = async (pool) => (await pool.query('SELECT version FROM schema_migrations ORDER BY applied_at DESC, version DESC LIMIT 1'))[0][0]?.version || null;
const scalarCount = async (pool, sql) => Number((await pool.query(sql))[0][0].count);
const normalizeValue = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString('hex');
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeValue(value[key])]));
  return value;
};
const hashTable = async (pool, tableName, orderBy) => {
  const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` ORDER BY ${orderBy}`);
  const hash = createHash('sha256');
  for (const row of rows) { hash.update(JSON.stringify(normalizeValue(row)), 'utf8'); hash.update('\n', 'utf8'); }
  return { count: rows.length, sha256: hash.digest('hex') };
};
const snapshotProtectedData = async (pool) => {
  const snapshot = {};
  for (const [key, name, orderBy] of PROTECTED_TABLES) snapshot[key] = await hashTable(pool, name, orderBy);
  return snapshot;
};
const assertCvMigrationApplied = async (pool) => {
  assert.equal(await migrationExists(pool, CV_MIGRATION), true);
  assert.equal(await tableExists(pool, 'cv_analyses'), true);
  assert.equal(await scalarCount(pool, "SELECT COUNT(*) AS count FROM auth_permissions WHERE id LIKE 'cv.%'"), 4);
  assert.equal(await scalarCount(pool, "SELECT COUNT(*) AS count FROM auth_role_permissions WHERE permission_id LIKE 'cv.%'"), 28);
};

const main = async () => {
  const databaseName = requireCloneGuard();
  const pool = createDatabasePool(process.env);
  const directory = path.join(__dirname, '..', 'migrations');
  try {
    await migrateUp(pool, directory);
    await assertCvMigrationApplied(pool);
    const migration = await latestMigration(pool);
    assert.ok(migration);
    const before = await snapshotProtectedData(pool);
    assert.equal(await migrateDown(pool, directory), migration);
    assert.equal(await migrationExists(pool, migration), false);
    if (migration === CV_MIGRATION) assert.equal(await tableExists(pool, 'cv_analyses'), false);
    else await assertCvMigrationApplied(pool);
    assert.deepEqual(await snapshotProtectedData(pool), before);
    await migrateUp(pool, directory);
    assert.equal(await migrationExists(pool, migration), true);
    await assertCvMigrationApplied(pool);
    const after = await snapshotProtectedData(pool);
    assert.deepEqual(after, before);
    process.stdout.write(`${JSON.stringify({ databaseName, migration, cycle: ['up', 'down', 'up'], protectedData: after, cvPermissions: 4, cvRolePermissions: 28, success: true }, null, 2)}\n`);
  } finally { await pool.end(); }
};
main().catch((error) => { process.stderr.write(`Migration preflight failed: ${error.message}\n`); process.exitCode = 1; });
