'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');
const mysql = require('mysql2/promise');

const { migrateDown, migrateUp } = require('../src/db/migrate');
const { createLifeProject } = require('../src/life-project/contracts');
const { selectActiveScenario, transitionLifeProject } = require('../src/life-project/state-machine');
const {
  LifeProjectPersistenceError,
  createLifeProjectStore,
} = require('../src/life-project/store');

const createPool = () => mysql.createPool({
  host: process.env.AUTH_TEST_DB_HOST,
  port: Number(process.env.AUTH_TEST_DB_PORT || 3306),
  user: process.env.AUTH_TEST_DB_USER,
  password: process.env.AUTH_TEST_DB_PASSWORD,
  database: process.env.AUTH_TEST_DB_NAME,
  waitForConnections: true,
  connectionLimit: 4,
});

const at = (minute) => `2026-07-29T08:${String(minute).padStart(2, '0')}:00.000Z`;

const provenance = (accountId, minute = 0) => ({
  sourceType: 'user_statement',
  sourceId: 'life-project-mysql-test',
  actorId: accountId,
  recordedAt: at(minute),
  notes: null,
});

const buildProject = ({ accountId, suffix, projectId = `project-${suffix}` }) => {
  const scenarioA = `scenario-a-${suffix}`;
  const scenarioB = `scenario-b-${suffix}`;
  return createLifeProject({
    id: projectId,
    ownerAccountId: accountId,
    title: 'Construire mon projet de vie',
    purpose: 'Comparer plusieurs chemins sans transformer une hypothèse en certitude.',
    state: 'exploration',
    activeScenarioId: null,
    scenarios: [
      {
        id: scenarioA,
        title: 'Études et formation',
        description: 'Explorer un parcours académique ou professionnel.',
        horizon: 'deux ans',
        status: 'candidate',
        optionType: 'education',
        assumptions: ['Une formation adaptée reste à identifier.'],
        barriers: ['Financement à vérifier.'],
        supports: ['Accompagnement familial déclaré.'],
        missingInformation: ['Conditions d’admission.'],
        uncertainty: { level: 'high', reasons: ['Données de terrain manquantes.'] },
        provenance: provenance(accountId),
        createdAt: at(0),
        updatedAt: at(0),
      },
      {
        id: scenarioB,
        title: 'Insertion progressive',
        description: 'Développer une compétence et tester une activité.',
        horizon: 'six mois',
        status: 'exploring',
        optionType: 'employment',
        assumptions: [],
        barriers: [],
        supports: [],
        missingInformation: ['Compétences déjà démontrées.'],
        uncertainty: { level: 'medium', reasons: ['Expérience non encore vérifiée.'] },
        provenance: provenance(accountId),
        createdAt: at(1),
        updatedAt: at(1),
      },
    ],
    criteria: [
      {
        id: `criterion-${suffix}`,
        label: 'Faisabilité actuelle',
        description: 'Comparer les ressources et contraintes connues.',
        direction: 'maximize',
        importance: 0.8,
        provenance: provenance(accountId),
      },
    ],
    actionPlans: [
      {
        id: `plan-${suffix}`,
        scenarioId: scenarioA,
        title: 'Vérifier le scénario de formation',
        status: 'draft',
        items: [
          {
            id: `item-${suffix}`,
            title: 'Identifier trois parcours possibles',
            description: null,
            status: 'planned',
            dueAt: at(40),
            completedAt: null,
            evidenceIds: [],
            blockingReasons: [],
            provenance: provenance(accountId),
            createdAt: at(2),
            updatedAt: at(2),
          },
        ],
        missingInformation: ['Durée et prérequis.'],
        provenance: provenance(accountId),
        createdAt: at(2),
        updatedAt: at(2),
      },
    ],
    stateHistory: [],
    missingInformation: ['Situation financière', 'Préférences de mobilité'],
    uncertainty: { level: 'high', reasons: ['Le projet commence.'] },
    provenance: provenance(accountId),
    createdAt: at(0),
    updatedAt: at(2),
  });
};

