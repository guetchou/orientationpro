'use strict';

const { performance } = require('node:perf_hooks');

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const apiRoot = required('V5G_API_ROOT').replace(/\/+$/u, '');
if (!/^http:\/\/127\.0\.0\.1:\d+\/api$/u.test(apiRoot)) {
  throw new Error('V5G_API_ROOT must target an isolated localhost API');
}

const percentile = (values, ratio) => {
  const sorted = [...values].sort((left, right) => left - right);
  return Math.round(sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] || 0);
};

const request = async (path, { token, method = 'GET', body } = {}) => {
  const started = performance.now();
  const response = await fetch(`${apiRoot}${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => null);
  return {
    status: response.status,
    payload,
    latencyMs: performance.now() - started,
  };
};

const login = async (email, password) => {
  const response = await request('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (response.status !== 200 || !response.payload?.accessToken) {
    throw new Error(`Authentication failed with status ${response.status}`);
  }
  return response.payload.accessToken;
};

const runPool = async (operations, concurrency) => {
  let cursor = 0;
  const results = [];
  const worker = async () => {
    while (cursor < operations.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await operations[index]();
      } catch (error) {
        results[index] = {
          status: 0,
          latencyMs: 10_000,
          errorCode: error?.name || 'Error',
        };
      }
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(concurrency, operations.length) },
    () => worker(),
  ));
  return results;
};

const summarize = (results, concurrency) => {
  const latencies = results.map((entry) => entry.latencyMs);
  const failures = results.filter((entry) => entry.status < 200 || entry.status >= 300).length;
  return {
    concurrency,
    requests: results.length,
    failures,
    errorRate: Number((failures / results.length).toFixed(4)),
    p50Ms: percentile(latencies, 0.5),
    p95Ms: percentile(latencies, 0.95),
    p99Ms: percentile(latencies, 0.99),
  };
};

const main = async () => {
  const password = required('V5G_TEST_PASSWORD');
  const accounts = [
    {
      email: required('V5G_ACCOUNT_A_EMAIL'),
      token: await login(required('V5G_ACCOUNT_A_EMAIL'), password),
      projects: [],
    },
    {
      email: required('V5G_ACCOUNT_B_EMAIL'),
      token: await login(required('V5G_ACCOUNT_B_EMAIL'), password),
      projects: [],
    },
  ];
  const stages = [];
  for (const concurrency of [1, 5, 10, 20]) {
    const operations = [];
    for (let index = 0; index < 40; index += 1) {
      const account = accounts[Math.floor(index / 2) % accounts.length];
      if (index % 2 === 0) {
        operations.push(async () => {
          const result = await request('/v1/life-projects', {
            token: account.token,
            method: 'POST',
            body: {
              title: `Charge contrôlée ${concurrency}-${index}`,
              purpose: 'Donnée synthétique de test de charge jetable.',
              missingInformation: ['Contrôle de charge'],
              uncertainty: { level: 'high', reasons: ['Environnement jetable'] },
            },
          });
          if (result.status === 201 && result.payload?.project?.id) {
            account.projects.push(result.payload.project.id);
          }
          return result;
        });
      } else {
        operations.push(() => request('/v1/life-projects', { token: account.token }));
      }
    }
    stages.push(summarize(await runPool(operations, concurrency), concurrency));
  }

  if (!accounts[0].projects[0] || !accounts[1].projects[0]) {
    throw new Error('The controlled load did not create projects for both accounts');
  }
  const crossAccount = await request(
    `/v1/life-projects/${encodeURIComponent(accounts[0].projects[0])}`,
    { token: accounts[1].token },
  );
  const ownRead = await request(
    `/v1/life-projects/${encodeURIComponent(accounts[0].projects[0])}`,
    { token: accounts[0].token },
  );
  const baseline = stages[0];
  const peak = stages.at(-1);
  const saturation = {
    reached: peak.errorRate > 0.01 || peak.p95Ms > Math.max(1000, baseline.p95Ms * 4),
    criterion: 'errorRate > 1% OR p95 > max(1000ms, 4x baseline p95)',
    baselineP95Ms: baseline.p95Ms,
    peakP95Ms: peak.p95Ms,
  };
  const result = {
    schemaVersion: 'makoki.v5g-business-load.v1',
    generatedAt: new Date().toISOString(),
    gitSha: required('V5G_GIT_SHA'),
    environment: {
      api: 'localhost-isolated',
      database: 'mysql-8-tmpfs',
      authentication: 'jwt-session-real',
    },
    operationMix: '50% authenticated MySQL writes, 50% authenticated MySQL reads',
    stages,
    isolation: {
      ownReadStatus: ownRead.status,
      crossAccountReadStatus: crossAccount.status,
      passed: ownRead.status === 200 && crossAccount.status === 404,
    },
    saturation,
    thresholds: {
      maximumErrorRate: 0.01,
      maximumP95Ms: 1000,
      isolationRequired: true,
    },
    limitations: [
      'localhost only',
      'synthetic disposable records',
      'not production traffic',
      'not evidence of user impact',
    ],
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (stages.some((stage) => stage.errorRate > 0.01 || stage.p95Ms > 1000)
    || !result.isolation.passed) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  process.stderr.write(`V5-G business load failed: ${error.message}\n`);
  process.exitCode = 1;
});
