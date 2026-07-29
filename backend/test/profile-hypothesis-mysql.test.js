'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');
const { migrateUp } = require('../src/db/migrate');
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

const keyOf = (item) => item.value_json?.key;

test('generated hypotheses are idempotent, decisions persist and accounts stay isolated', async () => {
  const pool = createPool();
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const suffix = Date.now();
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));
  try {
    await pool.execute(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
      [accountA, `hyp-a-${suffix}@example.test`, accountB, `hyp-b-${suffix}@example.test`],
    );
    const store = createProfileStore(pool);
    await store.upsertProfile(accountA, {
      first_name: 'Maya', last_name: 'Test', city: 'Paris', country_code: 'FR',
      current_situation: 'student', primary_goal: 'choose_studies', mobility_scope: 'unknown',
    });

    const first = await store.generateHypotheses(accountA);
    assert.ok(first.hypothesisGeneration.createdCount >= 2);
    assert.ok(first.hypotheses.every((item) => item.status === 'proposed'));
    const firstIds = first.hypotheses.map((item) => item.id).sort();

    const repeated = await store.generateHypotheses(accountA);
    assert.equal(repeated.hypothesisGeneration.createdCount, 0);
    assert.deepEqual(repeated.hypotheses.map((item) => item.id).sort(), firstIds);

    const mobility = repeated.hypotheses.find((item) => keyOf(item) === 'mobility.clarify');
    assert.ok(mobility);
    await store.updateHypothesisStatus(accountA, mobility.id, 'rejected');

    await store.upsertProfile(accountA, {
      first_name: 'Maya', last_name: 'Test', city: 'Paris', country_code: 'FR',
      current_situation: 'student', primary_goal: 'career_change', mobility_scope: 'international',
    });
    const changed = await store.generateHypotheses(accountA);
    const rejected = changed.hypotheses.find((item) => item.id === mobility.id);
    assert.equal(rejected.status, 'rejected');
    assert.equal(changed.hypotheses.some((item) => keyOf(item) === 'mobility.clarify' && item.status === 'proposed'), false);
    assert.notEqual(changed.hypothesisGeneration.profileFingerprint, first.hypothesisGeneration.profileFingerprint);

    const isolated = await store.getProfile(accountB);
    assert.deepEqual(isolated.hypotheses, []);
    const forbidden = await store.updateHypothesisStatus(accountB, mobility.id, 'confirmed');
    assert.equal(forbidden, null);
  } finally {
    await pool.execute('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.end();
  }
});
