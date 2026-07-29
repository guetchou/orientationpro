'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createLifeProjectRouter } = require('../src/life-project/router');
const { createLifeProjectService } = require('../src/life-project/service');
const { LifeProjectPersistenceError } = require('../src/life-project/store');

const request = async (app, path, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

const jsonRequest = (method, body, version) => ({
  method,
  headers: {
    'content-type': 'application/json',
    ...(version ? { 'if-match': `"${version}"` } : {}),
  },
  body: JSON.stringify(body),
});

const createMemoryStore = () => {
  const records = new Map();
  return {
    async create(project) {
      if (records.has(project.id)) throw new Error('duplicate');
      const record = { project, persistenceVersion: 1 };
      records.set(project.id, record);
      return record;
    },
    async get(accountId, projectId) {
      const record = records.get(projectId);
      return record?.project.ownerAccountId === accountId ? record : null;
    },
    async list(accountId) {
      return [...records.values()]
        .filter((record) => record.project.ownerAccountId === accountId)
        .map((record) => ({
          id: record.project.id,
          title: record.project.title,
          state: record.project.state,
          persistenceVersion: record.persistenceVersion,
        }));
    },
    async save(project, { expectedVersion }) {
      const record = records.get(project.id);
      if (!record || record.project.ownerAccountId !== project.ownerAccountId) return null;
      if (record.persistenceVersion !== expectedVersion) {
        throw new LifeProjectPersistenceError(
          'LIFE_PROJECT_VERSION_CONFLICT',
          'The life project was modified by another operation.',
        );
      }
      const next = { project, persistenceVersion: record.persistenceVersion + 1 };
      records.set(project.id, next);
      return next;
    },
  };
};

const authenticated = (req, res, next) => {
  req.auth = { account: { id: 'account-1', email: 'person@example.test' } };
  next();
};

const createApp = () => {
  const identifiers = [
    'project-1', 'scenario-1', 'plan-1', 'item-1', 'item-2',
  ];
  let minute = 0;
  const service = createLifeProjectService({
    store: createMemoryStore(),
    idFactory: () => identifiers.shift(),
    clock: () => new Date(`2026-07-29T08:${String(minute++).padStart(2, '0')}:00.000Z`),
  });
  const app = express();
  app.use(express.json());
  app.use('/api/v1/life-projects', createLifeProjectRouter({
    service,
    authenticate: authenticated,
  }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'UNEXPECTED', message: error.message } });
  });
  return app;
};

