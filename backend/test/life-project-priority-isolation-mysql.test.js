'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const { createLifeProjectService } = require('../src/life-project/service');
const { createLifeProjectStore } = require('../src/life-project/store');
const {
  SCOPED_PREFIX,
  createScopedCriteriaStore,
} = require('../src/life-project/scoped-criteria-store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

const diagnostic = () => ({
  objective: 'studies',
  identity: {
    ageRange: '16-20',
    country: { value: 'Congo', verification: 'declared' },
    zone: { value: 'Brazzaville', verification: 'declared' },
    situation: { value: 'Terminale générale', verification: 'declared' },
    educationLevel: { value: 'baccalaureate', verification: 'declared' },
    diploma: { value: 'Baccalauréat en préparation', verification: 'declared' },
    subjects: ['Mathématiques'],
    significantResults: [],
    interruptions: [],
  },
  constraints: {
    mobility: 'local',
    budget: { amount: 400000, currency: 'XAF', verification: 'declared' },
    needIncomeWithinMonths: 36,
    maxDurationMonths: 60,
    internetAccess: 'regular',
    equipment: ['smartphone'],
    familyResponsibilities: [],
    availability: ['temps plein'],
    healthOrDisability: [],
    documents: ['baccalaureat'],
    availableModes: ['presentiel'],
  },
  preferences: {
    interests: ['numérique'],
    activities: ['résolution de problèmes'],
    favouriteSubjects: ['sciences'],
    workEnvironments: ['travail en équipe'],
    workStyles: ['travail technique'],
    values: ['insertion'],
  },
  capabilities: {
    skills: ['logique'],
    internships: [],
    volunteering: [],
    jobs: [],
    personalProjects: ['initiation informatique'],
    responsibilities: [],
    languages: ['français'],
    digitalSkills: ['informatique de base'],
    evidence: [],
    regulatoryQualifications: [],
  },
  priorities: [
    { id: 'interest', importance: 1 },
    { id: 'duration', importance: 0.8 },
    { id: 'cost', importance: 0.7 },
  ],
  notes: 'Régression de collision inter-projets.',
});

test('two persisted projects can use the same diagnostic priorities', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();

  await migrateUp(pool, directory);
  try {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
      [
        accountA,
        `priority-a-${accountA}@example.test`,
        accountB,
        `priority-b-${accountB}@example.test`,
      ],
    );

    const store = createScopedCriteriaStore(createLifeProjectStore(pool));
    const service = createLifeProjectService({ store });
    const createdA = await service.create(accountA, { title: 'Projet A' });
    const createdB = await service.create(accountB, { title: 'Projet B' });

    const diagnosedA = await service.replaceDiagnostic(
      accountA,
      createdA.project.id,
      diagnostic(),
      createdA.persistenceVersion,
    );
    const diagnosedB = await service.replaceDiagnostic(
      accountB,
      createdB.project.id,
      diagnostic(),
      createdB.persistenceVersion,
    );

    const idsA = diagnosedA.project.criteria.map((criterion) => criterion.id);
    const idsB = diagnosedB.project.criteria.map((criterion) => criterion.id);
    assert.equal(idsA.length, 3);
    assert.equal(idsB.length, 3);
    assert.ok(idsA.every((id) => id.startsWith(SCOPED_PREFIX)));
    assert.ok(idsB.every((id) => id.startsWith(SCOPED_PREFIX)));
    assert.ok(idsA.every((id) => !idsB.includes(id)));

    const repeatedA = await service.replaceDiagnostic(
      accountA,
      createdA.project.id,
      diagnostic(),
      diagnosedA.persistenceVersion,
    );
    assert.deepEqual(repeatedA.project.criteria.map((criterion) => criterion.id), idsA);

    const [[countA]] = await pool.query(
      'SELECT COUNT(*) AS total FROM life_project_criteria WHERE project_id = ?',
      [createdA.project.id],
    );
    const [[countB]] = await pool.query(
      'SELECT COUNT(*) AS total FROM life_project_criteria WHERE project_id = ?',
      [createdB.project.id],
    );
    assert.equal(Number(countA.total), 3);
    assert.equal(Number(countB.total), 3);
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.end();
  }
});
