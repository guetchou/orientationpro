'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateUp } = require('../src/db/migrate');
const {
  createActionTrackingRecord,
  transitionActionTracking,
} = require('../src/life-project/action-tracking');
const { createActionTrackingStore } = require('../src/life-project/action-tracking-store');
const { createLifeProject } = require('../src/life-project/contracts');
const { createLifeProjectStore } = require('../src/life-project/store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

const at = (minute) => `2026-07-29T09:${String(minute).padStart(2, '0')}:00.000Z`;
const provenance = (accountId) => ({
  sourceType: 'user_statement',
  actorId: accountId,
  recordedAt: at(0),
});

const buildProject = ({ accountId, suffix }) => createLifeProject({
  id: `tracking-project-${suffix}`,
  ownerAccountId: accountId,
  title: 'Projet avec actions',
  state: 'action',
  activeScenarioId: `tracking-scenario-${suffix}`,
  scenarios: [{
    id: `tracking-scenario-${suffix}`,
    title: 'Scénario actif',
    status: 'active',
    optionType: 'mixed',
    uncertainty: { level: 'low', reasons: [] },
    provenance: provenance(accountId),
    createdAt: at(0),
  }],
  actionPlans: [{
    id: `tracking-plan-${suffix}`,
    scenarioId: `tracking-scenario-${suffix}`,
    title: 'Plan actif',
    status: 'active',
    items: [
      {
        id: `tracking-action-a-${suffix}`,
        title: 'Action A',
        status: 'planned',
        provenance: provenance(accountId),
        createdAt: at(0),
      },
      {
        id: `tracking-action-b-${suffix}`,
        title: 'Action B',
        status: 'planned',
        provenance: provenance(accountId),
        createdAt: at(0),
      },
    ],
    provenance: provenance(accountId),
    createdAt: at(0),
  }],
  uncertainty: { level: 'low', reasons: [] },
  provenance: provenance(accountId),
  createdAt: at(0),
});

const initialRecord = ({ project, actionId, position }) => createActionTrackingRecord({
  projectId: project.id,
  planId: project.actionPlans[0].id,
  actionId,
  position,
  statusHistory: [{
    eventId: `created-${actionId}`,
    from: null,
    to: 'planned',
    occurredAt: at(0),
    actor: { kind: 'user', id: project.ownerAccountId },
  }],
  createdAt: at(0),
});

test('action tracking is owner-scoped, ordered and keeps its status history in MySQL', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = crypto.randomUUID();
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  await migrateUp(pool, directory);

  try {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
      [accountA, `tracking-a-${suffix}@example.test`, accountB, `tracking-b-${suffix}@example.test`],
    );

    const project = buildProject({ accountId: accountA, suffix });
    await createLifeProjectStore(pool).create(project);
    const store = createActionTrackingStore(pool);
    const actionA = project.actionPlans[0].items[0].id;
    const actionB = project.actionPlans[0].items[1].id;

    await store.save(accountA, initialRecord({ project, actionId: actionA, position: 2 }));
    await store.save(accountA, initialRecord({ project, actionId: actionB, position: 1 }));

    const ordered = await store.list(accountA, project.id);
    assert.deepEqual(ordered.map((entry) => entry.actionId), [actionB, actionA]);
    assert.deepEqual(await store.list(accountB, project.id), []);
    assert.equal(await store.get(accountB, project.id, actionA), null);

    const started = transitionActionTracking(ordered[1], {
      eventId: `started-${suffix}`,
      to: 'in_progress',
      occurredAt: at(5),
      actor: { kind: 'user', id: accountA },
      reason: 'Action démarrée',
    });
    const saved = await store.save(accountA, started);
    assert.equal(saved.statusHistory.length, 2);
    assert.equal(saved.statusHistory.at(-1).to, 'in_progress');

    await store.deleteMissing(accountA, project.id, [actionB]);
    const remaining = await store.list(accountA, project.id);
    assert.deepEqual(remaining.map((entry) => entry.actionId), [actionB]);
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await pool.end();
  }
});