test('authenticated LifeProject API creates, evolves and replays commands without duplication', async () => {
  const app = createApp();

  const createdResponse = await request(app, '/api/v1/life-projects', jsonRequest('POST', {
    title: 'Mon projet de vie',
    purpose: 'Comparer plusieurs chemins réalistes.',
    missingInformation: ['Contraintes à préciser'],
    uncertainty: { level: 'high', reasons: ['Projet initial'] },
  }));
  const created = await createdResponse.json();
  assert.equal(createdResponse.status, 201);
  assert.equal(createdResponse.headers.get('etag'), '"1"');
  assert.equal(created.project.ownerAccountId, 'account-1');
  assert.equal(created.project.state, 'exploration');

  const noVersion = await request(
    app,
    '/api/v1/life-projects/project-1/scenarios',
    jsonRequest('POST', { title: 'Formation', optionType: 'education' }),
  );
  assert.equal(noVersion.status, 428);

  const scenarioResponse = await request(
    app,
    '/api/v1/life-projects/project-1/scenarios',
    jsonRequest('POST', {
      title: 'Formation',
      optionType: 'education',
      status: 'candidate',
      uncertainty: { level: 'medium', reasons: ['Admission à vérifier'] },
    }, 1),
  );
  const withScenario = await scenarioResponse.json();
  assert.equal(scenarioResponse.status, 201);
  assert.equal(scenarioResponse.headers.get('etag'), '"2"');
  assert.equal(withScenario.project.scenarios[0].id, 'scenario-1');

  const selectPath = '/api/v1/life-projects/project-1/scenarios/scenario-1/select';
  const selectionResponse = await request(app, selectPath, jsonRequest('POST', {
    commandId: 'command-select-1',
    reason: 'Hypothèse à tester',
  }, 2));
  const selected = await selectionResponse.json();
  assert.equal(selectionResponse.status, 200);
  assert.equal(selected.project.activeScenarioId, 'scenario-1');
  assert.equal(selected.project.stateHistory.length, 1);
  assert.equal(selectionResponse.headers.get('etag'), '"3"');

  const replayResponse = await request(app, selectPath, jsonRequest('POST', {
    commandId: 'command-select-1',
    reason: 'Hypothèse à tester',
  }, 2));
  const replayed = await replayResponse.json();
  assert.equal(replayResponse.status, 200);
  assert.equal(replayed.replayed, true);
  assert.equal(replayed.project.stateHistory.length, 1);
  assert.equal(replayResponse.headers.get('etag'), '"3"');

  const transitionResponse = await request(
    app,
    '/api/v1/life-projects/project-1/transitions',
    jsonRequest('POST', {
      commandId: 'command-transition-1',
      to: 'clarification',
      reason: 'Informations complémentaires nécessaires.',
    }, 3),
  );
  const transitioned = await transitionResponse.json();
  assert.equal(transitionResponse.status, 200);
  assert.equal(transitioned.project.state, 'clarification');
  assert.equal(transitioned.project.stateHistory.length, 2);
  assert.equal(transitionResponse.headers.get('etag'), '"4"');

  const planResponse = await request(
    app,
    '/api/v1/life-projects/project-1/action-plans',
    jsonRequest('POST', {
      scenarioId: 'scenario-1',
      title: 'Vérifier le scénario',
      status: 'active',
      items: [{ title: 'Identifier trois formations', status: 'planned' }],
    }, 4),
  );
  const planned = await planResponse.json();
  assert.equal(planResponse.status, 201);
  assert.equal(planned.project.actionPlans[0].id, 'plan-1');
  assert.equal(planned.project.actionPlans[0].items[0].id, 'item-1');
  assert.equal(planResponse.headers.get('etag'), '"5"');

  const replaceResponse = await request(
    app,
    '/api/v1/life-projects/project-1/action-plans/plan-1',
    jsonRequest('PUT', {
      scenarioId: 'scenario-1',
      title: 'Vérifier le scénario',
      status: 'active',
      items: [
        { id: 'item-1', title: 'Identifier trois formations', status: 'completed' },
        { title: 'Comparer les prérequis', status: 'in_progress' },
      ],
    }, 5),
  );
  const replaced = await replaceResponse.json();
  assert.equal(replaceResponse.status, 200);
  assert.equal(replaced.project.actionPlans[0].items[0].status, 'completed');
  assert.equal(replaced.project.actionPlans[0].items[1].id, 'item-2');
  assert.equal(replaceResponse.headers.get('etag'), '"6"');

  const listResponse = await request(app, '/api/v1/life-projects');
  const list = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(list.projects.length, 1);

  const readResponse = await request(app, '/api/v1/life-projects/project-1');
  const reread = await readResponse.json();
  assert.equal(readResponse.status, 200);
  assert.equal(reread.project.ownerAccountId, 'account-1');
  assert.equal(reread.project.actionPlans[0].items.length, 2);
});

test('LifeProject API maps stale versions and conflicting command ids explicitly', async () => {
  const app = createApp();
  await request(app, '/api/v1/life-projects', jsonRequest('POST', { title: 'Projet' }));
  await request(
    app,
    '/api/v1/life-projects/project-1/scenarios',
    jsonRequest('POST', { title: 'Scénario', optionType: 'mixed' }, 1),
  );

  const stale = await request(
    app,
    '/api/v1/life-projects/project-1/scenarios',
    jsonRequest('POST', { title: 'Autre scénario', optionType: 'mixed' }, 1),
  );
  const staleBody = await stale.json();
  assert.equal(stale.status, 409);
  assert.equal(staleBody.error.code, 'LIFE_PROJECT_VERSION_CONFLICT');

  await request(
    app,
    '/api/v1/life-projects/project-1/scenarios/scenario-1/select',
    jsonRequest('POST', { commandId: 'same-command' }, 2),
  );
  const conflict = await request(
    app,
    '/api/v1/life-projects/project-1/transitions',
    jsonRequest('POST', { commandId: 'same-command', to: 'clarification' }, 3),
  );
  const conflictBody = await conflict.json();
  assert.equal(conflict.status, 409);
  assert.equal(conflictBody.error.code, 'LIFE_PROJECT_COMMAND_CONFLICT');
});