'use strict';

const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');
const { migrateUp } = require('../src/db/migrate');
const { createCvStore } = require('../src/cv/store');
const { createDataRightsService, DataRightsError } = require('../src/data-rights/service');
const { createLifeProjectStore } = require('../src/life-project/store');
const { createRiasecStore } = require('../src/orientation/riasec/store');
const { createProfileStore } = require('../src/profile/store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

test('data rights export, correction, isolation and deletion execute on MySQL', async () => {
  const pool = createPool();
  const migrations = path.join(__dirname, '..', 'migrations');
  const suffix = crypto.randomUUID();
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const password = `Password-${suffix}`;
  const passwordHash = await bcrypt.hash(password, 4);
  const profileStore = createProfileStore(pool);
  const service = createDataRightsService({
    pool,
    profileStore,
    lifeProjectStore: createLifeProjectStore(pool),
    riasecStore: createRiasecStore(pool),
    cvStore: createCvStore(pool),
    now: () => new Date('2026-07-29T00:00:00.000Z'),
    deletionReference: () => `delete-${suffix}`,
  });

  await migrateUp(pool, migrations);
  try {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, ?, 'active'), (?, ?, ?, 'active')`,
      [
        accountA, `data-a-${suffix}@example.test`, passwordHash,
        accountB, `data-b-${suffix}@example.test`, passwordHash,
      ],
    );
    await pool.query(
      `INSERT INTO auth_account_roles (account_id, role_id)
       VALUES (?, 'user'), (?, 'user')`,
      [accountA, accountB],
    );
    await pool.query(
      `INSERT INTO auth_sessions (id, family_id, account_id, expires_at)
       VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY))`,
      [crypto.randomUUID(), crypto.randomUUID(), accountA],
    );
    await profileStore.upsertProfile(accountA, {
      first_name: 'Amina',
      city: 'Matadi',
      country_code: 'CD',
      current_situation: 'student',
      primary_goal: 'choose_studies',
      mobility_scope: 'international',
    });

    const exportedA = await service.exportAccount(accountA);
    assert.equal(exportedA.account.id, accountA);
    assert.equal(exportedA.profile.preferredName, 'Amina');
    assert.equal(exportedA.account.passwordHash, undefined);

    const exportedB = await service.exportAccount(accountB);
    assert.equal(exportedB.account.id, accountB);
    assert.equal(exportedB.profile.preferredName, null);
    assert.equal(JSON.stringify(exportedB).includes(accountA), false);

    await service.correctProfile(accountA, {
      first_name: 'Amina',
      city: 'Kinshasa',
      country_code: 'CD',
      current_situation: 'student',
      primary_goal: 'choose_studies',
      mobility_scope: 'international',
    });
    assert.equal((await service.exportAccount(accountA)).profile.preferredName, 'Amina');

    const deleted = await service.deleteAccount({
      accountId: accountA,
      currentPassword: password,
      confirmation: 'SUPPRIMER MON COMPTE',
    });
    assert.equal(deleted.status, 'deleted');
    assert.equal(deleted.deletionReference, `delete-${suffix}`);

    const [[accountARow]] = await pool.query('SELECT id FROM auth_accounts WHERE id = ?', [accountA]);
    const [[profileARow]] = await pool.query('SELECT account_id FROM account_profiles WHERE account_id = ?', [accountA]);
    const [[sessionARow]] = await pool.query('SELECT id FROM auth_sessions WHERE account_id = ?', [accountA]);
    const [[accountBRow]] = await pool.query('SELECT id FROM auth_accounts WHERE id = ?', [accountB]);
    assert.equal(accountARow, undefined);
    assert.equal(profileARow, undefined);
    assert.equal(sessionARow, undefined);
    assert.equal(accountBRow.id, accountB);

    await assert.rejects(
      service.exportAccount(accountA),
      (error) => error instanceof DataRightsError && error.code === 'ACCOUNT_NOT_FOUND',
    );
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.end();
  }
});
