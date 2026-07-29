'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createCapabilityRegistry } = require('../src/capabilities/registry');
const { createLifeProjectRouter } = require('../src/life-project/router');
const { createLifeProjectService } = require('../src/life-project/service');

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
      return [...records.values()].filter((record) => record.project.ownerAccountId === accountId);
    },
    async save(project, { expectedVersion }) {
      const record = records.get(project.id);
      if (!record || record.persistenceVersion !== expectedVersion) return null;
      const next = { project, persistenceVersion: expectedVersion + 1 };
      records.set(project.id, next);
      return next;
    },
  };
};

const authenticate = (req, res, next) => {
  req.auth = { account: { id: 'account-1' } };
  next();
};

const createApp = () => {
  const service = createLifeProjectService({
    store: createMemoryStore(),
    idFactory: () => 'project-1',
    clock: () => new Date('2026-07-29T10:00:00.000Z'),
  });
  const capabilityRegistry = createCapabilityRegistry({
    AUTH_V1_ENABLED: 'true',
    LIFE_PROJECT_API_ENABLED: 'true',
    RIASEC_API_ENABLED: 'true',
    CAREER_API_ENABLED: 'true',
  });
  const app = express();
  app.use(express.json());
  app.use('/api/v1/life-projects', createLifeProjectRouter({
    service,
    authenticate,
    capabilityRegistry,
    clock: () => new Date('2026-07-29T10:05:00.000Z'),
  }));
  return app;
};

test('orchestration endpoint is account-scoped, versioned and explains its next module', async () => {
  const app = createApp();
  const created = await request(app, '/api/v1/life-projects', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Projet',
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
  });
  assert.equal(created.status, 201);

  const response = await request(app, '/api/v1/life-projects/project-1/orchestration');
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('etag'), '"1"');
  assert.equal(body.schemaVersion, 'makoki-life-project-orchestration-api-v1');
  assert.equal(body.orchestration.schemaVersion, 'makoki-life-path-orchestration-v1');
  assert.equal(body.orchestration.nextModuleId, 'profile.review');
  assert.equal(body.orchestration.nextModuleReasons[0].code, 'NO_SCENARIO_PROFILE_CONTEXT');
});

test('completed and skipped modules are reflected without mutating the project', async () => {
  const app = createApp();
  await request(app, '/api/v1/life-projects', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'Projet',
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
  });

  const response = await request(
    app,
    '/api/v1/life-projects/project-1/orchestration?completed=profile.review&skipped=orientation.interests',
  );
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.orchestration.nextModuleId, 'profile.skills-review');
  assert.equal(
    body.orchestration.recommendations.find((entry) => entry.moduleId === 'profile.review').completion,
    'completed',
  );
  assert.equal(
    body.orchestration.recommendations.find((entry) => entry.moduleId === 'orientation.interests').completion,
    'skipped',
  );

  const projectResponse = await request(app, '/api/v1/life-projects/project-1');
  const projectBody = await projectResponse.json();
  assert.equal(projectBody.project.nextModuleId, undefined);
});
