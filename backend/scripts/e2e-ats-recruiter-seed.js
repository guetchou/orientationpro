'use strict';

// Seed/nettoyage pour le harnais Playwright de l'interface recruteur ATS
// (tests/ats-recruiter/), issue #199. IDs et identifiants fixes, préfixe
// numérique distinct de e2e-ats-candidate-seed.js pour ne jamais entrer en
// collision si les deux harnais tournent sur la même base jetable.
// Usage : node e2e-ats-recruiter-seed.js up|down
const path = require('node:path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { migrateUp } = require('../src/db/migrate');

const FIXTURES = {
  managerA: { id: '55555555-5555-4555-8555-555555555501', email: 'e2e-recruiter-manager-a@example.test' },
  recruiterA1: { id: '55555555-5555-4555-8555-555555555502', email: 'e2e-recruiter-a1@example.test' },
  recruiterA2: { id: '55555555-5555-4555-8555-555555555503', email: 'e2e-recruiter-a2@example.test' },
  managerB: { id: '55555555-5555-4555-8555-555555555504', email: 'e2e-recruiter-manager-b@example.test' },
  recruiterB1: { id: '55555555-5555-4555-8555-555555555505', email: 'e2e-recruiter-b1@example.test' },
  candidateA: { id: '55555555-5555-4555-8555-555555555506', email: 'e2e-recruiter-candidate-a@example.test' },
  password: 'E2eStrongPassw0rd!2026',
  organizationA: { id: '66666666-6666-4666-8666-666666666601', name: 'Organisation A (E2E)' },
  organizationB: { id: '66666666-6666-4666-8666-666666666602', name: 'Organisation B (E2E)' },
  jobA: { id: '77777777-7777-4777-8777-777777777701', title: 'Développeur backend (E2E org A)', description: 'Offre organisation A.' },
  jobB: { id: '77777777-7777-4777-8777-777777777702', title: 'Chargé de recrutement (E2E org B)', description: 'Offre organisation B.' },
  applicationA: { id: '88888888-8888-4888-8888-888888888801' },
};

const createPool = () => mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orientationpro_ats_e2e',
  waitForConnections: true,
  connectionLimit: 4,
});

