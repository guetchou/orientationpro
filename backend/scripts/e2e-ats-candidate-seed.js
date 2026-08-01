'use strict';

// Seed/nettoyage pour le harnais Playwright du parcours candidat ATS
// (tests/ats-candidate/). IDs et identifiants fixes : base jetable dédiée,
// aucun risque de collision. Usage : node e2e-ats-candidate-seed.js up|down
const path = require('node:path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { migrateUp } = require('../src/db/migrate');

const FIXTURES = {
  candidateA: { id: '11111111-1111-4111-8111-111111111101', email: 'e2e-candidate-a@example.test' },
  candidateB: { id: '11111111-1111-4111-8111-111111111102', email: 'e2e-candidate-b@example.test' },
  recruiter: { id: '11111111-1111-4111-8111-111111111103', email: 'e2e-recruiter@example.test' },
  password: 'E2eStrongPassw0rd!2026',
  jobId: '22222222-2222-4222-8222-222222222201',
  jobTitle: 'Comptable (E2E)',
  jobDescription: "Offre publiée pour le parcours candidat automatisé.",
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
  await pool.query(
    `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES
       (?, ?, ?, 'active'), (?, ?, ?, 'active'), (?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE email = VALUES(email)`,
    [
      FIXTURES.candidateA.id, FIXTURES.candidateA.email, passwordHash,
      FIXTURES.candidateB.id, FIXTURES.candidateB.email, passwordHash,
      FIXTURES.recruiter.id, FIXTURES.recruiter.email, passwordHash,
    ],
  );
  await pool.query(
    `INSERT IGNORE INTO auth_account_roles (account_id, role_id) VALUES
       (?, 'user'), (?, 'user'), (?, 'recruiter')`,
    [FIXTURES.candidateA.id, FIXTURES.candidateB.id, FIXTURES.recruiter.id],
  );

  const now = new Date().toISOString().slice(0, 23).replace('T', ' ');
  await pool.query(
    `INSERT INTO ats_jobs_v1 (id, owner_account_id, title, description, status, version, published_at)
     VALUES (?, ?, ?, ?, 'published', 2, ?)
     ON DUPLICATE KEY UPDATE status = 'published', version = 2, published_at = VALUES(published_at)`,
    [FIXTURES.jobId, FIXTURES.recruiter.id, FIXTURES.jobTitle, FIXTURES.jobDescription, now],
  );

  process.stdout.write(`${JSON.stringify(FIXTURES)}\n`);
};

const down = async (pool) => {
  await pool.query(
    'DELETE FROM ats_application_events_v1 WHERE application_id IN (SELECT id FROM ats_applications_v1 WHERE job_id = ?)',
    [FIXTURES.jobId],
  );
  await pool.query('DELETE FROM ats_applications_v1 WHERE job_id = ?', [FIXTURES.jobId]);
  await pool.query('DELETE FROM ats_job_events_v1 WHERE job_id = ?', [FIXTURES.jobId]);
  await pool.query('DELETE FROM ats_job_recruiters_v1 WHERE job_id = ?', [FIXTURES.jobId]);
  await pool.query('DELETE FROM ats_jobs_v1 WHERE id = ?', [FIXTURES.jobId]);
  await pool.query('DELETE FROM auth_account_roles WHERE account_id IN (?, ?, ?)', [
    FIXTURES.candidateA.id, FIXTURES.candidateB.id, FIXTURES.recruiter.id,
  ]);
  await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?, ?)', [
    FIXTURES.candidateA.id, FIXTURES.candidateB.id, FIXTURES.recruiter.id,
  ]);
};

const main = async () => {
  const mode = process.argv[2];
  if (mode !== 'up' && mode !== 'down') {
    throw new Error('Usage: node e2e-ats-candidate-seed.js up|down');
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
