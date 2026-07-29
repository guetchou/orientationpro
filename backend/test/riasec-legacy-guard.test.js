const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');

const {
  hideRetiredRiasec,
  rejectLegacyRiasec,
} = require('../src/orientation/riasec/legacy-guard');

const request = async (app, path, options = {}) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
};

test('historical ATS analyzers reject RIASEC and point to the canonical Auth V1 flow', async () => {
  let delegated = false;
  const app = express();
  app.use(express.json());
  app.post('/legacy', rejectLegacyRiasec, (req, res) => {
    delegated = true;
    res.status(200).json({ success: true });
  });

  const response = await request(app, '/legacy', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ testType: 'RIASEC' }),
  });
  const body = await response.json();

  assert.equal(response.status, 410);
  assert.equal(delegated, false);
  assert.equal(body.error.code, 'LEGACY_RIASEC_RETIRED');
  assert.equal(body.error.canonicalEndpoints.attempts, 'POST /api/v1/orientation/riasec/attempts');
});

test('historical ATS routes remain available for non-RIASEC test types', async () => {
  const app = express();
  app.use(express.json());
  app.post('/legacy', rejectLegacyRiasec, (req, res) => res.status(200).json({ success: true }));

  const response = await request(app, '/legacy', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ testType: 'emotional' }),
  });

  assert.equal(response.status, 200);
});

test('the historical test catalogue no longer advertises a competing RIASEC engine', async () => {
  const app = express();
  app.get('/available', hideRetiredRiasec, (req, res) => res.json({
    success: true,
    data: {
      riasec_professional: { name: 'RIASEC historique' },
      emotional: { name: 'Émotionnel' },
    },
    metadata: { count: 2 },
  }));

  const response = await request(app, '/available');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data, { emotional: { name: 'Émotionnel' } });
  assert.equal(body.metadata.count, 1);
});
