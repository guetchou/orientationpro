'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateDown, migrateUp } = require('../src/db/migrate');
const { createAtsStore, AtsPersistenceError } = require('../src/ats-v1/store');
const { createJobStore } = require('../src/ats-v1/job-store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 6,
});

test('ATS migrations 014-017 cycle up -> down -> up and create the expected ATS tables', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, directory);
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'ats\\_%'");
    assert.deepEqual(
      tables.map((row) => Object.values(row)[0]).sort(),
      [
        'ats_application_events_v1',
        'ats_applications_v1',
        'ats_job_events_v1',
        'ats_job_recruiters_v1',
        'ats_jobs_v1',
      ],
    );

    const [roles] = await pool.query(
      "SELECT id FROM auth_roles WHERE id IN ('recruiter', 'recruitment_manager') ORDER BY id",
    );
    assert.deepEqual(roles.map((row) => row.id), ['recruiter', 'recruitment_manager']);

    const [cvColumn] = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'ats_applications_v1' AND column_name = 'cv_analysis_id'`,
    );
    assert.equal(cvColumn.length, 1);

    const cvReferenceVersion = await migrateDown(pool, directory);
    assert.equal(cvReferenceVersion, '017_ats_application_cv_reference');
    const [cvColumnAfterDown] = await pool.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'ats_applications_v1' AND column_name = 'cv_analysis_id'`,
    );
    assert.equal(cvColumnAfterDown.length, 0);

    const jobEventsVersion = await migrateDown(pool, directory);
    assert.equal(jobEventsVersion, '016_ats_job_events_v1');
    const [afterJobEventsDown] = await pool.query("SHOW TABLES LIKE 'ats_job_events_v1'");
    assert.equal(afterJobEventsDown.length, 0);

    const rolesVersion = await migrateDown(pool, directory);
    assert.equal(rolesVersion, '015_ats_roles_v1');
    const [rolesAfterDown] = await pool.query(
      "SELECT id FROM auth_roles WHERE id IN ('recruiter', 'recruitment_manager')",
    );
    assert.equal(rolesAfterDown.length, 0);

    const workflowVersion = await migrateDown(pool, directory);
    assert.equal(workflowVersion, '014_ats_workflow_v1');
    const [tablesAfterFullDown] = await pool.query("SHOW TABLES LIKE 'ats\\_%'");
    assert.equal(tablesAfterFullDown.length, 0);

    await migrateUp(pool, directory);
    const [tablesAfterUp] = await pool.query("SHOW TABLES LIKE 'ats\\_%'");
    assert.equal(tablesAfterUp.length, 5);
  } finally {
    await migrateUp(pool, directory);
    await pool.end();
  }
});