const up = async (pool) => {
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));

  const passwordHash = await bcrypt.hash(FIXTURES.password, 10);
  const accounts = [
    FIXTURES.managerA, FIXTURES.recruiterA1, FIXTURES.recruiterA2,
    FIXTURES.managerB, FIXTURES.recruiterB1, FIXTURES.candidateA,
  ];
  for (const account of accounts) {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES (?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE email = VALUES(email)`,
      [account.id, account.email, passwordHash],
    );
  }

  const roleByAccountId = {
    [FIXTURES.managerA.id]: 'recruitment_manager',
    [FIXTURES.recruiterA1.id]: 'recruiter',
    [FIXTURES.recruiterA2.id]: 'recruiter',
    [FIXTURES.managerB.id]: 'recruitment_manager',
    [FIXTURES.recruiterB1.id]: 'recruiter',
    [FIXTURES.candidateA.id]: 'user',
  };
  for (const [accountId, roleId] of Object.entries(roleByAccountId)) {
    await pool.query(
      'INSERT IGNORE INTO auth_account_roles (account_id, role_id) VALUES (?, ?)',
      [accountId, roleId],
    );
  }

  await pool.query(
    `INSERT INTO ats_organizations_v1 (id, name) VALUES (?, ?), (?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [FIXTURES.organizationA.id, FIXTURES.organizationA.name, FIXTURES.organizationB.id, FIXTURES.organizationB.name],
  );

  const memberByOrganization = [
    [FIXTURES.managerA.id, FIXTURES.organizationA.id],
    [FIXTURES.recruiterA1.id, FIXTURES.organizationA.id],
    [FIXTURES.recruiterA2.id, FIXTURES.organizationA.id],
    [FIXTURES.managerB.id, FIXTURES.organizationB.id],
    [FIXTURES.recruiterB1.id, FIXTURES.organizationB.id],
  ];
  for (const [accountId, organizationId] of memberByOrganization) {
    await pool.query(
      `INSERT IGNORE INTO ats_organization_members_v1 (account_id, organization_id, added_by_account_id)
       VALUES (?, ?, ?)`,
      [accountId, organizationId, accountId],
    );
  }

  const now = new Date().toISOString().slice(0, 23).replace('T', ' ');
  await pool.query(
    `INSERT INTO ats_jobs_v1 (id, owner_account_id, organization_id, title, description, status, version, published_at)
     VALUES (?, ?, ?, ?, ?, 'published', 2, ?)
     ON DUPLICATE KEY UPDATE status = 'published', version = 2, published_at = VALUES(published_at)`,
    [FIXTURES.jobA.id, FIXTURES.managerA.id, FIXTURES.organizationA.id, FIXTURES.jobA.title, FIXTURES.jobA.description, now],
  );
  await pool.query(
    `INSERT INTO ats_jobs_v1 (id, owner_account_id, organization_id, title, description, status, version, published_at)
     VALUES (?, ?, ?, ?, ?, 'published', 2, ?)
     ON DUPLICATE KEY UPDATE status = 'published', version = 2, published_at = VALUES(published_at)`,
    [FIXTURES.jobB.id, FIXTURES.managerB.id, FIXTURES.organizationB.id, FIXTURES.jobB.title, FIXTURES.jobB.description, now],
  );

  // Candidature préexistante sur l'offre A, réinitialisée à chaque run pour
  // que le scénario (évaluer, transitionner, rejeter) reparte d'un état
  // déterministe même après un run précédent.
  await pool.query(
    `INSERT INTO ats_applications_v1
      (id, job_id, organization_id, candidate_account_id, state, version, submitted_at, updated_at)
     VALUES (?, ?, ?, ?, 'submitted', 1, ?, ?)
     ON DUPLICATE KEY UPDATE state = 'submitted', version = 1, updated_at = VALUES(updated_at)`,
    [FIXTURES.applicationA.id, FIXTURES.jobA.id, FIXTURES.organizationA.id, FIXTURES.candidateA.id, now, now],
  );
  await pool.query('DELETE FROM ats_application_evaluations_v1 WHERE application_id = ?', [FIXTURES.applicationA.id]);
  await pool.query('DELETE FROM ats_application_events_v1 WHERE application_id = ?', [FIXTURES.applicationA.id]);
  await pool.query(
    `INSERT INTO ats_application_events_v1
      (application_id, organization_id, event_type, from_state, to_state, actor_account_id, actor_role, reason, reason_code, metadata_json, occurred_at)
     VALUES (?, ?, 'application.submitted', 'submitted', 'submitted', ?, 'candidate', NULL, NULL, CAST('{}' AS JSON), ?)`,
    [FIXTURES.applicationA.id, FIXTURES.organizationA.id, FIXTURES.candidateA.id, now],
  );

  process.stdout.write(`${JSON.stringify(FIXTURES)}\n`);
};

const down = async (pool) => {
  await pool.query('DELETE FROM ats_application_evaluations_v1 WHERE application_id = ?', [FIXTURES.applicationA.id]);
  await pool.query('DELETE FROM ats_application_events_v1 WHERE application_id = ?', [FIXTURES.applicationA.id]);
  await pool.query('DELETE FROM ats_applications_v1 WHERE id = ?', [FIXTURES.applicationA.id]);

  const jobIds = [FIXTURES.jobA.id, FIXTURES.jobB.id];
  await pool.query('DELETE FROM ats_job_events_v1 WHERE job_id IN (?, ?)', jobIds);
  await pool.query('DELETE FROM ats_job_recruiters_v1 WHERE job_id IN (?, ?)', jobIds);
  await pool.query('DELETE FROM ats_jobs_v1 WHERE id IN (?, ?)', jobIds);

  const accountIds = [
    FIXTURES.managerA.id, FIXTURES.recruiterA1.id, FIXTURES.recruiterA2.id,
    FIXTURES.managerB.id, FIXTURES.recruiterB1.id, FIXTURES.candidateA.id,
  ];
  await pool.query(
    'DELETE FROM ats_organization_members_v1 WHERE account_id IN (?, ?, ?, ?, ?, ?)',
    accountIds,
  );
  await pool.query(
    'DELETE FROM ats_organizations_v1 WHERE id IN (?, ?)',
    [FIXTURES.organizationA.id, FIXTURES.organizationB.id],
  );
  await pool.query('DELETE FROM auth_account_roles WHERE account_id IN (?, ?, ?, ?, ?, ?)', accountIds);
  await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?, ?, ?, ?, ?)', accountIds);
};

const main = async () => {
  const mode = process.argv[2];
  if (mode !== 'up' && mode !== 'down') {
    throw new Error('Usage: node e2e-ats-recruiter-seed.js up|down');
  }
  const pool = createPool();
  try {
    await (mode === 'up' ? up(pool) : down(pool));
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
