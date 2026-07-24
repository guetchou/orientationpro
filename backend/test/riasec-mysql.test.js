const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const { createMySqlAuthStore } = require('../src/auth-v1/mysql-store');
const { createPermissionChecker } = require('../src/auth-v1/permissions');
const { migrateUp } = require('../src/db/migrate');
const { instrument: definition } = require('../src/orientation/riasec/instrument');
const { scoreRiasec } = require('../src/orientation/riasec/scoring');
const { createRiasecStore } = require('../src/orientation/riasec/store');
const { seedRiasecInstrument } = require('../scripts/seed-riasec');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('RIASEC instrument, permissions, attempt and immutable result persist in isolated MySQL', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, directory);
  const firstSeed = await seedRiasecInstrument(pool);
  const secondSeed = await seedRiasecInstrument(pool);

  await pool.query(
    `DELETE FROM orientation_riasec_items
     WHERE instrument_id = ?
     ORDER BY position DESC
     LIMIT 1`,
    [definition.id],
  );
  const repairedSeed = await seedRiasecInstrument(pool);
  const stableSeed = await seedRiasecInstrument(pool);

  const authStore = createMySqlAuthStore(pool);
  const hasPermission = createPermissionChecker(pool);
  const store = createRiasecStore(pool);
  const account = await authStore.createAccount({
    email: `riasec-${Date.now()}@example.test`,
    passwordHash: await bcrypt.hash('correct horse battery staple', 4),
    role: 'user',
    status: 'active',
  });

  try {
    assert.ok(['created', 'unchanged'].includes(firstSeed.status));
    assert.equal(secondSeed.status, 'unchanged');
    assert.equal(repairedSeed.status, 'updated-draft');
    assert.equal(stableSeed.status, 'unchanged');

    assert.equal(await hasPermission({
      accountId: account.id,
      permissionId: 'orientation.result.create',
    }), true);
    assert.equal(await hasPermission({
      accountId: account.id,
      permissionId: 'orientation.result.read_own',
    }), true);
    assert.equal(await hasPermission({
      accountId: account.id,
      permissionId: 'orientation.result.read_assigned',
    }), false);

    const instrument = await store.getInstrument(definition.id);
    assert.equal(instrument.items.length, 60);
    assert.equal(instrument.status, 'draft');
    assert.equal(instrument.contentHash.length, 64);
    assert.deepEqual(instrument.dimensions, definition.dimensions);

    const itemOrder = instrument.items.map((item) => item.id).reverse();
    const attempt = await store.createAttempt({
      accountId: account.id,
      instrumentId: instrument.id,
      itemOrder,
    });
    const storedAttempt = await store.getAttempt({
      accountId: account.id,
      attemptId: attempt.id,
    });
    assert.deepEqual(storedAttempt.itemOrder, itemOrder);
    assert.equal(storedAttempt.status, 'in_progress');

    const responses = instrument.items.map((item, index) => ({
      itemId: item.id,
      value: (index % 5) + 1,
    }));
    const result = scoreRiasec({ items: instrument.items, responses });
    const snapshot = {
      instrument: {
        id: instrument.id,
        version: instrument.version,
        contentHash: instrument.contentHash,
      },
      result,
    };
    const completion = await store.completeAttempt({
      accountId: account.id,
      attemptId: attempt.id,
      instrumentId: instrument.id,
      responses,
      result,
      snapshot,
    });

    assert.equal(completion.status, 'completed');
    assert.equal(completion.result.accountId, account.id);
    assert.equal(completion.result.algorithmVersion, result.algorithmVersion);
    assert.deepEqual(completion.result.scores, result.scores);
    assert.equal(completion.result.snapshot.instrument.contentHash, instrument.contentHash);

    const replay = await store.completeAttempt({
      accountId: account.id,
      attemptId: attempt.id,
      instrumentId: instrument.id,
      responses,
      result,
      snapshot,
    });
    assert.equal(replay.status, 'already_completed');
    assert.equal(replay.result.id, completion.result.id);

    const history = await store.listResults({ accountId: account.id });
    assert.equal(history.length, 1);
    assert.equal(history[0].id, completion.result.id);
    assert.equal(
      await store.getResult({ accountId: 'another-account', resultId: completion.result.id }),
      null,
    );
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id = ?', [account.id]);
    await pool.end();
  }
});
