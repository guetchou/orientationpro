const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { createCareerRouter } = require('../src/career/router');

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

const authenticated = (req, res, next) => {
  req.auth = {
    account: { id: 'account-1', email: 'person@example.test', status: 'active', roles: ['user'] },
    sessionId: 'session-1',
  };
  next();
};

const createApp = (store, hasPermission = async () => true) => {
  const app = express();
  app.use('/api/v1/career', createCareerRouter({
    store,
    authenticate: authenticated,
    hasPermission,
  }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'UNEXPECTED', message: error.message } });
  });
  return app;
};

test('catalog search forwards bounded user filters to the store', async () => {
  let searchInput;
  const store = {
    searchOccupations: async (input) => {
      searchInput = input;
      return [{ id: 'onet:30.3:en:11-1011.00', preferredLabel: 'Chief Executives' }];
    },
  };
  const response = await request(
    createApp(store),
    '/api/v1/career/occupations?q=manager&locale=en&riasecOnly=true&limit=10&offset=5',
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.occupations.length, 1);
  assert.deepEqual(searchInput, {
    query: 'manager',
    locale: 'en',
    riasecOnly: true,
    includeLocallyExcluded: false,
    limit: '10',
    offset: '5',
  });
});

test('matching always uses the authenticated account as ownership filter', async () => {
  let matchingInput;
  const store = {
    matchOrientationResult: async (input) => {
      matchingInput = input;
      return { result: { id: input.resultId }, matching: { matches: [] } };
    },
  };
  const response = await request(
    createApp(store),
    '/api/v1/career/matches/result-123?locale=en&limit=25',
  );

  assert.equal(response.status, 200);
  assert.deepEqual(matchingInput, {
    accountId: 'account-1',
    resultId: 'result-123',
    locale: 'en',
    includeLocallyExcluded: false,
    limit: '25',
  });
});

test('unknown occupation and unknown owned result return 404', async () => {
  const store = {
    getOccupation: async () => null,
    matchOrientationResult: async () => null,
  };
  const app = createApp(store);

  const occupationResponse = await request(app, '/api/v1/career/occupations/unknown');
  assert.equal(occupationResponse.status, 404);
  assert.equal((await occupationResponse.json()).error.code, 'OCCUPATION_NOT_FOUND');

  const matchResponse = await request(app, '/api/v1/career/matches/unknown');
  assert.equal(matchResponse.status, 404);
  assert.equal((await matchResponse.json()).error.code, 'ORIENTATION_RESULT_NOT_FOUND');
});

test('permission denial is enforced before the store is called', async () => {
  let called = false;
  const store = {
    getCatalogSummary: async () => {
      called = true;
      return [];
    },
  };
  const response = await request(
    createApp(store, async () => false),
    '/api/v1/career/catalog/summary',
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, 'PERMISSION_DENIED');
  assert.equal(called, false);
});
