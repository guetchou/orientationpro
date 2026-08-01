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

const JWT_SECRET = 'ats-organization-mysql-test-jwt-secret-with-32-chars-min';

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
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

test('ATS V1 enforces organization isolation: no cross-org access, unassigned recruiter refused, admin bypasses', async (t) => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  await migrateUp(pool, directory);

  const suffix = crypto.randomUUID();
  const orgA = crypto.randomUUID();
  const orgB = crypto.randomUUID();

  const accounts = {
    ownerA: crypto.randomUUID(),
    managerA: crypto.randomUUID(),
    assignedRecruiterA: crypto.randomUUID(),
    unassignedRecruiterA: crypto.randomUUID(),
    ownerB: crypto.randomUUID(),
    managerB: crypto.randomUUID(),
    recruiterB: crypto.randomUUID(),
    candidateA: crypto.randomUUID(),
    admin: crypto.randomUUID(),
  };
  const roleByAccount = {
    ownerA: 'recruiter',
    managerA: 'recruitment_manager',
    assignedRecruiterA: 'recruiter',
    unassignedRecruiterA: 'recruiter',
    ownerB: 'recruiter',
    managerB: 'recruitment_manager',
    recruiterB: 'recruiter',
    candidateA: 'user',
    admin: 'admin',
  };
  const orgByAccount = {
    ownerA: orgA, managerA: orgA, assignedRecruiterA: orgA, unassignedRecruiterA: orgA,
    ownerB: orgB, managerB: orgB, recruiterB: orgB,
  };

  const jobIds = { jobA: null, jobB: null };
  const applicationId = { value: null };
  let app;

  const accountIds = Object.values(accounts);
  const accountPlaceholders = accountIds.map(() => '?').join(', ');

  t.after(async () => {
    if (app) await app.close();
    const allJobIds = [jobIds.jobA, jobIds.jobB].filter(Boolean);
    if (allJobIds.length) {
      const jobPlaceholders = allJobIds.map(() => '?').join(', ');
      await pool.query(
        `DELETE FROM ats_application_evaluations_v1 WHERE application_id IN (SELECT id FROM ats_applications_v1 WHERE job_id IN (${jobPlaceholders}))`,
        allJobIds,
      );
      await pool.query(
        `DELETE FROM ats_application_events_v1 WHERE application_id IN (SELECT id FROM ats_applications_v1 WHERE job_id IN (${jobPlaceholders}))`,
        allJobIds,
      );
      await pool.query(`DELETE FROM ats_applications_v1 WHERE job_id IN (${jobPlaceholders})`, allJobIds);
      await pool.query(`DELETE FROM ats_job_events_v1 WHERE job_id IN (${jobPlaceholders})`, allJobIds);
      await pool.query(`DELETE FROM ats_job_recruiters_v1 WHERE job_id IN (${jobPlaceholders})`, allJobIds);
      await pool.query(`DELETE FROM ats_jobs_v1 WHERE id IN (${jobPlaceholders})`, allJobIds);
    }
    await pool.query(`DELETE FROM auth_sessions WHERE account_id IN (${accountPlaceholders})`, accountIds);
    await pool.query(`DELETE FROM auth_account_roles WHERE account_id IN (${accountPlaceholders})`, accountIds);
    await pool.query('DELETE FROM ats_organization_members_v1 WHERE organization_id IN (?, ?)', [orgA, orgB]);
    await pool.query('DELETE FROM ats_organizations_v1 WHERE id IN (?, ?)', [orgA, orgB]);
    await pool.query(`DELETE FROM auth_accounts WHERE id IN (${accountPlaceholders})`, accountIds);
    await pool.end();
  });

  for (const [key, id] of Object.entries(accounts)) {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES (?, ?, 'hash', 'active')`,
      [id, `ats-org-${key}-${suffix}@example.test`],
    );
    await pool.query('INSERT INTO auth_account_roles (account_id, role_id) VALUES (?, ?)', [id, roleByAccount[key]]);
  }

  await pool.query('INSERT INTO ats_organizations_v1 (id, name) VALUES (?, ?), (?, ?)', [
    orgA, `Organisation A ${suffix}`, orgB, `Organisation B ${suffix}`,
  ]);
  for (const [key, organizationId] of Object.entries(orgByAccount)) {
    await pool.query(
      'INSERT INTO ats_organization_members_v1 (account_id, organization_id, added_by_account_id) VALUES (?, ?, ?)',
      [accounts[key], organizationId, accounts[key]],
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

  // ownerA creates job A (draft) in organization A.
  {
    const created = await call(baseUrl, tokens.ownerA, 'POST', '/api/v1/ats/jobs', {
      title: 'Développeur backend (org A)',
      description: 'Offre organisation A.',
    });
    assert.equal(created.status, 201);
    jobIds.jobA = created.body.job.id;
  }

  // ownerB creates job B (draft) in organization B.
  {
    const created = await call(baseUrl, tokens.ownerB, 'POST', '/api/v1/ats/jobs', {
      title: 'Chargé de recrutement (org B)',
      description: 'Offre organisation B.',
    });
    assert.equal(created.status, 201);
    jobIds.jobB = created.body.job.id;
  }

  // While job A is still a draft (not public), cross-org and unassigned same-org access are both denied.
  {
    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}`);
    assert.equal(sameOrgUnassigned.status, 403);

    const sameOrgManager = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}`);
    assert.equal(sameOrgManager.status, 200);

    const adminBypass = await call(baseUrl, tokens.admin, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}`);
    assert.equal(adminBypass.status, 200);
  }

  // recruitment_manager is strictly org-scoped: managerB cannot assign recruiters on job A.
  {
    const denied = await call(baseUrl, tokens.managerB, 'POST', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`, {
      recruiterAccountId: accounts.assignedRecruiterA,
    });
    assert.equal(denied.status, 403);
  }

  // Cross-org recruiter injection is rejected even for the correct org's manager.
  {
    const crossOrgInjection = await call(baseUrl, tokens.managerA, 'POST', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`, {
      recruiterAccountId: accounts.recruiterB,
    });
    assert.equal(crossOrgInjection.status, 400);
    assert.equal(crossOrgInjection.body.error.code, 'ATS_RECRUITER_NOT_IN_ORGANIZATION');
  }

  // managerA assigns a same-org recruiter — succeeds.
  {
    const assigned = await call(baseUrl, tokens.managerA, 'POST', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`, {
      recruiterAccountId: accounts.assignedRecruiterA,
    });
    assert.equal(assigned.status, 201);

    const nowVisible = await call(baseUrl, tokens.assignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}`);
    assert.equal(nowVisible.status, 200);
  }

  // Publish both jobs.
  {
    const publishedA = await call(baseUrl, tokens.ownerA, 'POST', `/api/v1/ats/jobs/${jobIds.jobA}/publish`, { expectedVersion: 1 });
    assert.equal(publishedA.status, 200);
    const publishedB = await call(baseUrl, tokens.ownerB, 'POST', `/api/v1/ats/jobs/${jobIds.jobB}/publish`, { expectedVersion: 1 });
    assert.equal(publishedB.status, 200);
  }

  // GET /jobs is scoped per actor: admin sees everything, each org's manager sees
  // only their own organization, an unassigned recruiter sees nothing of their
  // org's unassigned jobs, an assigned recruiter sees only jobs they're staffed on.
  {
    const asAdmin = await call(baseUrl, tokens.admin, 'GET', '/api/v1/ats/jobs');
    const adminIds = asAdmin.body.jobs.map((job) => job.id);
    assert.ok(adminIds.includes(jobIds.jobA));
    assert.ok(adminIds.includes(jobIds.jobB));

    const asManagerA = await call(baseUrl, tokens.managerA, 'GET', '/api/v1/ats/jobs');
    const managerAIds = asManagerA.body.jobs.map((job) => job.id);
    assert.ok(managerAIds.includes(jobIds.jobA));
    assert.equal(managerAIds.includes(jobIds.jobB), false);

    const asManagerB = await call(baseUrl, tokens.managerB, 'GET', '/api/v1/ats/jobs');
    const managerBIds = asManagerB.body.jobs.map((job) => job.id);
    assert.ok(managerBIds.includes(jobIds.jobB));
    assert.equal(managerBIds.includes(jobIds.jobA), false);

    const asUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', '/api/v1/ats/jobs');
    assert.equal(asUnassigned.body.jobs.map((job) => job.id).includes(jobIds.jobA), false);

    const asAssigned = await call(baseUrl, tokens.assignedRecruiterA, 'GET', '/api/v1/ats/jobs');
    assert.ok(asAssigned.body.jobs.map((job) => job.id).includes(jobIds.jobA));
  }

  // Candidate deposits an application on the now-published job A.
  {
    const deposited = await call(baseUrl, tokens.candidateA, 'POST', `/api/v1/ats/jobs/${jobIds.jobA}/applications`, {});
    assert.equal(deposited.status, 201);
    applicationId.value = deposited.body.application.id;
  }

  // Application detail and history: cross-org and same-org-unassigned are both denied;
  // the assigned recruiter and admin both succeed.
  {
    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(sameOrgUnassigned.status, 403);

    const sameOrgUnassignedHistory = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/applications/${applicationId.value}/history`);
    assert.equal(sameOrgUnassignedHistory.status, 403);

    const assigned = await call(baseUrl, tokens.assignedRecruiterA, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(assigned.status, 200);

    const assignedHistory = await call(baseUrl, tokens.assignedRecruiterA, 'GET', `/api/v1/ats/applications/${applicationId.value}/history`);
    assert.equal(assignedHistory.status, 200);
    assert.ok(assignedHistory.body.events.some((event) => 'actorAccountId' in event));

    const admin = await call(baseUrl, tokens.admin, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal(admin.status, 200);
  }

  // Admin transitions the application despite not being a member of any organization.
  {
    const res = await call(baseUrl, tokens.admin, 'POST', `/api/v1/ats/applications/${applicationId.value}/transitions`, {
      to: 'under_review',
      expectedVersion: 1,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.application.state, 'under_review');
    assert.equal(res.body.event.actorRole, 'admin');
  }

  // Pipeline listing (GET /jobs/:jobId/applications): cross-org and same-org-unassigned
  // are denied; org manager and assigned recruiter both see the application, with
  // state and candidateEmail filters bounded to the mandatory job/org scope.
  {
    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications`);
    assert.equal(sameOrgUnassigned.status, 403);

    const asManager = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications`);
    assert.equal(asManager.status, 200);
    assert.equal(asManager.body.applications.length, 1);
    assert.equal(asManager.body.applications[0].id, applicationId.value);

    const asAssigned = await call(baseUrl, tokens.assignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications`);
    assert.equal(asAssigned.status, 200);
    assert.equal(asAssigned.body.applications.length, 1);

    const stateMatch = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications?state=under_review`);
    assert.equal(stateMatch.body.applications.length, 1);

    const stateNoMatch = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications?state=hired`);
    assert.deepEqual(stateNoMatch.body.applications, []);

    const invalidState = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/applications?state=not-a-real-state`);
    assert.equal(invalidState.status, 400);

    const emailMatch = await call(
      baseUrl, tokens.managerA, 'GET',
      `/api/v1/ats/jobs/${jobIds.jobA}/applications?candidateEmail=${encodeURIComponent(`ats-org-candidateA-${suffix}@example.test`)}`,
    );
    assert.equal(emailMatch.body.applications.length, 1);

    const emailNoMatch = await call(
      baseUrl, tokens.managerA, 'GET',
      `/api/v1/ats/jobs/${jobIds.jobA}/applications?candidateEmail=${encodeURIComponent('nobody@example.test')}`,
    );
    assert.deepEqual(emailNoMatch.body.applications, []);
  }

  // Job events (GET /jobs/:jobId/events): same cross-org / same-org-unassigned denial,
  // full detail for authorized staff.
  {
    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/events`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/events`);
    assert.equal(sameOrgUnassigned.status, 403);

    const asManager = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/events`);
    assert.equal(asManager.status, 200);
    const eventTypes = asManager.body.events.map((event) => event.eventType);
    assert.ok(eventTypes.includes('job.created'));
    assert.ok(eventTypes.includes('job.published'));
    assert.ok(eventTypes.includes('job.recruiter_assigned'));
  }

  // Recruiters listing (GET /jobs/:jobId/recruiters): same isolation pattern.
  {
    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`);
    assert.equal(sameOrgUnassigned.status, 403);

    const asManager = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters`);
    assert.equal(asManager.status, 200);
    assert.deepEqual(asManager.body.recruiters.map((entry) => entry.recruiterAccountId), [accounts.assignedRecruiterA]);
  }

  // Removing recruiter assignment is also org-manager-scoped: managerB cannot revoke a job A assignment.
  {
    const denied = await call(baseUrl, tokens.managerB, 'DELETE', `/api/v1/ats/jobs/${jobIds.jobA}/recruiters/${accounts.assignedRecruiterA}`);
    assert.equal(denied.status, 403);
  }

  // Evaluations: never visible/reachable by the candidate — not even on their own
  // application — and cross-org / same-org-unassigned staff are denied too.
  {
    const candidateOwnApplication = await call(baseUrl, tokens.candidateA, 'GET', `/api/v1/ats/applications/${applicationId.value}`);
    assert.equal('evaluations' in candidateOwnApplication.body.application, false);

    const candidateDenied = await call(baseUrl, tokens.candidateA, 'GET', `/api/v1/ats/applications/${applicationId.value}/evaluations`);
    assert.equal(candidateDenied.status, 403);

    const candidateCannotCreate = await call(baseUrl, tokens.candidateA, 'POST', `/api/v1/ats/applications/${applicationId.value}/evaluations`, {
      recommendation: 'advance',
    });
    assert.equal(candidateCannotCreate.status, 403);

    const crossOrg = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/applications/${applicationId.value}/evaluations`);
    assert.equal(crossOrg.status, 403);

    const sameOrgUnassigned = await call(baseUrl, tokens.unassignedRecruiterA, 'GET', `/api/v1/ats/applications/${applicationId.value}/evaluations`);
    assert.equal(sameOrgUnassigned.status, 403);

    // Validation: missing/invalid recommendation, out-of-range rating.
    const missingRecommendation = await call(baseUrl, tokens.assignedRecruiterA, 'POST', `/api/v1/ats/applications/${applicationId.value}/evaluations`, {});
    assert.equal(missingRecommendation.status, 400);
    assert.equal(missingRecommendation.body.error.code, 'ATS_EVALUATION_RECOMMENDATION_INVALID');

    const invalidRating = await call(baseUrl, tokens.assignedRecruiterA, 'POST', `/api/v1/ats/applications/${applicationId.value}/evaluations`, {
      recommendation: 'advance',
      rating: 9,
    });
    assert.equal(invalidRating.status, 400);
    assert.equal(invalidRating.body.error.code, 'ATS_EVALUATION_RATING_INVALID');

    // The assigned recruiter creates a real evaluation with full detail.
    const created = await call(baseUrl, tokens.assignedRecruiterA, 'POST', `/api/v1/ats/applications/${applicationId.value}/evaluations`, {
      recommendation: 'advance',
      rating: 4,
      note: 'Bon entretien technique, à confirmer en équipe.',
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.evaluation.recommendation, 'advance');
    assert.equal(created.body.evaluation.rating, 4);
    assert.equal(created.body.evaluation.evaluatorAccountId, accounts.assignedRecruiterA);
    assert.equal(created.body.evaluation.applicationStateAtEvaluation, 'under_review');

    // Org manager sees the full evaluation (never redacted for staff).
    const asManager = await call(baseUrl, tokens.managerA, 'GET', `/api/v1/ats/applications/${applicationId.value}/evaluations`);
    assert.equal(asManager.status, 200);
    assert.equal(asManager.body.evaluations.length, 1);
    assert.equal(asManager.body.evaluations[0].note, 'Bon entretien technique, à confirmer en équipe.');
    assert.equal(asManager.body.evaluations[0].rating, 4);
    assert.equal(asManager.body.evaluations[0].recommendation, 'advance');

    // Cross-org still denied even after an evaluation exists.
    const crossOrgAfter = await call(baseUrl, tokens.managerB, 'GET', `/api/v1/ats/applications/${applicationId.value}/evaluations`);
    assert.equal(crossOrgAfter.status, 403);

    // Append-only: no PUT/DELETE route exists on evaluations (structurally 404, not
    // 403 — Express's own unmatched-route 404 here, not JSON, so status only).
    const attemptedUpdate = await fetch(`${baseUrl}/api/v1/ats/applications/${applicationId.value}/evaluations/1`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${tokens.assignedRecruiterA}` },
    });
    assert.equal(attemptedUpdate.status, 404);
    const attemptedDelete = await fetch(`${baseUrl}/api/v1/ats/applications/${applicationId.value}/evaluations/1`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${tokens.assignedRecruiterA}` },
    });
    assert.equal(attemptedDelete.status, 404);
  }
});
