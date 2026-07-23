const fs = require('node:fs/promises');
const path = require('node:path');

const splitStatements = (sql) => sql
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

const ensureMigrationTable = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB
  `);
};

const migrationFiles = async (directory, suffix) => {
  const files = await fs.readdir(directory);
  return files.filter((file) => file.endsWith(suffix)).sort();
};

const executeFile = async (connection, filePath) => {
  const sql = await fs.readFile(filePath, 'utf8');
  for (const statement of splitStatements(sql)) {
    await connection.query(statement);
  }
};

const migrateUp = async (pool, directory) => {
  await ensureMigrationTable(pool);
  const [rows] = await pool.query('SELECT version FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.version));

  for (const file of await migrationFiles(directory, '.up.sql')) {
    const version = file.slice(0, -'.up.sql'.length);
    if (applied.has(version)) continue;
    const connection = await pool.getConnection();
    try {
      await executeFile(connection, path.join(directory, file));
      await connection.query('INSERT INTO schema_migrations (version) VALUES (?)', [version]);
    } finally {
      connection.release();
    }
  }
};

const migrateDown = async (pool, directory) => {
  await ensureMigrationTable(pool);
  const [[latest]] = await pool.query(
    'SELECT version FROM schema_migrations ORDER BY applied_at DESC, version DESC LIMIT 1',
  );
  if (!latest) return null;
  const file = `${latest.version}.down.sql`;
  const connection = await pool.getConnection();
  try {
    await executeFile(connection, path.join(directory, file));
    await connection.query('DELETE FROM schema_migrations WHERE version = ?', [latest.version]);
    return latest.version;
  } finally {
    connection.release();
  }
};

module.exports = { migrateUp, migrateDown };
