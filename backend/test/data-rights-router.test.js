'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const test = require('node:test');
const { createDataRightsRouter } = require('../src/data-rights/router');

const startServer = async (service) => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/data-rights', createDataRightsRouter({
    service,
    authenticate: (request, response, next) => {
      request.auth = { account: { id: 'account-1' } };
      next();
    },
    cookieSecure: false,
  }));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
};

test('data export is scoped to the authenticated account and never cached', async () => {
  let observedAccountId = null;
  const fixture = await startServer({
    exportAccount: async (accountId) => {
      observedAccountId = accountId;
      return { schemaVersion: 'makoki.portable-export.v1', account: { id: accountId } };
    },
  });
  try {
    const response = await fetch(`${fixture.baseUrl}/api/v1/data-rights/export`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('content-disposition'), /makoki-data-export\.json/);
    assert.equal(observedAccountId, 'account-1');
    assert.deepEqual(await response.json(), {
      schemaVersion: 'makoki.portable-export.v1',
      account: { id: 'account-1' },
    });
  } finally {
    await fixture.close();
  }
});

test('profile correction cannot choose another account identifier', async () => {
  let observed = null;
  const fixture = await startServer({
    correctProfile: async (accountId, input) => {
      observed = { accountId, input };
      return { accountId, city: input.city };
    },
  });
  try {
    const response = await fetch(`${fixture.baseUrl}/api/v1/data-rights/profile`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId: 'account-2', city: 'Matadi' }),
    });
    assert.equal(response.status, 200);
    assert.equal(observed.accountId, 'account-1');
    assert.equal(observed.input.accountId, 'account-2');
    const payload = await response.json();
    assert.equal(payload.profile.accountId, 'account-1');
  } finally {
    await fixture.close();
  }
});

test('account deletion clears refresh cookie only after service confirmation', async () => {
  const fixture = await startServer({
    deleteAccount: async ({ accountId, currentPassword, confirmation }) => {
      assert.equal(accountId, 'account-1');
      assert.equal(currentPassword, 'correct-password');
      assert.equal(confirmation, 'SUPPRIMER MON COMPTE');
      return { schemaVersion: 'makoki.data-deletion-result.v1', status: 'deleted' };
    },
  });
  try {
    const response = await fetch(`${fixture.baseUrl}/api/v1/data-rights/delete-account`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        currentPassword: 'correct-password',
        confirmation: 'SUPPRIMER MON COMPTE',
      }),
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie'), /orientationpro_refresh=;/);
    assert.equal((await response.json()).status, 'deleted');
  } finally {
    await fixture.close();
  }
});