test('life project persists transactionally with scoped reads and append-only history', async () => {
  const pool = createPool();
  const directory = path.join(__dirname, '..', 'migrations');
  const suffix = crypto.randomUUID();
  const accountA = crypto.randomUUID();
  const accountB = crypto.randomUUID();
  const store = createLifeProjectStore(pool);

  await migrateUp(pool, directory);
  try {
    await pool.query(
      `INSERT INTO auth_accounts (id, email, password_hash, status)
       VALUES (?, ?, 'hash', 'active'), (?, ?, 'hash', 'active')`,
      [accountA, `life-a-${suffix}@example.test`, accountB, `life-b-${suffix}@example.test`],
    );

    const initial = buildProject({ accountId: accountA, suffix });
    const created = await store.create(initial);
    assert.equal(created.persistenceVersion, 1);
    assert.deepEqual(created.project, initial);
    assert.equal((await store.list(accountA)).length, 1);
    assert.equal((await store.list(accountB)).length, 0);
    assert.equal(await store.get(accountB, initial.id), null);

    const selected = selectActiveScenario(created.project, {
      scenarioId: initial.scenarios[0].id,
      eventId: `selection-${suffix}`,
      occurredAt: at(10),
      actor: { kind: 'user', id: accountA },
      reason: 'Scénario choisi provisoirement pour vérification.',
      provenance: provenance(accountA, 10),
    });
    const transitioned = transitionLifeProject(selected, {
      to: 'clarification',
      eventId: `transition-${suffix}`,
      occurredAt: at(20),
      actor: { kind: 'user', id: accountA },
      reason: 'Informations complémentaires nécessaires.',
      provenance: provenance(accountA, 20),
    });
    const updated = createLifeProject({
      ...transitioned,
      title: 'Projet de vie en clarification',
      actionPlans: transitioned.actionPlans.map((plan) => ({
        ...plan,
        status: 'active',
        items: plan.items.map((item) => ({
          ...item,
          status: 'in_progress',
          updatedAt: at(20),
        })),
        updatedAt: at(20),
      })),
    });

    const saved = await store.save(updated, { expectedVersion: 1 });
    assert.equal(saved.persistenceVersion, 2);
    assert.equal(saved.project.state, 'clarification');
    assert.equal(saved.project.activeScenarioId, initial.scenarios[0].id);
    assert.equal(saved.project.stateHistory.length, 2);
    assert.equal(saved.project.actionPlans[0].items[0].status, 'in_progress');

    await assert.rejects(
      pool.query(
        `UPDATE life_project_active_scenarios
         SET scenario_id = ?
         WHERE project_id = ?`,
        [`missing-${suffix}`, initial.id],
      ),
      (error) => error?.code === 'ER_NO_REFERENCED_ROW_2',
    );

    await assert.rejects(
      store.save(updated, { expectedVersion: 1 }),
      (error) => error instanceof LifeProjectPersistenceError
        && error.code === 'LIFE_PROJECT_VERSION_CONFLICT',
    );

    const rewritten = createLifeProject({
      ...saved.project,
      stateHistory: saved.project.stateHistory.map((entry, index) => index === 0
        ? { ...entry, reason: 'Tentative de réécriture.' }
        : entry),
    });
    await assert.rejects(
      store.save(rewritten, { expectedVersion: 2 }),
      (error) => error instanceof LifeProjectPersistenceError
        && error.code === 'LIFE_PROJECT_HISTORY_REWRITE',
    );

    const conflictingSuffix = crypto.randomUUID();
    const conflictingBase = buildProject({ accountId: accountA, suffix: conflictingSuffix });
    const conflicting = createLifeProject({
      ...conflictingBase,
      scenarios: conflictingBase.scenarios.map((scenario, index) => index === 0
        ? { ...scenario, id: initial.scenarios[0].id }
        : scenario),
      actionPlans: conflictingBase.actionPlans.map((plan) => ({
        ...plan,
        scenarioId: initial.scenarios[0].id,
      })),
    });
    await assert.rejects(
      store.create(conflicting),
      (error) => error instanceof LifeProjectPersistenceError
        && error.code === 'LIFE_PROJECT_ALREADY_EXISTS',
    );
    const [[rolledBack]] = await pool.query(
      'SELECT id FROM life_projects WHERE id = ?',
      [conflicting.id],
    );
    assert.equal(rolledBack, undefined);

    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    const trackingVersion = await migrateDown(pool, directory);
    assert.equal(trackingVersion, '012_life_project_action_tracking');
    const [trackingAfterDown] = await pool.query("SHOW TABLES LIKE 'life_project_action_tracking'");
    assert.equal(trackingAfterDown.length, 0);
    const [projectsAfterTrackingDown] = await pool.query("SHOW TABLES LIKE 'life_projects'");
    assert.equal(projectsAfterTrackingDown.length, 1);

    const lifeProjectVersion = await migrateDown(pool, directory);
    assert.equal(lifeProjectVersion, '011_life_projects');
    const [tablesAfterDown] = await pool.query("SHOW TABLES LIKE 'life_projects'");
    assert.equal(tablesAfterDown.length, 0);
    await migrateUp(pool, directory);
    const [tablesAfterUp] = await pool.query("SHOW TABLES LIKE 'life_projects'");
    assert.equal(tablesAfterUp.length, 1);
    const [trackingAfterUp] = await pool.query("SHOW TABLES LIKE 'life_project_action_tracking'");
    assert.equal(trackingAfterUp.length, 1);
  } finally {
    await pool.query('DELETE FROM auth_accounts WHERE id IN (?, ?)', [accountA, accountB]);
    await migrateUp(pool, directory);
    await pool.end();
  }
});
