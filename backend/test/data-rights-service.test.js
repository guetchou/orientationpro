'use strict';

const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const test = require('node:test');
const { DataRightsError, createDataRightsService } = require('../src/data-rights/service');

const createFixture = async () => {
  const passwordHash = await bcrypt.hash('correct-password', 4);
  const queries = [];
  const connection = {
    beginTransaction: async () => queries.push('BEGIN'),
    commit: async () => queries.push('COMMIT'),
    rollback: async () => queries.push('ROLLBACK'),
    release: () => queries.push('RELEASE'),
    query: async (sql, parameters) => {
      queries.push({ sql: sql.replace(/\s+/g, ' ').trim(), parameters });
      if (/SELECT a\.id/.test(sql)) {
        return [[{
          id: 'account-1',
          email: 'person@example.test',
          password_hash: passwordHash,
          status: 'active',
          roles_csv: 'user',
        }]];
      }
      if (/DELETE FROM auth_accounts/.test(sql)) return [{ affectedRows: 1 }];
      return [{ affectedRows: 1 }];
    },
  };
  const pool = {
    query: connection.query,
    getConnection: async () => connection,
  };
  const service = createDataRightsService({
    pool,
    profileStore: {
      getProfile: async () => ({ profile: { city: 'Kinshasa' }, education: [], skills: [], hypotheses: [] }),
      upsertProfile: async (accountId, input) => ({ accountId, ...input }),
    },
    lifeProjectStore: {
      list: async () => [{ id: 'project-1' }],
      get: async () => ({ project: { id: 'project-1' }, persistenceVersion: 1 }),
    },
    riasecStore: { listResults: async () => [{ id: 'result-1' }] },
    cvStore: {
      listAnalyses: async () => ({ analyses: [{ id: 'cv-1' }], pagination: { total: 1 } }),
      getAnalysis: async () => ({ id: 'cv-1', snapshot: { version: 1 } }),
    },
    now: () => new Date('2026-07-29T00:00:00.000Z'),
    deletionReference: () => 'delete-reference-1234',
  });
  return { service, queries };
};

test('portable export is account-scoped and omits password hashes', async () => {
  const { service } = await createFixture();
  const output = await service.exportAccount('account-1');
  assert.equal(output.schemaVersion, 'makoki.portable-export.v1');
  assert.equal(output.account.email, 'person@example.test');
  assert.equal(output.account.passwordHash, undefined);
  assert.equal(output.lifeProjects[0].project.id, 'project-1');
  assert.equal(output.orientationResults[0].id, 'result-1');
  assert.equal(output.cvAnalyses[0].id, 'cv-1');
});

test('profile correction delegates only for the authenticated account', async () => {
  const { service } = await createFixture();
  assert.deepEqual(await service.correctProfile('account-1', { city: 'Matadi' }), {
    accountId: 'account-1',
    city: 'Matadi',
  });
});

test('account deletion requires explicit confirmation and current password', async () => {
  const { service, queries } = await createFixture();
  await assert.rejects(
    service.deleteAccount({ accountId: 'account-1', currentPassword: 'correct-password', confirmation: 'no' }),
    (error) => error instanceof DataRightsError && error.code === 'DELETION_CONFIRMATION_REQUIRED',
  );
  await assert.rejects(
    service.deleteAccount({ accountId: 'account-1', currentPassword: 'wrong-password', confirmation: 'SUPPRIMER MON COMPTE' }),
    (error) => error instanceof DataRightsError && error.code === 'REAUTHENTICATION_FAILED',
  );
  assert.equal(queries.includes('ROLLBACK'), true);
});

test('confirmed deletion revokes sessions, removes account-owned data and commits', async () => {
  const { service, queries } = await createFixture();
  const result = await service.deleteAccount({
    accountId: 'account-1',
    currentPassword: 'correct-password',
    confirmation: 'SUPPRIMER MON COMPTE',
  });
  assert.equal(result.status, 'deleted');
  assert.equal(result.deletedAt, '2026-07-29T00:00:00.000Z');
  assert.equal(result.deletionReference, 'delete-reference-1234');
  assert.equal(result.accountIdHash, undefined);
  assert.equal(queries.includes('COMMIT'), true);
  assert.equal(
    queries.some((entry) => typeof entry === 'object' && /DELETE FROM auth_accounts/.test(entry.sql)),
    true,
  );
});
