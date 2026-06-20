const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');
const { migrateUp, migrateDown } = require('../src/db/migrate');

const main = async () => {
  const direction = process.argv[2] || 'up';
  const pool = createDatabasePool(process.env);
  const directory = path.join(__dirname, '..', 'migrations');
  try {
    if (direction === 'up') {
      await migrateUp(pool, directory);
      process.stdout.write('Migrations applied.\n');
      return;
    }
    if (direction === 'down') {
      const version = await migrateDown(pool, directory);
      process.stdout.write(version ? `Rolled back ${version}.\n` : 'No migration to roll back.\n');
      return;
    }
    throw new Error(`Unsupported migration direction: ${direction}`);
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  process.stderr.write(`Migration failed: ${error.message}\n`);
  process.exitCode = 1;
});
