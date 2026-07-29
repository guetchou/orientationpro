'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('node:http');
const { createProfileSynthesisRouter } = require('../src/profile/synthesis-router');

const request = (port, method, path, body, accountId) => new Promise((resolve, reject) => {
  const payload = body === undefined ? null : JSON.stringify(body);
  const req = http.request({
    hostname: '127.0.0.1', port, method, path,
    headers: {
      'x-test-account': accountId,
      ...(payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {}),
    },
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
  });
  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

test('profile synthesis ownership always comes from the authenticated account', async (t) => {
  const calls = [];
  const store = {
    async create(input) { calls.push(['create', input]); return { created: true, snapshot: { id: 'snapshot-1' }, synthesis: {} }; },
    async list(accountId, limit) { calls.push(['list', accountId, limit]); return []; },
    async get(accountId, synthesisId) { calls.push(['get', accountId, synthesisId]); return accountId === 'account-a' ? { snapshot: { id: synthesisId }, synthesis: {} } : null; },
  };
  const authenticate = (req, res, next) => { req.auth = { account: { id: req.headers['x-test-account'] } }; next(); };
  const app = express();
  app.use(express.json());
  app.use('/api/v1/profile/syntheses', createProfileSynthesisRouter({ store, authenticate }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const port = server.address().port;

  const created = await request(port, 'POST', '/api/v1/profile/syntheses', {
    accountId: 'account-b',
    orientationResultId: '11111111-1111-4111-8111-111111111111',
    recommendationSnapshotId: '22222222-2222-4222-8222-222222222222',
  }, 'account-a');
  assert.equal(created.status, 201);
  assert.equal(calls[0][1].accountId, 'account-a');

  const listed = await request(port, 'GET', '/api/v1/profile/syntheses?limit=8', undefined, 'account-a');
  assert.equal(listed.status, 200);
  assert.deepEqual(calls[1], ['list', 'account-a', '8']);

  const read = await request(port, 'GET', '/api/v1/profile/syntheses/snapshot-1', undefined, 'account-a');
  assert.equal(read.status, 200);
  assert.deepEqual(calls[2], ['get', 'account-a', 'snapshot-1']);
});
