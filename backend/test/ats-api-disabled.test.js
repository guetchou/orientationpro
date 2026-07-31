'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const test = require('node:test');

const JOB_ID = '22222222-2222-4222-8222-222222222222';
const APPLICATION_ID = '33333333-3333-4333-8333-333333333333';
const ACCOUNT_ID = '44444444-4444-4444-8444-444444444444';

const ROUTES = [
  { method: 'POST', path: '/api/v1/ats/jobs' },
  { method: 'GET', path: '/api/v1/ats/jobs' },
  { method: 'GET', path: `/api/v1/ats/jobs/${JOB_ID}` },
  { method: 'POST', path: `/api/v1/ats/jobs/${JOB_ID}/publish` },
  { method: 'POST', path: `/api/v1/ats/jobs/${JOB_ID}/close` },
  { method: 'POST', path: `/api/v1/ats/jobs/${JOB_ID}/applications` },
  { method: 'POST', path: `/api/v1/ats/jobs/${JOB_ID}/recruiters` },
  { method: 'DELETE', path: `/api/v1/ats/jobs/${JOB_ID}/recruiters/${ACCOUNT_ID}` },
  { method: 'GET', path: '/api/v1/ats/my/applications' },
  { method: 'GET', path: `/api/v1/ats/applications/${APPLICATION_ID}` },
  { method: 'GET', path: `/api/v1/ats/applications/${APPLICATION_ID}/history` },
  { method: 'POST', path: `/api/v1/ats/applications/${APPLICATION_ID}/transitions` },
];

const reservePort = async () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close((error) => (error ? reject(error) : resolve(port)));
  });
});

const waitForServer = async (baseUrl, child, readLogs) => {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Le serveur de test s'est arrêté avant de répondre.\n${readLogs()}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/test/health`);
      if (response.ok) return;
    } catch {
      // Le processus peut être démarré sans encore écouter le port.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Le serveur de test n'a pas démarré à temps.\n${readLogs()}`);
};

const stopChild = async (child) => {
  if (child.exitCode !== null) return;
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(resolve, 3000, 'timeout');
    timeoutId.unref();
  });
  const result = await Promise.race([exited.then(() => 'exit'), timeout]);
  clearTimeout(timeoutId);
  if (result === 'timeout' && child.exitCode === null) {
    const forcedExit = once(child, 'exit');
    child.kill('SIGKILL');
    await forcedExit;
  }
};

test('ATS_WORKFLOW_V1_ENABLED=false leaves all ATS V1 routes at 404 without Auth V1 nor MySQL', async (t) => {
  const port = await reservePort();
  const backendDirectory = path.resolve(__dirname, '..');
  let logs = '';

  const child = spawn(process.execPath, [path.join(backendDirectory, 'src/server.js')], {
    cwd: backendDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      LEGACY_AUTH_ENABLED: 'false',
      LEGACY_API_ENABLED: 'false',
      AUTH_V1_ENABLED: 'false',
      RIASEC_API_ENABLED: 'false',
      CAREER_API_ENABLED: 'false',
      CV_API_V1_ENABLED: 'false',
      LIFE_PROJECT_API_ENABLED: 'false',
      DATA_RIGHTS_API_ENABLED: 'false',
      ATS_WORKFLOW_V1_ENABLED: 'false',
      DB_HOST: '127.0.0.1',
      DB_PORT: '1',
      DB_USER: 'ats-disabled-test',
      DB_PASSWORD: 'not-used',
      DB_NAME: 'not-used',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const collectLogs = (chunk) => { logs += chunk.toString('utf8'); };
  child.stdout.on('data', collectLogs);
  child.stderr.on('data', collectLogs);

  t.after(async () => { await stopChild(child); });

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl, child, () => logs);

  for (const route of ROUTES) {
    const response = await fetch(`${baseUrl}${route.path}`, { method: route.method });
    const body = await response.json();
    assert.equal(response.status, 404, `${route.method} ${route.path}`);
    assert.equal(body.message, 'Route non trouvée');
    assert.equal(body.path, route.path);
    assert.equal(body.method, route.method);
  }

  assert.equal(child.exitCode, null);
  assert.match(logs, /"event":"server\.started"/u);
  assert.doesNotMatch(logs, /ECONNREFUSED|Access denied|MySQL|SequelizeConnection/u);
});

test('ATS_WORKFLOW_V1_ENABLED=true without AUTH_V1_ENABLED fails fast at startup instead of exposing routes', async (t) => {
  const port = await reservePort();
  const backendDirectory = path.resolve(__dirname, '..');
  let logs = '';

  const child = spawn(process.execPath, [path.join(backendDirectory, 'src/server.js')], {
    cwd: backendDirectory,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      LEGACY_AUTH_ENABLED: 'false',
      LEGACY_API_ENABLED: 'false',
      AUTH_V1_ENABLED: 'false',
      ATS_WORKFLOW_V1_ENABLED: 'true',
      DB_HOST: '127.0.0.1',
      DB_PORT: '1',
      DB_USER: 'ats-disabled-test',
      DB_PASSWORD: 'not-used',
      DB_NAME: 'not-used',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const collectLogs = (chunk) => { logs += chunk.toString('utf8'); };
  child.stdout.on('data', collectLogs);
  child.stderr.on('data', collectLogs);

  t.after(async () => { await stopChild(child); });

  const exited = await once(child, 'exit');
  assert.notEqual(exited[0], 0, `expected a non-zero exit code, got ${exited[0]}\n${logs}`);
  // Fails fast at the capabilities registry's dependency check (mounted before the ATS
  // router block), consistent with every other AUTH_V1_ENABLED-dependent flag — the
  // explicit guard in server.js is defense-in-depth for the same invariant.
  assert.match(logs, /ATS_WORKFLOW_V1_ENABLED requires AUTH_V1_ENABLED/u);
  assert.doesNotMatch(logs, /"event":"server\.started"/u);
});
