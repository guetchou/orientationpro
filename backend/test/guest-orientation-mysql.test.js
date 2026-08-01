const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const { createMySqlAuthStore } = require('../src/auth-v1/mysql-store');
const { migrateUp } = require('../src/db/migrate');
const {
  createGuestSessionStore,
  hashToken,
} = require('../src/orientation/guest-sessions');
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

test('guest RIASEC result is transactionally claimed by the authenticated account', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, directory);
  await seedRiasecInstrument(pool);

  const authStore = createMySqlAuthStore(pool);
  const riasecStore = createRiasecStore(pool);
  const guestStore = createGuestSessionStore(pool);
  const account = await authStore.createAccount({
    email: `guest-claim-${Date.now()}@example.test`,
    passwordHash: await bcrypt.hash('correct horse battery staple', 4),
    role: 'user',
    status: 'active',
  });
  const rawGuestToken = `guest-${Date.now()}-${Math.random()}`;
  const guestSession = await guestStore.create({
    tokenHash: hashToken(rawGuestToken),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  try {
    const instrument = await riasecStore.getInstrument(definition.id);
    assert.ok(instrument);
    const itemOrder = instrument.items.map((item) => item.id);
    const attempt = await riasecStore.createAttempt({
      accountId: null,
      guestSessionId: guestSession.id,
      instrumentId: instrument.id,
      itemOrder,
    });
    assert.equal(attempt.ownerType, 'guest');

    const responses = instrument.items.map((item, index) => ({
      itemId: item.id,
      value: (index % 5) + 1,
    }));
    const result = scoreRiasec({
      items: instrument.items,
      responses,
      algorithmVersion: instrument.scoringVersion,
    });
    const completion = await riasecStore.completeAttempt({
      accountId: null,
      guestSessionId: guestSession.id,
      attemptId: attempt.id,
      instrumentId: instrument.id,
      responses,
      result,
      snapshot: { instrument: { id: instrument.id }, result },
    });
    assert.equal(completion.status, 'completed');
    assert.equal(completion.result.ownerType, 'guest');

    const guestResultBeforeClaim = await riasecStore.getResult({
      accountId: null,
      guestSessionId: guestSession.id,
      resultId: completion.result.id,
    });
    assert.equal(guestResultBeforeClaim.id, completion.result.id);

    const claim = await guestStore.claim({
      tokenHash: hashToken(rawGuestToken),
      accountId: account.id,
      now: new Date(),
    });
    assert.deepEqual(claim, { status: 'claimed', attempts: 1, results: 1 });

    const guestResultAfterClaim = await riasecStore.getResult({
      accountId: null,
      guestSessionId: guestSession.id,
      resultId: completion.result.id,
    });
    assert.equal(guestResultAfterClaim, null);

    const accountResult = await riasecStore.getResult({
      accountId: account.id,
      guestSessionId: null,
      resultId: completion.result.id,
    });
    assert.equal(accountResult.id, completion.result.id);
    assert.equal(accountResult.accountId, account.id);
    assert.equal(accountResult.ownerType, 'account');

    const accountAttempt = await riasecStore.getAttempt({
      accountId: account.id,
      guestSessionId: null,
      attemptId: attempt.id,
    });
    assert.equal(accountAttempt.id, attempt.id);
    assert.equal(accountAttempt.ownerType, 'account');

    const repeatedClaim = await guestStore.claim({
      tokenHash: hashToken(rawGuestToken),
      accountId: account.id,
      now: new Date(),
    });
    assert.deepEqual(repeatedClaim, { status: 'not_found', attempts: 0, results: 0 });
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id = ?', [account.id]);
    await pool.query('DELETE FROM orientation_guest_sessions WHERE id = ?', [guestSession.id]);
    await pool.end();
  }
});