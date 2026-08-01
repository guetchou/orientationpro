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
  responseScale: definition.responseScale,
  dimensions: definition.dimensions,
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

const anonymous = (req, res, next) => next();

const createApp = (
  store,
  {
    authenticateOptional = authenticated,
    hasPermission = async () => true,
    guestOwner = { guestSessionId: 'guest-1', accountId: null, kind: 'guest' },
    claimFromRequest = async () => ({ status: 'not_found', attempts: 0, results: 0 }),
  } = {},
) => {
  const guestSessions = {
    resolveOwner: async (req) => req.auth?.account?.id
      ? { accountId: req.auth.account.id, guestSessionId: null, kind: 'account' }
      : guestOwner,
    claimFromRequest,
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/orientation', createRiasecRouter({
    store,
    authenticateOptional,
    hasPermission,
    guestSessions,
    allowDraft: true,
  }));
  app.use((error, req, res, next) => {
    res.status(500).json({ error: { code: 'UNEXPECTED', message: error.message } });
  });
  return app;
};

test('instrument endpoint is public and never exposes scoring dimensions or reverse-scoring keys', async () => {
  const store = {
    getInstrument: async () => databaseInstrument(),
  };
  const response = await request(
    createApp(store, { authenticateOptional: anonymous }),
    '/api/v1/orientation/riasec/instrument',
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.instrument.itemCount, 60);
  assert.equal(body.instrument.items[0].dimension, undefined);
  assert.equal(body.instrument.items[0].reverseScored, undefined);
  assert.equal(typeof body.instrument.items[0].prompt, 'string');
  assert.match(body.instrument.disclaimer, /ne constitue ni un diagnostic/i);
});

test('guest claim requires an authenticated account', async () => {
  let claimed = false;
  const response = await request(
    createApp({}, {
      authenticateOptional: anonymous,
      claimFromRequest: async () => {
        claimed = true;
      },
    }),
    '/api/v1/orientation/guest/claim',
    { method: 'POST' },
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.code, 'SESSION_REQUIRED');
  assert.equal(claimed, false);
});

test('authenticated guest claim transfers the opaque session to the account', async () => {
  let claimInput;
  const expected = { status: 'claimed', attempts: 1, results: 1 };
  const response = await request(
    createApp({}, {
      claimFromRequest: async (req, res, accountId) => {
        claimInput = { req, res, accountId };
        return expected;
      },
    }),
    '/api/v1/orientation/guest/claim',
    { method: 'POST' },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(claimInput.accountId, 'account-1');
  assert.deepEqual(body.claim, expected);
});

test('starting an authenticated attempt stores account ownership and a complete randomized item order', async () => {
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
  assert.equal(creation.guestSessionId, null);
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

test('starting without an account stores only the opaque guest owner', async () => {
  let creation;
  const instrument = databaseInstrument();
  const store = {
    getInstrument: async () => instrument,
    createAttempt: async (input) => {
      creation = input;
      return { id: 'attempt-guest', status: 'in_progress', ...input };
    },
  };
  const response = await request(
    createApp(store, { authenticateOptional: anonymous }),
    '/api/v1/orientation/riasec/attempts',
    { method: 'POST' },
  );

  assert.equal(response.status, 201);
  assert.equal(creation.accountId, null);
  assert.equal(creation.guestSessionId, 'guest-1');
});

test('submitting complete answers calculates the server result and persists one account snapshot', async () => {
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
  assert.equal(completion.guestSessionId, null);
  assert.equal(completion.responses.length, 60);
  assert.equal(completion.result.algorithmVersion, 'riasec-opc-scoring-v1');
  assert.equal(completion.snapshot.instrument.id, instrument.id);
  assert.deepEqual(completion.snapshot.dimensions, instrument.dimensions);
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

test('an unsupported instrument algorithm is rejected before creating an attempt', async () => {
  let created = false;
  const unsupported = {
    ...databaseInstrument(),
    scoringVersion: 'riasec-unknown-v99',
  };
  const store = {
    getInstrument: async () => unsupported,
    createAttempt: async () => {
      created = true;
    },
  };
  const response = await request(createApp(store), '/api/v1/orientation/riasec/attempts', {
    method: 'POST',
  });
  const body = await response.json();

  assert.equal(response.status, 409);
  assert.equal(body.error.code, 'UNSUPPORTED_RIASEC_ALGORITHM');
  assert.equal(body.error.details.requiredVersion, 'riasec-unknown-v99');
  assert.equal(created, false);
});

test('result history always uses the resolved account owner filter', async () => {
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
  assert.equal(listing.guestSessionId, null);
  assert.equal(listing.limit, '5');
  assert.equal(listing.offset, '2');
});

test('guest result history is isolated by the guest session owner', async () => {
  let listing;
  const store = {
    listResults: async (input) => {
      listing = input;
      return [];
    },
  };
  const response = await request(
    createApp(store, { authenticateOptional: anonymous }),
    '/api/v1/orientation/results',
  );

  assert.equal(response.status, 200);
  assert.equal(listing.accountId, null);
  assert.equal(listing.guestSessionId, 'guest-1');
});

test('authenticated routes reject an account without the required server permission', async () => {
  let storeWrite = false;
  let checkedPermission;
  const store = {
    createAttempt: async () => {
      storeWrite = true;
    },
  };
  const hasPermission = async (input) => {
    checkedPermission = input;
    return false;
  };
  const response = await request(
    createApp(store, { hasPermission }),
    '/api/v1/orientation/riasec/attempts',
    { method: 'POST' },
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.code, 'PERMISSION_DENIED');
  assert.deepEqual(checkedPermission, {
    accountId: 'account-1',
    permissionId: 'orientation.result.create',
  });
  assert.equal(storeWrite, false);
});