'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createLifeProjectRouter } = require('../src/life-project/router');
const { createLifeProjectService } = require('../src/life-project/service');
const { LifeProjectPersistenceError } = require('../src/life-project/store');
const {
  CONGO_LOCAL_OPTIONS,
  createCongoLocalOptionProvider,
} = require('../src/life-project/local-options-cg');

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
      const next = { project, persistenceVersion: expectedVersion + 1 };
      records.set(project.id, next);
      return next;
    },
  };
};

const authenticated = (req, res, next) => {
  req.auth = { account: { id: 'account-advisor', email: 'advisor@example.test' } };
  next();
};

const diagnosticPayload = ({ zone = 'Brazzaville', mobility = 'local' } = {}) => ({
  objective: 'studies',
  identity: {
    ageRange: '16-20',
    country: { value: 'Congo', verification: 'declared' },
    zone: { value: zone, verification: 'declared' },
    situation: { value: 'Terminale générale', verification: 'declared' },
    educationLevel: { value: 'baccalaureate', verification: 'declared' },
    diploma: { value: 'Baccalauréat en préparation', verification: 'declared' },
    subjects: ['Mathématiques', 'Sciences'],
    significantResults: ['Résultats moyens en mathématiques'],
    interruptions: [],
  },
  constraints: {
    mobility,
    budget: { amount: 400000, currency: 'XAF', verification: 'declared' },
    needIncomeWithinMonths: 36,
    maxDurationMonths: 60,
    internetAccess: 'regular',
    equipment: ['smartphone'],
    familyResponsibilities: [],
    availability: ['temps plein'],
    healthOrDisability: [],
    documents: ['baccalaureat', 'piece identite'],
    availableModes: ['presentiel', 'online'],
  },
  preferences: {
    interests: ['numérique', 'informatique', 'technologie'],
    activities: ['résolution de problèmes'],
    favouriteSubjects: ['sciences'],
    workEnvironments: ['travail en équipe'],
    workStyles: ['travail technique', 'analyse'],
    values: ['évolution', 'insertion'],
  },
  capabilities: {
    skills: ['logique', 'communication'],
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
    { id: 'proximity', importance: 0.9 },
  ],
  notes: 'Diagnostic saisi progressivement par le conseiller.',
});

