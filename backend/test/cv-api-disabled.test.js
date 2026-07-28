'use strict';

const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const test = require('node:test');

const ANALYSIS_ID =
  '11111111-1111-4111-8111-111111111111';

const ROUTES = [
  {
    method: 'POST',
    path: '/api/v1/cv/analyses',
  },
  {
    method: 'GET',
    path: '/api/v1/cv/analyses',
  },
  {
    method: 'GET',
    path: `/api/v1/cv/analyses/${ANALYSIS_ID}`,
  },
  {
    method: 'GET',
    path:
      `/api/v1/cv/analyses/${ANALYSIS_ID}/report.pdf`,
  },
  {
    method: 'DELETE',
    path: `/api/v1/cv/analyses/${ANALYSIS_ID}`,
  },
];

const reservePort = async () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address.port;

      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });

const waitForServer = async (
  baseUrl,
  child,
  readLogs,
) => {
  const deadline = Date.now() + 10000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Le serveur de test s'est arrêté avant de répondre.\n${readLogs()}`,
      );
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/test/health`,
      );

      if (response.ok) return;
    } catch {
      // Le processus peut être démarré sans encore écouter le port.
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  throw new Error(
    `Le serveur de test n'a pas démarré à temps.\n${readLogs()}`,
  );
};

const stopChild = async (child) => {
  if (child.exitCode !== null) return;

  child.kill('SIGTERM');

  const exited = once(child, 'exit');
  const timeout = new Promise((resolve) => {
    setTimeout(resolve, 3000, 'timeout');
  });

  const result = await Promise.race([
    exited.then(() => 'exit'),
    timeout,
  ]);

  if (result === 'timeout' && child.exitCode === null) {
    child.kill('SIGKILL');
    await once(child, 'exit');
  }
};

test(
  'CV_API_V1_ENABLED=false laisse toutes les routes CV V1 en 404 sans Auth V1 ni MySQL',
  async (t) => {
    const port = await reservePort();
    const backendDirectory = path.resolve(
      __dirname,
      '..',
    );

    let logs = '';

    const child = spawn(
      process.execPath,
      [path.join(backendDirectory, 'src/server.js')],
      {
        cwd: backendDirectory,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          PORT: String(port),
          LEGACY_AUTH_ENABLED: 'false',
          AUTH_V1_ENABLED: 'false',
          RIASEC_API_ENABLED: 'false',
          CAREER_API_ENABLED: 'false',
          CV_API_V1_ENABLED: 'false',
          DB_HOST: '127.0.0.1',
          DB_PORT: '1',
          DB_USER: 'cv-disabled-test',
          DB_PASSWORD: 'not-used',
          DB_NAME: 'not-used',
        },
        stdio: [
          'ignore',
          'pipe',
          'pipe',
        ],
      },
    );

    const collectLogs = (chunk) => {
      logs += chunk.toString('utf8');
    };

    child.stdout.on('data', collectLogs);
    child.stderr.on('data', collectLogs);

    t.after(async () => {
      await stopChild(child);
    });

    const baseUrl = `http://127.0.0.1:${port}`;

    await waitForServer(
      baseUrl,
      child,
      () => logs,
    );

    for (const route of ROUTES) {
      const response = await fetch(
        `${baseUrl}${route.path}`,
        {
          method: route.method,
        },
      );

      const body = await response.json();

      assert.equal(
        response.status,
        404,
        `${route.method} ${route.path}`,
      );
      assert.equal(
        body.message,
        'Route non trouvée',
      );
      assert.equal(body.path, route.path);
      assert.equal(body.method, route.method);
    }

    assert.equal(child.exitCode, null);
    assert.match(
      logs,
      /Authentication v1 enabled: false/u,
    );
    assert.match(
      logs,
      /CV API v1 enabled: false/u,
    );
    assert.doesNotMatch(
      logs,
      /ECONNREFUSED|Access denied|MySQL|SequelizeConnection/u,
    );
  },
);
