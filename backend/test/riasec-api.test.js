const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const { instrument: definition } = require('../src/orientation/riasec/instrument');
const { createRiasecRouter } = require('../src/orientation/riasec/router');

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

const databaseInstrument = () => ({
  id: definition.id,
  slug: definition.slug,
  version: definition.version,
  locale: definition.locale,
  status: 'draft',
  title: definition.title,
  methodology: definition.methodology,
  source: definition.source,
  disclaimer: definition.disclaimer,
  scoringVersion: 'riasec-opc-scoring-v1',
  contentHash: 'a'.repeat(64),
  items: definition.items,
});

const authenticated = (req, res, next) => {
  req.auth = {
    account: { id: 'account-1', email: 'person@example.test', status: 'active', roles: ['user'] },
    sessionId: 'session-1',
  };
  next();
};

const createApp = (
  store,
  authenticate = authenticated,
  hasPermission = async () => true,
) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/orientation', createRiasecRouter({
    store,
    authenticate,
    hasPermission,
    allowDraft: true,
  }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'UNEXPECTED', message: error.message } });
  });
  return app;
};

test('instrument endpoint never exposes scoring dimensions or reverse-scoring keys', async () => {
  const store = {
    getInstrument: async () => databaseInstrument(),
  };
  const response = await request(createApp(store), '/api/v1/orientation/riasec/instrument');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.instrument.itemCount, 60);
  assert.equal(body.instrument.items[0].dimension, undefined);
  assert.equal(body.instrument.items[0].reverseScored, undefined);
  assert.equal(typeof body.instrument.items[0].prompt, 'string');
  assert.match(body.instrument.disclaimer, /ne constitue ni un diagnostic/i);
});

test('starting an attempt stores ownership and a complete randomized item order', async () => {
  let creation;
  const instrument = databaseInstrument();
  const store = {
    getInstrument: async () => instrument,
    createAttempt: async (input) => {
      creation = input;
      return { id: 'attempt-1', status: 'in_progress', ...input };
    },
  };
  const response = await request(createApp(store), '/api/v1/orientation/riasec/attempts', {
    method: 'POST',
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(creation.accountId, 'account-1');
  assert.equal(creation.instrumentId, instrument.id);
  assert.equal(new Set(creation.itemOrder).size, instrument.items.length);
  assert.deepEqual(
    [...creation.itemOrder].sort(),
    instrument.items.map((item) => item.id).sort(),
  );
  assert.deepEqual(
    body.instrument.items.map((item) => item.id),
    creation.itemOrder,
  );
});

test('submitting complete answers calculates the server result and persists one snapshot', async () => {
  const instrument = databaseInstrument();
  const responses = instrument.items.map((item, index) => ({
    itemId: item.id,
    value: (index % 5) + 1,
  }));
  let completion;
  const store = {
    getAttempt: async ({ accountId, attemptId }) => ({
      id: attemptId,
      accountId,
      instrumentId: instrument.id,
      status: 'in_progress',
      itemOrder: instrument.items.map((item) => item.id),
      responses: [],
    }),
    getInstrument: async () => instrument,
    completeAttempt: async (input) => {
      completion = input;
      return {
        status: 'completed',
        result: {
          id: 'result-1',
          accountId: input.accountId,
          attemptId: input.attemptId,
          ...input.result,
          snapshot: input.snapshot,
        },
      };
    },
  };
  const response = await request(
    createApp(store),
    '/api/v1/orientation/riasec/attempts/attempt-1/submit',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ responses }),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(completion.accountId, 'account-1');
  assert.equal(completion.responses.length, 60);
  assert.equal(completion.result.algorithmVersion, 'riasec-opc-scoring-v1');
  assert.equal(completion.snapshot.instrument.id, instrument.id);
  assert.deepEqual(completion.snapshot.result.scores, completion.result.scores);
  assert.equal(body.result.snapshot.instrument.disclaimer, instrument.disclaimer);
});

test('incomplete answers are rejected before any database completion write', async () => {
  const instrument = databaseInstrument();
  let completed = false;
  const store = {
    getAttempt: async () => ({
      id: 'attempt-1',
      accountId: 'account-1',
      instrumentId: instrument.id,
      status: 'in_progress',
      itemOrder: instrument.items.map((item) => item.id),
      responses: [],
    }),
    getInstrument: async () => instrument,
    completeAttempt: async () => {
      completed = true;
    },
  };
  const response = await request(
    createApp(store),
    '/api/v1/orientation/riasec/attempts/attempt-1/submit',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ responses: [] }),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.code, 'INCOMPLETE_RESPONSES');
  assert.equal(completed, false);
});

test('result history always uses the authenticated account as owner filter', async () => {
  let listing;
  const store = {
    listResults: async (input) => {
      listing = input;
      return [];
    },
  };
  const response = await request(createApp(store), '/api/v1/orientation/results?limit=5&offset=2');

  assert.equal(response.status, 200);
  assert.equal(listing.accountId, 'account-1');
  assert.equal(listing.limit, '5');
  assert.equal(listing.offset, '2');
});

test('all RIASEC routes reject a missing session before reading the store', async () => {
  let storeRead = false;
  const store = {
    getInstrument: async () => {
      storeRead = true;
      return databaseInstrument();
    },
  };
  const rejectAuthentication = (req, res) => res.status(401).json({
    error: { code: 'SESSION_REQUIRED', message: 'An access token is required.' },
  });
  const response = await request(
    createApp(store, rejectAuthentication),
    '/api/v1/orientation/riasec/instrument',
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'SESSION_REQUIRED');
  assert.equal(storeRead, false);
});

test('all RIASEC routes reject an account without the required server permission', async () => {
  let storeRead = false;
  let checkedPermission;
  const store = {
    getInstrument: async () => {
      storeRead = true;
      return databaseInstrument();
    },
  };
  const hasPermission = async (input) => {
    checkedPermission = input;
    return false;
  };
  const response = await request(
    createApp(store, authenticated, hasPermission),
    '/api/v1/orientation/riasec/instrument',
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, 'PERMISSION_DENIED');
  assert.deepEqual(checkedPermission, {
    accountId: 'account-1',
    permissionId: 'orientation.result.read_own',
  });
  assert.equal(storeRead, false);
});
