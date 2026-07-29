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
      const record = { project, persistenceVersion: 1 };
      records.set(project.id, record);
      return record;
    },
    async get(accountId, projectId) {
      const record = records.get(projectId);
      return record?.project.ownerAccountId === accountId ? record : null;
    },
    async list(accountId) {
      return [...records.values()].filter((entry) => entry.project.ownerAccountId === accountId);
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
      const next = { project, persistenceVersion: expectedVersion + 1 };
      records.set(project.id, next);
      return next;
    },
  };
};

const createMemoryTrackingStore = () => {
  const records = new Map();
  const key = (projectId, actionId) => `${projectId}:${actionId}`;
  return {
    async list(accountId, projectId) {
      return [...records.values()].filter((entry) => entry.projectId === projectId);
    },
    async get(accountId, projectId, actionId) {
      return records.get(key(projectId, actionId)) || null;
    },
    async save(accountId, record) {
      records.set(key(record.projectId, record.actionId), record);
      return record;
    },
    async deleteMissing(accountId, projectId, actionIds) {
      for (const [recordKey, record] of records) {
        if (record.projectId === projectId && !actionIds.includes(record.actionId)) {
          records.delete(recordKey);
        }
      }
    },
  };
};

const authenticated = (req, res, next) => {
  req.auth = { account: { id: 'account-1', email: 'person@example.test' } };
  next();
};

const createApp = () => {
  const identifiers = [
    'project-1', 'scenario-1', 'plan-1', 'action-1', 'tracking-created-1',
  ];
  let minute = 0;
  const service = createLifeProjectService({
    store: createMemoryStore(),
    actionTrackingStore: createMemoryTrackingStore(),
    idFactory: () => identifiers.shift() || `generated-${minute}`,
    clock: () => new Date(`2026-07-29T09:${String(minute++).padStart(2, '0')}:00.000Z`),
  });
  const app = express();
  app.use(express.json());
  app.use('/api/v1/life-projects', createLifeProjectRouter({ service, authenticate: authenticated }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'UNEXPECTED', message: error.message } });
  });
  return app;
};

const prepareProject = async (app) => {
  await request(app, '/api/v1/life-projects', jsonRequest('POST', { title: 'Projet' }));
  await request(app, '/api/v1/life-projects/project-1/scenarios', jsonRequest('POST', {
    title: 'Scénario',
    optionType: 'mixed',
  }, 1));
  const planResponse = await request(app, '/api/v1/life-projects/project-1/action-plans', jsonRequest('POST', {
    scenarioId: 'scenario-1',
    title: 'Plan',
    status: 'active',
    items: [{ title: 'Contacter une structure', status: 'planned' }],
  }, 2));
  assert.equal(planResponse.status, 201);
  assert.equal(planResponse.headers.get('etag'), '"3"');
};

test('action API updates status, order, evidence and exposes descriptive progress', async () => {
  const app = createApp();
  await prepareProject(app);

  const updatePath = '/api/v1/life-projects/project-1/action-plans/plan-1/actions/action-1';
  const blockedResponse = await request(app, updatePath, jsonRequest('PATCH', {
    commandId: 'command-block-1',
    status: 'blocked',
    position: 4,
    blockingReasons: ['Coordonnées à confirmer'],
    evidenceIds: ['evidence-1'],
    reason: 'Impossible de contacter la structure pour le moment.',
  }, 3));
  const blocked = await blockedResponse.json();
  assert.equal(blockedResponse.status, 200);
  assert.equal(blockedResponse.headers.get('etag'), '"4"');
  assert.equal(blocked.project.actionPlans[0].items[0].status, 'blocked');
  assert.equal(blocked.actionTracking.position, 4);
  assert.equal(blocked.actionTracking.statusHistory.at(-1).eventId, 'command-block-1');

  const progressResponse = await request(app, '/api/v1/life-projects/project-1/progress');
  const progress = await progressResponse.json();
  assert.equal(progressResponse.status, 200);
  assert.equal(progressResponse.headers.get('etag'), '"4"');
  assert.equal(progress.progress.state, 'blocked');
  assert.equal(progress.progress.counts.blocked, 1);
  assert.equal(progress.progress.nextActions[0].position, 4);
  assert.equal(JSON.stringify(progress).includes('%'), false);
});

test('action commands are replayable and conflicting reuse is rejected', async () => {
  const app = createApp();
  await prepareProject(app);
  const updatePath = '/api/v1/life-projects/project-1/action-plans/plan-1/actions/action-1';
  const body = {
    commandId: 'same-action-command',
    status: 'in_progress',
    reason: 'Démarrage',
  };
  const first = await request(app, updatePath, jsonRequest('PATCH', body, 3));
  assert.equal(first.status, 200);

  const replay = await request(app, updatePath, jsonRequest('PATCH', body, 3));
  const replayBody = await replay.json();
  assert.equal(replay.status, 200);
  assert.equal(replayBody.replayed, true);
  assert.equal(replay.headers.get('etag'), '"4"');

  const conflict = await request(app, updatePath, jsonRequest('PATCH', {
    commandId: 'same-action-command',
    status: 'completed',
  }, 4));
  const conflictBody = await conflict.json();
  assert.equal(conflict.status, 409);
  assert.equal(conflictBody.error.code, 'LIFE_PROJECT_COMMAND_CONFLICT');
});

test('blocked status requires a reason and stale versions fail closed', async () => {
  const app = createApp();
  await prepareProject(app);
  const updatePath = '/api/v1/life-projects/project-1/action-plans/plan-1/actions/action-1';

  const noReason = await request(app, updatePath, jsonRequest('PATCH', {
    commandId: 'missing-reason',
    status: 'blocked',
  }, 3));
  const noReasonBody = await noReason.json();
  assert.equal(noReason.status, 400);
  assert.equal(noReasonBody.error.code, 'LIFE_PROJECT_BLOCKING_REASON_REQUIRED');

  await request(app, updatePath, jsonRequest('PATCH', {
    commandId: 'start-action',
    status: 'in_progress',
  }, 3));
  const stale = await request(app, updatePath, jsonRequest('PATCH', {
    commandId: 'complete-stale',
    status: 'completed',
  }, 3));
  const staleBody = await stale.json();
  assert.equal(stale.status, 409);
  assert.equal(staleBody.error.code, 'LIFE_PROJECT_VERSION_CONFLICT');
});
