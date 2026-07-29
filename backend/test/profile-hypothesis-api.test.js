'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { createProfileRouter } = require('../src/profile/router');

const request = (port, accountId) => new Promise((resolve, reject) => {
  const req = http.request({ hostname: '127.0.0.1', port, method: 'POST', path: '/api/v1/profile/hypotheses/generate', headers: { 'x-test-account': accountId } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
  });
  req.on('error', reject);
  req.end();
});

test('hypothesis generation uses only the authenticated account', async (t) => {
  const calls = [];
  const store = {
    async generateHypotheses(accountId) {
      calls.push(accountId);
      return { profile: { account_id: accountId }, education: [], skills: [], hypotheses: [], hypothesisGeneration: { generatorVersion: 'profile-hypotheses-v1' } };
    },
  };
  const authenticate = (req, res, next) => { req.auth = { account: { id: req.headers['x-test-account'] } }; next(); };
  const app = express();
  app.use('/api/v1/profile', createProfileRouter({ store, authenticate }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await request(server.address().port, 'account-a');
  assert.equal(response.status, 200);
  assert.equal(response.body.profile.account_id, 'account-a');
  assert.deepEqual(calls, ['account-a']);
});
