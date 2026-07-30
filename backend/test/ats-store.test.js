'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAtsStore, AtsPersistenceError } = require('../src/ats-v1/store');

const applicationRow = {
  id: 'app-1',
  job_id: 'job-1',
  candidate_account_id: 'candidate-1',
  state: 'submitted',
  version: 1,
  submitted_at: new Date('2026-07-30T10:00:00.000Z'),
  updated_at: new Date('2026-07-30T10:00:00.000Z'),
};

const createPool = ({ row = applicationRow, affectedRows = 1 } = {}) => {
  const queries = [];
  const connection = {
    beginTransaction: async () => queries.push(['BEGIN']),
    commit: async () => queries.push(['COMMIT']),
    rollback: async () => queries.push(['ROLLBACK']),
    release: () => queries.push(['RELEASE']),
    query: async (sql, params) => {
      queries.push([sql, params]);
      if (sql.includes('FOR UPDATE')) return [[row].filter(Boolean)];
      if (sql.startsWith('UPDATE ats_applications_v1')) return [{ affectedRows }];
      if (sql.startsWith('INSERT INTO ats_application_events_v1')) return [{ insertId: 1 }];
      return [[]];
    },
  };
  return {
    queries,
    pool: {
      getConnection: async () => connection,
      query: connection.query,
    },
  };
};

test('transition locks the application, authorizes the resource, updates version and appends one event', async () => {
  const { pool, queries } = createPool();
  const store = createAtsStore(pool, { clock: () => new Date('2026-07-30T12:00:00.000Z') });
  const result = await store.transition({
    applicationId: 'app-1',
    expectedVersion: 1,
    to: 'under_review',
    actorAccountId: 'recruiter-1',
    actorRole: 'recruiter',
    authorize: async ({ application, actorAccountId }) => application.jobId === 'job-1' && actorAccountId === 'recruiter-1',
  });

  assert.equal(result.application.state, 'under_review');
  assert.equal(result.application.version, 2);
  assert.equal(result.event.from, 'submitted');
  assert.equal(result.event.to, 'under_review');
  assert.equal(queries.filter(([sql]) => String(sql).includes('INSERT INTO ats_application_events_v1')).length, 1);
  assert.ok(queries.some(([sql]) => String(sql).includes('FOR UPDATE')));
  assert.ok(queries.some(([sql]) => sql === 'COMMIT'));
});

test('version conflict rolls back without inserting an event', async () => {
  const { pool, queries } = createPool({ row: { ...applicationRow, version: 2 } });
  const store = createAtsStore(pool);
  await assert.rejects(
    store.transition({
      applicationId: 'app-1',
      expectedVersion: 1,
      to: 'under_review',
      actorAccountId: 'recruiter-1',
      actorRole: 'recruiter',
      authorize: async () => true,
    }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_VERSION_CONFLICT',
  );
  assert.equal(queries.filter(([sql]) => String(sql).includes('INSERT INTO ats_application_events_v1')).length, 0);
  assert.ok(queries.some(([sql]) => sql === 'ROLLBACK'));
});

test('resource authorization is mandatory and deny-by-default', async () => {
  const { pool } = createPool();
  const store = createAtsStore(pool);
  await assert.rejects(
    store.transition({
      applicationId: 'app-1',
      expectedVersion: 1,
      to: 'under_review',
      actorAccountId: 'recruiter-1',
      actorRole: 'recruiter',
    }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_AUTHORIZATION_REQUIRED',
  );
});

test('authorization refusal rolls back before state mutation', async () => {
  const { pool, queries } = createPool();
  const store = createAtsStore(pool);
  await assert.rejects(
    store.transition({
      applicationId: 'app-1',
      expectedVersion: 1,
      to: 'under_review',
      actorAccountId: 'recruiter-2',
      actorRole: 'recruiter',
      authorize: async () => false,
    }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_RESOURCE_FORBIDDEN',
  );
  assert.equal(queries.filter(([sql]) => String(sql).startsWith('UPDATE ats_applications_v1')).length, 0);
}