test('ATS workflow persists on real MySQL: constraints, atomic append-only history and locked concurrency', async (t) => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = crypto.randomUUID();
  const ownerId = crypto.randomUUID();
  const candidateA = crypto.randomUUID();
  const candidateB = crypto.randomUUID();
  const recruiterId = crypto.randomUUID();
  const jobStore = createJobStore(pool);
  const store = createAtsStore(pool);
  let jobId = null;

  await migrateUp(pool, directory);

  t.after(async () => {
    if (jobId) {
      await pool.query(
        'DELETE FROM ats_application_events_v1 WHERE application_id IN (SELECT id FROM ats_applications_v1 WHERE job_id = ?)',
        [jobId],
      );
      await pool.query('DELETE FROM ats_applications_v1 WHERE job_id = ?', [jobId]);
      await pool.query('DELETE FROM ats_job_events_v1 WHERE job_id = ?', [jobId]);
      await pool.query('DELETE FROM ats_job_recruiters_v1 WHERE job_id = ?', [jobId]);
      await pool.query('DELETE FROM ats_jobs_v1 WHERE id = ?', [jobId]);
    }
    await pool.query('DELETE FROM auth_account_roles WHERE account_id IN (?, ?, ?, ?)', [
      ownerId, candidateA, candidateB, recruiterId,
    ]);
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?, ?, ?)', [
      ownerId, candidateA, candidateB, recruiterId,
    ]);
    await pool.end();
  });

  await pool.query(
    `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES
       (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
    [
      ownerId, `owner-${suffix}@example.test`,
      candidateA, `cand-a-${suffix}@example.test`,
      candidateB, `cand-b-${suffix}@example.test`,
      recruiterId, `recruiter-${suffix}@example.test`,
    ],
  );
  await pool.query(
    `INSERT INTO auth_account_roles (account_id, role_id) VALUES
       (?, 'recruiter'), (?, 'user'), (?, 'user'), (?, 'recruiter')`,
    [ownerId, candidateA, candidateB, recruiterId],
  );

  const job = await jobStore.createJob({
    id: crypto.randomUUID(),
    ownerAccountId: ownerId,
    title: 'Développeur backend',
    description: 'Construire des services Node.js sur MySQL.',
    actorAccountId: ownerId,
    actorRole: 'recruiter',
  });
  jobId = job.id;
  assert.equal(job.status, 'draft');
  assert.equal(job.version, 1);

  const published = await jobStore.publishJob({
    jobId,
    expectedVersion: 1,
    actorAccountId: ownerId,
    actorRole: 'recruiter',
    authorize: async () => true,
  });
  assert.equal(published.status, 'published');
  assert.equal(published.version, 2);
  assert.ok(published.publishedAt);

  const deposited = await store.createApplication({
    id: crypto.randomUUID(),
    jobId,
    candidateAccountId: candidateA,
  });
  const applicationId = deposited.application.id;
  assert.equal(deposited.application.state, 'submitted');

  await assert.rejects(
    store.createApplication({ id: crypto.randomUUID(), jobId, candidateAccountId: candidateA }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_APPLICATION_ALREADY_EXISTS',
  );

  const [[eventCountAfterSubmit]] = await pool.query(
    'SELECT COUNT(*) AS c FROM ats_application_events_v1 WHERE application_id = ?',
    [applicationId],
  );
  assert.equal(Number(eventCountAfterSubmit.c), 1);

  await jobStore.assignRecruiter({
    jobId,
    recruiterAccountId: recruiterId,
    assignedByAccountId: ownerId,
    actorRole: 'recruiter',
    authorize: async () => true,
  });

  await assert.rejects(
    store.transition({
      applicationId,
      expectedVersion: 1,
      to: 'under_review',
      actorAccountId: recruiterId,
      actorRole: 'recruiter',
      authorize: async () => false,
    }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_RESOURCE_FORBIDDEN',
  );

  const [[unchanged]] = await pool.query(
    'SELECT state, version FROM ats_applications_v1 WHERE id = ?',
    [applicationId],
  );
  assert.equal(unchanged.state, 'submitted');
  assert.equal(Number(unchanged.version), 1);
  const [[eventCountAfterDenial]] = await pool.query(
    'SELECT COUNT(*) AS c FROM ats_application_events_v1 WHERE application_id = ?',
    [applicationId],
  );
  assert.equal(Number(eventCountAfterDenial.c), 1);

  const transitioned = await store.transition({
    applicationId,
    expectedVersion: 1,
    to: 'under_review',
    actorAccountId: recruiterId,
    actorRole: 'recruiter',
    authorize: async ({ application }) => application.jobId === jobId,
  });
  assert.equal(transitioned.application.state, 'under_review');
  assert.equal(transitioned.application.version, 2);

  const results = await Promise.allSettled([
    store.transition({
      applicationId,
      expectedVersion: 2,
      to: 'shortlisted',
      actorAccountId: recruiterId,
      actorRole: 'recruiter',
      authorize: async () => true,
    }),
    store.transition({
      applicationId,
      expectedVersion: 2,
      to: 'rejected',
      actorAccountId: recruiterId,
      actorRole: 'recruiter',
      reason: 'Profil non retenu après double lecture.',
      authorize: async () => true,
    }),
  ]);
  const fulfilled = results.filter((result) => result.status === 'fulfilled');
  const failed = results.filter((result) => result.status === 'rejected');
  assert.equal(fulfilled.length, 1, 'exactly one concurrent transition must succeed');
  assert.equal(failed.length, 1, 'exactly one concurrent transition must be rejected');
  assert.ok(failed[0].reason instanceof AtsPersistenceError);
  assert.equal(failed[0].reason.code, 'ATS_VERSION_CONFLICT');

  const [[finalRow]] = await pool.query(
    'SELECT state, version FROM ats_applications_v1 WHERE id = ?',
    [applicationId],
  );
  assert.equal(Number(finalRow.version), 3);
  assert.ok(['shortlisted', 'rejected'].includes(finalRow.state));
  const [[finalEventCount]] = await pool.query(
    'SELECT COUNT(*) AS c FROM ats_application_events_v1 WHERE application_id = ?',
    [applicationId],
  );
  assert.equal(Number(finalEventCount.c), 3, 'no parasitic event after the version conflict');

  const closed = await jobStore.closeJob({
    jobId,
    expectedVersion: 2,
    actorAccountId: ownerId,
    actorRole: 'recruiter',
    authorize: async () => true,
  });
  assert.equal(closed.status, 'closed');

  await assert.rejects(
    store.createApplication({ id: crypto.randomUUID(), jobId, candidateAccountId: candidateB }),
    (error) => error instanceof AtsPersistenceError && error.code === 'ATS_JOB_NOT_PUBLISHED',
  );
});
