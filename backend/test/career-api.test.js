'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createCareerRouter } = require('../src/career/router');

const request = async (app, pathname) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${pathname}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
};

const authenticated = (req, res, next) => {
  req.auth = { account: { id: 'account-1' } };
  next();
};

const appFor = (store, hasPermission = async () => true) => {
  const app = express();
  app.use('/api/v1/career', createCareerRouter({ store, authenticate: authenticated, hasPermission }));
  return app;
};

test('catalog search defaults to French', async () => {
  let input;
  const response = await request(appFor({
    searchOccupations: async (value) => {
      input = value;
      return [{ preferredLabel: 'infirmier' }];
    },
  }), '/api/v1/career/occupations?q=infirmier');
  const body = await response.json();
  assert.equal(body.requestedLocale, 'fr');
  assert.equal(body.occupations[0].preferredLabel, 'infirmier');
  assert.equal(input.locale, 'fr');
});

test('detail forwards locale and explicit fallback', async () => {
  let input;
  const response = await request(appFor({
    getOccupation: async (value) => {
      input = value;
      return { locale: 'en', fallbackLocale: 'en', translationStatus: 'unavailable' };
    },
  }), '/api/v1/career/occupations/onet%3Ajob?locale=fr');
  const body = await response.json();
  assert.deepEqual(input, { occupationId: 'onet:job', locale: 'fr' });
  assert.equal(body.occupation.translationStatus, 'unavailable');
});

test('matching uses authenticated account and French', async () => {
  let input;
  const response = await request(appFor({
    matchOrientationResult: async (value) => {
      input = value;
      return { matching: { matches: [] } };
    },
  }), '/api/v1/career/matches/result-1');
  assert.equal(response.status, 200);
  assert.equal(input.accountId, 'account-1');
  assert.equal(input.locale, 'fr');
});

test('profile recommendation uses only authenticated account identity', async () => {
  let input;
  const response = await request(appFor({
    recommendProfileCareers: async (value) => {
      input = value;
      return {
        recommendationContext: { usedSignals: ['riasec'] },
        matching: { matches: [] },
      };
    },
  }), '/api/v1/career/recommendations/result-1?accountId=account-2&limit=6');
  assert.equal(response.status, 200);
  assert.equal(input.accountId, 'account-1');
  assert.equal(input.resultId, 'result-1');
  assert.equal(input.limit, '6');
});

test('profile recommendation keeps non-owned results non-enumerable', async () => {
  const response = await request(appFor({ recommendProfileCareers: async () => null }), '/api/v1/career/recommendations/result-other');
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.error.code, 'ORIENTATION_RESULT_NOT_FOUND');
});

test('permission is checked before store', async () => {
  let called = false;
  const response = await request(appFor({
    getCatalogSummary: async () => {
      called = true;
      return [];
    },
  }, async () => false), '/api/v1/career/catalog/summary');
  assert.equal(response.status, 403);
  assert.equal(called, false);
});
