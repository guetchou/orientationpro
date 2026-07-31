'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createLifeProjectRouter } = require('../src/life-project/router');

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

const result = {
  id: 'owned-result',
  attemptId: 'attempt-1',
  accountId: 'account-advisor',
  instrumentId: 'instrument-1',
  resultType: 'riasec',
  algorithmVersion: 'riasec-scoring-v2',
  primaryCode: 'ISE',
  displayCode: 'I-S-E',
  scores: {
    R: { normalized: 20 },
    I: { normalized: 90 },
    A: { normalized: 40 },
    S: { normalized: 80 },
    E: { normalized: 70 },
    C: { normalized: 30 },
  },
  ranking: {
    ordered: [
      { dimension: 'I', score: 90 },
      { dimension: 'S', score: 80 },
      { dimension: 'E', score: 70 },
      { dimension: 'A', score: 40 },
      { dimension: 'C', score: 30 },
      { dimension: 'R', score: 20 },
    ],
  },
  createdAt: '2026-07-31T18:00:00.000Z',
};

const authenticated = (req, res, next) => {
  req.auth = { account: { id: 'account-advisor' } };
  next();
};

const createApp = () => {
  let capturedDiagnostic = null;
  const service = {
    async get() {
      return {
        project: { diagnostic: null },
        persistenceVersion: 1,
      };
    },
    async replaceDiagnostic(accountId, projectId, diagnostic) {
      capturedDiagnostic = diagnostic;
      return {
        project: {
          id: projectId,
          ownerAccountId: accountId,
          diagnostic,
        },
        persistenceVersion: 2,
      };
    },
  };
  const riasecStore = {
    async getResult({ accountId, resultId }) {
      return accountId === result.accountId && resultId === result.id ? result : null;
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/life-projects', createLifeProjectRouter({
    service,
    authenticate: authenticated,
    riasecStore,
  }));
  return { app, captured: () => capturedDiagnostic };
};

test('life-project persists the owned server result instead of client-provided RIASEC scores', async () => {
  const { app, captured } = createApp();
  const response = await request(app, '/api/v1/life-projects/project-1/diagnostic', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'if-match': '"1"',
    },
    body: JSON.stringify({
      objective: 'studies',
      riasecResultId: 'owned-result',
      riasecProfile: {
        resultId: 'owned-result',
        scores: { R: 100, I: 0, A: 0, S: 0, E: 0, C: 0 },
      },
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(captured().riasecResultId, undefined);
  assert.equal(captured().riasecProfile.resultId, 'owned-result');
  assert.equal(captured().riasecProfile.scores.I, 90);
  assert.equal(captured().riasecProfile.scores.R, 20);
  assert.equal(captured().riasecProfile.ranking[0].dimension, 'I');
  assert.equal(body.project.diagnostic.riasecProfile.displayCode, 'I-S-E');
});

test('life-project returns 404 when the RIASEC result does not belong to the account', async () => {
  const { app } = createApp();
  const response = await request(app, '/api/v1/life-projects/project-1/diagnostic', {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'if-match': '"1"',
    },
    body: JSON.stringify({
      objective: 'studies',
      riasecResultId: 'another-account-result',
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'LIFE_PROJECT_RIASEC_RESULT_NOT_FOUND');
});
