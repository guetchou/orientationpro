'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const test = require('node:test');
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const { createMySqlAuthStore } = require('../src/auth-v1/mysql-store');
const { createSessionAuthenticator } = require('../src/auth-v1/authenticate');
const { createConfiguredAtsRouter } = require('../src/ats-v1/bootstrap');

const JWT_SECRET = 'ats-api-mysql-test-jwt-secret-with-32-chars-min';

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 8,
});

const startApp = async (pool) => {
  const app = express();
  app.use(express.json());
  const authStore = createMySqlAuthStore(pool);
  const authenticate = createSessionAuthenticator({ store: authStore, jwtSecret: JWT_SECRET });
  app.use('/api/v1/ats', createConfiguredAtsRouter({ pool, authenticate }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'TEST_SERVER_ERROR', message: error.message } });
  });
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.closeAllConnections();
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
};

const call = async (baseUrl, token, method, path_, body) => {
  const response = await fetch(`${baseUrl}${path_}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
};

test('ATS V1 HTTP API enforces multi-account authorization, transactional transitions and locked concurrency on real MySQL', async (t) => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, directory);

  const suffix = crypto.randomUUID();
  const accounts = {
    owner: crypto.randomUUID(),
    manager: crypto.randomUUID(),
    assignedRecruiter: crypto.randomUUID(),
    otherJobRecruiter: crypto.randomUUID(),
    candidateA: crypto.randomUUID(),
    candidateB: crypto.randomUUID(),
  };
  const roleByAccount = {
    owner: 'recruiter',
    manager: 'recruitment_manager',
    assignedRecruiter: 'recruiter',
    otherJobRecruiter: 'recruiter',
    candidateA: 'user',
    candidateB: 'user',
  };
  const jobIds = { job1: null, job2: null };
  const applicationId = { value: null };

  let app;

  t.after(async () => {
    if (app) await app.close();
    if (jobIds.job1) {
      await pool.query(
        'DELETE FROM ats_application_events_v1 WHERE application_id IN (SELECT id FROM ats_applications_v1 WHERE job_id IN (?, ?))',
        [jobIds.job1, jobIds.job2 || jobIds.job1],
      );
      await pool.query('DELETE FROM ats_applications_v1 WHERE job_id IN (?, ?)', [jobIds.job1, jobIds.job2 || jobIds.job1]);
      await pool.query('DELETE FROM ats_job_events_v1 WHERE job_id IN (?, ?)', [jobIds.job1, jobIds.job2 || jobIds.job1]);
      await pool.query('DELETE FROM ats_job_recruiters_v1 WHERE job_id IN (?, ?)', [jobIds.job1, jobIds.job2 || jobIds.job1]);
      await pool.query('DELETE FROM ats_jobs_v1 WHERE id IN (?, ?)', [jobIds.job1, jobIds.job2 || jobIds.job1]);
    }
    await pool.query('DELETE FROM auth_sessions WHERE account_id IN (?, ?, ?, ?, ?, ?)', Object.values(accounts));
    await pool.query('DELETE FROM auth_account_roles WHERE account_id IN (?, ?, ?, ?, ?, ?)', Object.values(accounts));
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?, ?, ?, ?, ?)', Object.values(accounts));
    await pool.end();
  });

  for (const [key, id] of Object.entries(accounts)) {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES (?, ?, 'hash', 'active')`,
      [id, `ats-${key}-${suffix}@example.test`],
    );
    await pool.query(
      'INSERT INTO auth_account_roles (account_id, role_id) VALUES (?, ?)',
      [id, roleByAccount[key]],
    );
  }

  const tokenFor = async (accountId) => {
    const sessionId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO auth_sessions (id, family_id, account_id, expires_at)
       VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 1 DAY))`,
      [sessionId, crypto.randomUUID(), accountId],
    );
    return jwt.sign({ sid: sessionId }, JWT_SECRET, {
      subject: accountId,
      expiresIn: 15 * 60,
      issuer: 'orientationpro-api',
      audience: 'orientationpro-clients',
      algorithm: 'HS256',
    });
  };

  const tokens = {};
  for (const key of Object.keys(accounts)) {
    tokens[key] = await tokenFor(accounts[key]);
  }

  app = await startApp(pool);
  const { baseUrl } = app;

  // Scenario: unauthenticated request is rejected.
  {
    const res = await call(baseUrl, null, 'POST', '/api/v1/ats/jobs', { title: 'x', description: 'y' });
    assert.equal(res.status, 401);
  }

  // Job creation and publication (owner recruiter).
  {
    const created = await call(baseUrl, tokens.owner, 'POST', '/api/v1/ats/jobs', {
      title: 'Développeur backend',
      description: 'Construire des services Node.js sur MySQL.',
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.job.status, 'draft');
    jobIds.job1 = created.body.job.id;

    const published = await call(baseUrl, tokens.owner, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/publish`, {
      expectedVersion: 1,
    });
    assert.equal(published.status, 200);
    assert.equal(published.body.job.status, 'published');
  }

  // A second job owned and staffed by an unrelated recruiter, for cross-job isolation checks.
  {
    const created = await call(baseUrl, tokens.otherJobRecruiter, 'POST', '/api/v1/ats/jobs', {
      title: 'Chargé de recrutement',
      description: 'Autre offre, sans lien avec job1.',
    });
    jobIds.job2 = created.body.job.id;
    await call(baseUrl, tokens.otherJobRecruiter, 'POST', `/api/v1/ats/jobs/${jobIds.job2}/publish`, {
      expectedVersion: 1,
    });
  }

  // Recruiter assignment is restricted to recruitment_manager/admin — the job owner alone cannot assign.
  {
    const deniedAssignment = await call(baseUrl, tokens.owner, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/recruiters`, {
      recruiterAccountId: accounts.assignedRecruiter,
    });
    assert.equal(deniedAssignment.status, 403);

    const assignment = await call(baseUrl, tokens.manager, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/recruiters`, {
      recruiterAccountId: accounts.assignedRecruiter,
    });
    assert.equal(assignment.status, 201);
  }

  // Candidate A deposits an application on the published job.
  {
    const deposited = await call(baseUrl, tokens.candidateA, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/applications`, {});
    assert.equal(deposited.status, 201);
    assert.equal(deposited.body.application.state, 'submitted');
    applicationId.value = deposited.body.application.id;
  }

  // Duplicate application on the same job by the same candidate is a controlled 409, not a second row.
  {
    const dup = await call(baseUrl, tokens.candidateA, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/applications`, {});
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, 'ATS_APPLICATION_ALREADY_EXISTS');
  }

  // Candidate A lists only their own applications, scoped server-side.
  {
    const res = await call(baseUrl, tokens.candidateA, 'GET', '/api/v1/ats/my/applications');
    assert.equal(res.status, 200);
    assert.equal(res.body.applications.length, 1);
    assert.equal(res.body.applications[0].id, applicationId.value);
    assert.equal(res.body.applications[0].candidateAccountId, accounts.candidateA);
  }

  // Candidate B, who never applied, gets an empty list — not candidate A's data.
  {
    const res = await call(baseUrl, tokens.candidateB, 'GET', '/api/v1/ats/my/applications');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.applications, []);
  }

  // Unauthenticated request is rejected.
  {
    const res = await call(baseUrl, null, 'GET', '/api/v1/ats/my/applications');
    assert.equal(res.status, 401);
  }

  // Candidate B cannot read candidate A's application.
  {
    const res = await call(baseUrl, tokens.candidateB, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(res.status, 403);
  }

  // A recruiter not assigned to job1 cannot read the application, even from a different job they own.
  {
    const res = await call(baseUrl, tokens.otherJobRecruiter, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(res.status, 403);
  }

  // The assigned recruiter can read it.
  {
    const res = await call(baseUrl, tokens.assignedRecruiter, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.application.candidateAccountId, accounts.candidateA);
  }

  // Client-supplied identity/role and metadata are ignored; only the server-derived actor and role are recorded.
  {
    const res = await call(baseUrl, tokens.assignedRecruiter, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
      to: 'under_review',
      expectedVersion: 1,
      actorAccountId: 'attacker-account',
      actorRole: 'admin',
      metadata: { internalNote: 'secret-should-not-persist' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.application.state, 'under_review');
    assert.equal(res.body.event.actorAccountId, accounts.assignedRecruiter);
    assert.equal(res.body.event.actorRole, 'recruiter');
    assert.deepEqual(res.body.event.metadata, {});
  }

  // Forbidden transition (skipping the graph) is rejected with 409 and mutates nothing.
  {
    const res = await call(baseUrl, tokens.assignedRecruiter, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
      to: 'hired',
      expectedVersion: 2,
    });
    assert.equal(res.status, 409);
    const after = await call(baseUrl, tokens.assignedRecruiter, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(after.body.application.version, 2);
    assert.equal(after.body.application.state, 'under_review');
  }

  // Rejection without a reason is a controlled error, not a silent state change.
  {
    const res = await call(baseUrl, tokens.assignedRecruiter, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
      to: 'rejected',
      expectedVersion: 2,
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'ATS_TRANSITION_REASON_REQUIRED');
  }

  // Candidate history never surfaces the internal actor, reason or metadata of an
  // event — the server redacts them for the owning candidate, not just the UI.
  {
    const history = await call(baseUrl, tokens.candidateA, 'GET', `/api/v1/ats/applications/${applicationId.value}/history`);
    assert.equal(history.status, 200);
    assert.ok(history.body.events.length > 0);
    for (const event of history.body.events) {
      assert.equal('actorAccountId' in event, false);
      assert.equal('actorRole' in event, false);
      assert.equal('reason' in event, false);
      assert.equal('metadata' in event, false);
      assert.ok('to' in event && 'occurredAt' in event);
    }
  }

  // The assigned recruiter, by contrast, still sees the full event detail
  // (actor identity, role) needed for their own workflow.
  {
    const history = await call(baseUrl, tokens.assignedRecruiter, 'GET', `/api/v1/ats/applications/${applicationId.value}/history`);
    assert.equal(history.status, 200);
    assert.ok(history.body.events.some((event) => 'actorAccountId' in event));
  }

  // Two concurrent HTTP transitions on the same version: exactly one succeeds.
  {
    const [first, second] = await Promise.all([
      call(baseUrl, tokens.assignedRecruiter, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
        to: 'shortlisted',
        expectedVersion: 2,
      }),
      call(baseUrl, tokens.assignedRecruiter, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
        to: 'rejected',
        expectedVersion: 2,
        reason: 'Profil non retenu après double lecture.',
      }),
    ]);
    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [200, 409]);
  }

  // Removing the recruiter assignment revokes read access immediately.
  {
    const removed = await call(baseUrl, tokens.manager, 'DELETE', `/api/v1/ats/jobs/${jobIds.job1}/recruiters/${accounts.assignedRecruiter}`);
    assert.equal(removed.status, 200);
    const after = await call(baseUrl, tokens.assignedRecruiter, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(after.status, 403);
  }

  // Closing the job (owner-authorized) stops further applications.
  {
    const closed = await call(baseUrl, tokens.owner, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/close`, { expectedVersion: 2 });
    assert.equal(closed.status, 200);
    assert.equal(closed.body.job.status, 'closed');

    const blocked = await call(baseUrl, tokens.candidateB, 'POST', `/api/v1/ats/jobs/${jobIds.job1}/applications`, {});
    assert.equal(blocked.status, 409);
    assert.equal(blocked.body.error.code, 'ATS_JOB_NOT_PUBLISHED');
  }
});
