'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { createProfileRouter } = require('../src/profile/router');
const { calculateCompletion } = require('../src/profile/store');

const request = (port, method, path, body, accountId) => new Promise((resolve, reject) => {
  const payload = body ? JSON.stringify(body) : null;
  const req = http.request({
    hostname: '127.0.0.1',
    port,
    method,
    path,
    headers: {
      'x-test-account': accountId,
      ...(payload ? {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload),
      } : {}),
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({
      status: res.statusCode,
      body: data ? JSON.parse(data) : null,
    }));
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

test('completion is proportional to confirmed structured fields', () => {
  assert.equal(calculateCompletion({
    first_name: 'A',
    last_name: 'B',
    city: 'Brazzaville',
  }), 50);
  assert.equal(calculateCompletion({
    first_name: 'A',
    last_name: 'B',
    city: 'Brazzaville',
    current_situation: 'student',
    primary_goal: 'choose_studies',
    mobility_scope: 'national',
  }), 100);
});

test('profile ownership always comes from the authenticated account', async (t) => {
  const calls = [];
  const store = {
    async getProfile(accountId) {
      calls.push(['get', accountId]);
      return { profile: { account_id: accountId }, education: [], skills: [], hypotheses: [] };
    },
    async upsertProfile(accountId, body) {
      calls.push(['put', accountId, body]);
      return { profile: { ...body, account_id: accountId }, education: [], skills: [], hypotheses: [] };
    },
  };
  const authenticate = (req, res, next) => {
    req.auth = { account: { id: req.headers['x-test-account'] } };
    next();
  };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/profile', createProfileRouter({ store, authenticate }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const port = server.address().port;

  const read = await request(port, 'GET', '/api/v1/profile', null, 'account-a');
  assert.equal(read.status, 200);
  assert.equal(read.body.profile.account_id, 'account-a');

  const write = await request(
    port,
    'PUT',
    '/api/v1/profile',
    { first_name: 'Maya', account_id: 'account-b' },
    'account-a',
  );
  assert.equal(write.status, 200);
  assert.equal(write.body.profile.account_id, 'account-a');
  assert.deepEqual(
    calls.map((call) => call.slice(0, 2)),
    [['get', 'account-a'], ['put', 'account-a']],
  );
});