const createApp = () => {
  let counter = 0;
  let minute = 0;
  const service = createLifeProjectService({
    store: createMemoryStore(),
    optionProvider: createCongoLocalOptionProvider(),
    idFactory: () => `generated-${++counter}`,
    clock: () => new Date(`2026-07-30T10:${String(minute++).padStart(2, '0')}:00.000Z`),
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

test('official Congo catalog keeps provenance and verification limits explicit', () => {
  assert.ok(CONGO_LOCAL_OPTIONS.length >= 5);
  for (const option of CONGO_LOCAL_OPTIONS) {
    assert.ok(option.sourceReferences.length > 0);
    assert.ok(option.sourceReferences.every((entry) => entry.url?.startsWith('https://')));
    assert.ok(['verified', 'to_confirm'].includes(option.verificationStatus));
    assert.ok(option.experimentActions.length > 0);
  }
  const university = CONGO_LOCAL_OPTIONS.find((entry) => entry.id === 'cg-umng-fst-informatique-reseaux');
  assert.equal(university.verificationStatus, 'to_confirm');
  assert.equal(university.cost.status, 'unknown');
  assert.equal(university.calendar.status, 'unknown');
});

test('advisor API persists a progressive diagnostic and generates sourced, actionable scenarios', async () => {
  const app = createApp();
  const createdResponse = await request(app, '/api/v1/life-projects', jsonRequest('POST', {
    title: 'Projet de vie — dossier réel',
    purpose: 'Produire plusieurs options vérifiables pendant la séance.',
  }));
  const created = await createdResponse.json();
  const projectId = created.project.id;
  assert.equal(createdResponse.status, 201);
  assert.equal(created.project.diagnostic, null);
  assert.equal(created.project.recommendation, null);

  const premature = await request(
    app,
    `/api/v1/life-projects/${projectId}/recommendations`,
    jsonRequest('POST', {}, 1),
  );
  const prematureBody = await premature.json();
  assert.equal(premature.status, 400);
  assert.equal(prematureBody.error.code, 'LIFE_PROJECT_DIAGNOSTIC_REQUIRED');

  const diagnosticResponse = await request(
    app,
    `/api/v1/life-projects/${projectId}/diagnostic`,
    jsonRequest('PUT', diagnosticPayload(), 1),
  );
  const diagnosed = await diagnosticResponse.json();
  assert.equal(diagnosticResponse.status, 200);
  assert.equal(diagnosticResponse.headers.get('etag'), '"2"');
  assert.equal(diagnosed.project.diagnostic.schemaVersion, 'makoki-life-diagnostic-v1');
  assert.equal(diagnosed.project.diagnostic.identity.zone.value, 'Brazzaville');
  assert.equal(diagnosed.project.criteria.length, 4);
  assert.equal(diagnosed.project.recommendation, null);

  const recommendationResponse = await request(
    app,
    `/api/v1/life-projects/${projectId}/recommendations`,
    jsonRequest('POST', { maximumScenarios: 5 }, 2),
  );
  const recommended = await recommendationResponse.json();
  assert.equal(recommendationResponse.status, 200);
  assert.equal(recommendationResponse.headers.get('etag'), '"3"');
  assert.equal(recommended.project.recommendation.status, 'complete');
  assert.ok(recommended.project.recommendation.scenarios.length >= 3);
  assert.ok(recommended.project.recommendation.scenarios.length <= 5);
  assert.equal(recommended.project.scenarios.length, recommended.project.recommendation.scenarios.length);
  assert.equal(recommended.project.actionPlans.length, recommended.project.recommendation.scenarios.length);
  assert.equal(recommended.project.state, 'comparison');
  assert.equal(recommended.project.stateHistory.length, 2);

  for (const scenario of recommended.project.recommendation.scenarios) {
    assert.ok(scenario.sourceReferences.length > 0);
    assert.ok(scenario.firstActions.length > 0);
    assert.ok(scenario.conditions.length > 0);
    assert.ok(scenario.risks.length > 0);
    assert.ok(['high', 'medium', 'low'].includes(scenario.confidence));
  }
  assert.ok(recommended.project.recommendation.scenarios.some((scenario) => (
    scenario.missingInformation.some((entry) => entry.includes('Coût'))
  )));
});

test('generated scenario identifiers are isolated between projects with the same options', async () => {
  const app = createApp();
  const scenarioIds = [];
  for (let projectIndex = 0; projectIndex < 2; projectIndex += 1) {
    const createdResponse = await request(app, '/api/v1/life-projects', jsonRequest('POST', {
      title: `Projet ${projectIndex + 1}`,
    }));
    const created = await createdResponse.json();
    const projectId = created.project.id;
    await request(
      app,
      `/api/v1/life-projects/${projectId}/diagnostic`,
      jsonRequest('PUT', diagnosticPayload(), 1),
    );
    const recommendationResponse = await request(
      app,
      `/api/v1/life-projects/${projectId}/recommendations`,
      jsonRequest('POST', {}, 2),
    );
    const recommendation = await recommendationResponse.json();
    assert.equal(recommendationResponse.status, 200);
    scenarioIds.push(new Set(recommendation.project.scenarios.map((scenario) => scenario.id)));
  }
  for (const id of scenarioIds[0]) assert.equal(scenarioIds[1].has(id), false);
});

test('replacing a diagnostic invalidates only the previous generated scenarios and plans', async () => {
  const app = createApp();
  const createdResponse = await request(app, '/api/v1/life-projects', jsonRequest('POST', { title: 'Projet' }));
  const created = await createdResponse.json();
  const projectId = created.project.id;
  await request(
    app,
    `/api/v1/life-projects/${projectId}/diagnostic`,
    jsonRequest('PUT', diagnosticPayload(), 1),
  );
  const generatedResponse = await request(
    app,
    `/api/v1/life-projects/${projectId}/recommendations`,
    jsonRequest('POST', {}, 2),
  );
  const generated = await generatedResponse.json();
  assert.ok(generated.project.scenarios.length >= 3);

  const replacedResponse = await request(
    app,
    `/api/v1/life-projects/${projectId}/diagnostic`,
    jsonRequest('PUT', diagnosticPayload({ zone: 'Pointe-Noire', mobility: 'none' }), 3),
  );
  const replaced = await replacedResponse.json();
  assert.equal(replacedResponse.status, 200);
  assert.equal(replaced.project.recommendation, null);
  assert.equal(replaced.project.scenarios.length, 0);
  assert.equal(replaced.project.actionPlans.length, 0);
  assert.equal(replaced.project.activeScenarioId, null);
});
