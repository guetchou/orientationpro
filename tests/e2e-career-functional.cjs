const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const { createAuthRouter } = require('../backend/src/auth-v1');
const { createSessionAuthenticator } = require('../backend/src/auth-v1/authenticate');
const { createMySqlAuthStore } = require('../backend/src/auth-v1/mysql-store');
const { createPermissionChecker } = require('../backend/src/auth-v1/permissions');
const { createDatabasePool } = require('../backend/src/db/pool');
const { migrateUp } = require('../backend/src/db/migrate');
const { createCareerRouter } = require('../backend/src/career/router');
const { createCareerStore } = require('../backend/src/career/store');
const { createRiasecRouter } = require('../backend/src/orientation/riasec/router');
const { createRiasecStore } = require('../backend/src/orientation/riasec/store');
const { instrument } = require('../backend/src/orientation/riasec/instrument');
const { importOnetCatalog } = require('../backend/scripts/import-onet-catalog');
const { seedRiasecInstrument } = require('../backend/scripts/seed-riasec');

const projectRoot = path.resolve(__dirname, '..');
const backendRoot = path.join(projectRoot, 'backend');
const migrationsDirectory = path.join(backendRoot, 'migrations');
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const JWT_SECRET = 'makoki-functional-e2e-jwt-secret-2026-at-least-32-characters';

const requiredEnvironment = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'ONET_CACHE_DIR'];

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const reservePort = () => new Promise((resolve, reject) => {
  const server = http.createServer();
  server.unref();
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const listen = (server, port = 0) => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', () => {
    server.off('error', reject);
    resolve(server.address());
  });
});

const closeServer = (server) => new Promise((resolve) => {
  if (!server?.listening) return resolve();
  server.closeAllConnections?.();
  server.close(() => resolve());
});

const runCommand = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: projectRoot,
    env: { ...process.env, ...options.env },
    stdio: options.stdio || 'inherit',
  });
  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (code === 0) return resolve();
    reject(new Error(`${command} ${args.join(' ')} failed with code ${code} signal ${signal || 'none'}`));
  });
});

const waitForServer = async (url, processHandle, timeoutMs = 30_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null) {
      throw new Error(`Preview exited before becoming ready (code ${processHandle.exitCode})`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await wait(250);
  }
  throw new Error(`Preview did not answer within ${timeoutMs}ms: ${url}`);
};

const parsePayload = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const apiRequest = async (baseUrl, pathname, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined) headers.set('content-type', 'application/json');
  if (options.token) headers.set('authorization', `Bearer ${options.token}`);

  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = await parsePayload(response);
  const expected = Array.isArray(options.expectedStatus)
    ? options.expectedStatus
    : [options.expectedStatus || 200];
  if (!expected.includes(response.status)) {
    throw new Error(
      `${options.method || 'GET'} ${pathname} returned ${response.status}: ${JSON.stringify(payload)}`,
    );
  }
  return { response, payload };
};

const storedUser = (account) => ({
  id: account.id,
  email: account.email,
  status: account.status,
  roles: account.roles,
  role: account.roles?.[0] || 'user',
  full_name: account.email.split('@')[0],
  is_super_admin: account.roles?.includes('super_admin') || false,
  is_master_admin: account.roles?.includes('master_admin') || false,
});

const waitForText = (page, text, timeout = 20_000) => page.waitForFunction(
  (expected) => document.body?.innerText.includes(expected),
  { timeout },
  text,
);

const setBrowserSession = async (page, webBaseUrl, session) => {
  await page.goto(webBaseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ accessToken, account }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('userToken', accessToken);
    localStorage.setItem('userData', JSON.stringify(account));
    localStorage.setItem('userRole', account.role);
  }, {
    accessToken: session.accessToken,
    account: storedUser(session.account),
  });
};

const createTestApplication = ({ pool, allowedOrigin, verificationTokens }) => {
  const store = createMySqlAuthStore(pool);
  const authenticate = createSessionAuthenticator({ store, jwtSecret: JWT_SECRET });
  const hasPermission = createPermissionChecker(pool);
  const app = express();

  app.use(cors({ origin: allowedOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1/auth', createAuthRouter({
    store,
    jwtSecret: JWT_SECRET,
    cookieSecure: false,
    email: {
      sendVerification: async ({ email, token }) => {
        verificationTokens.set(email, token);
      },
      sendPasswordReset: async () => undefined,
    },
  }));
  app.use('/api/v1/orientation', createRiasecRouter({
    store: createRiasecStore(pool),
    authenticate,
    hasPermission,
    allowDraft: true,
  }));
  app.use('/api/v1/career', createCareerRouter({
    store: createCareerStore(pool),
    authenticate,
    hasPermission,
  }));
  app.get('/api/test/health', (req, res) => res.status(200).json({ status: 'ok' }));
  app.use((error, req, res, next) => {
    console.error('Functional E2E API error:', error);
    res.status(500).json({ error: { code: 'FUNCTIONAL_E2E_ERROR', message: error.message } });
  });

  return app;
};

const registerVerifyLogin = async ({ apiBaseUrl, verificationTokens, email, password }) => {
  await apiRequest(apiBaseUrl, '/api/v1/auth/register', {
    method: 'POST',
    body: { email, password },
    expectedStatus: 201,
  });
  const token = verificationTokens.get(email);
  assert.ok(token, `Verification token was not captured for ${email}`);
  await apiRequest(apiBaseUrl, '/api/v1/auth/verify-email', {
    method: 'POST',
    body: { token },
    expectedStatus: 200,
  });
  const { payload } = await apiRequest(apiBaseUrl, '/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
    expectedStatus: 200,
  });
  assert.equal(payload.account.status, 'active');
  assert.deepEqual(payload.account.roles, ['user']);
  return payload;
};

const createRiasecResult = async ({ apiBaseUrl, session }) => {
  const { payload: attemptPayload } = await apiRequest(apiBaseUrl, '/api/v1/orientation/riasec/attempts', {
    method: 'POST',
    token: session.accessToken,
    expectedStatus: 201,
  });
  assert.equal(attemptPayload.instrument.itemCount, 60);

  const sourceItems = new Map(instrument.items.map((item) => [item.id, item]));
  const target = { R: 5, I: 5, A: 4, S: 2, E: 2, C: 1 };
  const responses = attemptPayload.instrument.items.map((publicItem) => {
    const source = sourceItems.get(publicItem.id);
    assert.ok(source, `Unknown RIASEC item ${publicItem.id}`);
    const preferred = target[source.dimension];
    return {
      itemId: publicItem.id,
      value: source.reverseScored ? 6 - preferred : preferred,
    };
  });

  const { payload: completion } = await apiRequest(
    apiBaseUrl,
    `/api/v1/orientation/riasec/attempts/${encodeURIComponent(attemptPayload.attempt.id)}/submit`,
    {
      method: 'POST',
      token: session.accessToken,
      body: { responses },
      expectedStatus: 201,
    },
  );
  assert.equal(completion.status, 'completed');
  assert.ok(completion.result.id);
  return completion.result;
};

const main = async () => {
  for (const name of requiredEnvironment) {
    assert.ok(process.env[name], `${name} is required for the career functional E2E test`);
  }

  const webPort = await reservePort();
  const webBaseUrl = `http://127.0.0.1:${webPort}`;
  const verificationTokens = new Map();
  const pool = createDatabasePool(process.env);
  let apiServer;
  let preview;
  let browser;

  try {
    await migrateUp(pool, migrationsDirectory);
    const seedResult = await seedRiasecInstrument(pool);
    assert.equal(seedResult.itemCount, 60);

    const importResult = await importOnetCatalog({
      ...process.env,
      ONET_VERSION: '30.3',
      ONET_MIN_OCCUPATIONS: '1000',
      ONET_MIN_DIRECT_PROFILES: '900',
      ONET_FORCE_IPV4: 'true',
      ALLOW_SOURCE_REPLACE: 'false',
    });
    assert.equal(importResult.occupationCount, 1016);
    assert.equal(importResult.directProfileCount, 923);

    const app = createTestApplication({ pool, allowedOrigin: webBaseUrl, verificationTokens });
    apiServer = http.createServer(app);
    const apiAddress = await listen(apiServer);
    const apiBaseUrl = `http://127.0.0.1:${apiAddress.port}`;

    await runCommand('npm', ['run', 'build'], {
      env: { VITE_API_URL: `${apiBaseUrl}/api` },
    });

    preview = spawn(
      process.execPath,
      [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(webPort), '--strictPort'],
      { cwd: projectRoot, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
    preview.stderr.on('data', (chunk) => process.stderr.write(chunk));
    await waitForServer(webBaseUrl, preview);

    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const password = 'correct horse battery staple';
    const primary = await registerVerifyLogin({
      apiBaseUrl,
      verificationTokens,
      email: `career-primary-${suffix}@example.test`,
      password,
    });
    const result = await createRiasecResult({ apiBaseUrl, session: primary });

    const { payload: summary } = await apiRequest(apiBaseUrl, '/api/v1/career/catalog/summary', {
      token: primary.accessToken,
    });
    assert.equal(summary.sources[0].occupationCount, 1016);
    assert.equal(summary.sources[0].matchableCount, 923);

    const { payload: ranking } = await apiRequest(
      apiBaseUrl,
      `/api/v1/career/matches/${encodeURIComponent(result.id)}?locale=en&limit=50`,
      { token: primary.accessToken },
    );
    assert.equal(ranking.matching.eligibleOccupationCount, 923);
    assert.equal(ranking.matching.matches.length, 50);
    assert.ok(ranking.matching.matches[0].fitScore >= ranking.matching.matches[49].fitScore);

    const { payload: profileRanking } = await apiRequest(
      apiBaseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}?locale=en&limit=50`,
      { token: primary.accessToken },
    );
    assert.equal(profileRanking.matching.eligibleOccupationCount, 923);
    assert.equal(profileRanking.matching.matches.length, 50);
    assert.deepEqual(profileRanking.recommendationContext.usedSignals, ['riasec']);
    assert.ok(profileRanking.recommendationContext.missingSignals.includes('profile'));
    assert.equal(profileRanking.matching.matches[0].recommendationScore, profileRanking.matching.matches[0].fitScore);

    const firstOccupationId = ranking.matching.matches[0].occupationId;
    const { payload: occupationPayload } = await apiRequest(
      apiBaseUrl,
      `/api/v1/career/occupations/${encodeURIComponent(firstOccupationId)}`,
      { token: primary.accessToken },
    );
    assert.equal(occupationPayload.occupation.source.version, '30.3');
    assert.match(occupationPayload.occupation.source.licenseName, /Creative Commons Attribution 4\.0/i);

    const { payload: searchPayload } = await apiRequest(
      apiBaseUrl,
      '/api/v1/career/occupations?q=nurse&locale=en&riasecOnly=true&limit=20&offset=0',
      { token: primary.accessToken },
    );
    assert.ok(searchPayload.occupations.length > 0);

    const secondary = await registerVerifyLogin({
      apiBaseUrl,
      verificationTokens,
      email: `career-secondary-${suffix}@example.test`,
      password,
    });
    const isolation = await apiRequest(
      apiBaseUrl,
      `/api/v1/career/matches/${encodeURIComponent(result.id)}?locale=en&limit=6`,
      { token: secondary.accessToken, expectedStatus: 404 },
    );
    assert.equal(isolation.payload.error.code, 'ORIENTATION_RESULT_NOT_FOUND');
    const profileIsolation = await apiRequest(
      apiBaseUrl,
      `/api/v1/career/recommendations/${encodeURIComponent(result.id)}?locale=en&limit=6`,
      { token: secondary.accessToken, expectedStatus: 404 },
    );
    assert.equal(profileIsolation.payload.error.code, 'ORIENTATION_RESULT_NOT_FOUND');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await setBrowserSession(page, webBaseUrl, primary);
    await page.goto(`${webBaseUrl}/orientation/results/${encodeURIComponent(result.id)}`, {
      waitUntil: 'networkidle0',
    });
    await waitForText(page, 'Métiers à explorer selon ton profil');
    await waitForText(page, 'Signaux utilisés');
    await waitForText(page, '923 métiers');
    const recommendationCount = await page.$$eval(
      'section[aria-labelledby="career-recommendations-title"] a[href^="/careers/"]',
      (links) => links.length,
    );
    assert.equal(recommendationCount, 6);

    await page.goto(`${webBaseUrl}/orientation/results/${encodeURIComponent(result.id)}/careers`, {
      waitUntil: 'networkidle0',
    });
    await waitForText(page, 'Classement expliqué des métiers');
    await waitForText(page, '923 métiers classables');
    const rankingLinks = await page.$$eval('a[href^="/careers/"]', (links) => links.map((link) => link.getAttribute('href')));
    assert.equal(rankingLinks.length, 50);
    assert.ok(rankingLinks[0]);

    await page.goto(`${webBaseUrl}${rankingLinks[0]}`, { waitUntil: 'networkidle0' });
    await waitForText(page, 'Profil RIASEC du métier');
    await waitForText(page, 'Source et licence');
    await waitForText(page, 'O*NET 30.3 Database');
    await waitForText(page, 'Creative Commons Attribution 4.0 International');

    await page.goto(`${webBaseUrl}/careers`, { waitUntil: 'networkidle0' });
    await waitForText(page, 'Explorer les métiers');
    await waitForText(page, '1016 métiers');
    await waitForText(page, '923 profils RIASEC');
    await page.type('#career-search', 'nurse');
    await page.keyboard.press('Enter');
    await waitForText(page, 'pour « nurse »');
    const catalogLinks = await page.$$eval('a[href^="/careers/"]', (links) => links.length);
    assert.ok(catalogLinks > 0);
    await page.click('input[type="checkbox"]');
    await page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked === true);
    assert.equal(await page.$eval('input[type="checkbox"]', (input) => input.checked), true);

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(`${webBaseUrl}/orientation/results/${encodeURIComponent(result.id)}`, {
      waitUntil: 'networkidle0',
    });
    await waitForText(page, 'Métiers à explorer selon ton profil');
    const mobileMetrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    assert.ok(
      mobileMetrics.scrollWidth <= mobileMetrics.clientWidth + 2,
      `Mobile horizontal overflow: ${JSON.stringify(mobileMetrics)}`,
    );

    await setBrowserSession(page, webBaseUrl, secondary);
    await page.goto(`${webBaseUrl}/orientation/results/${encodeURIComponent(result.id)}`, {
      waitUntil: 'networkidle0',
    });
    await waitForText(page, 'Résultat indisponible');

    assert.deepEqual(pageErrors, []);

    console.log(JSON.stringify({
      status: 'passed',
      resultId: result.id,
      resultCode: result.displayCode,
      occupationCount: summary.sources[0].occupationCount,
      matchableCount: summary.sources[0].matchableCount,
      rankedCount: ranking.matching.matches.length,
      profileRankedCount: profileRanking.matching.matches.length,
      recommendationCount,
      catalogSearchCount: searchPayload.occupations.length,
      isolatedAccountAccess: '404 ORIENTATION_RESULT_NOT_FOUND',
      mobileViewport: mobileMetrics,
    }, null, 2));
    console.log('CAREER FUNCTIONAL E2E PASSED');
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview && preview.exitCode === null) {
      preview.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => preview.once('exit', resolve)),
        wait(3000),
      ]);
      if (preview.exitCode === null) preview.kill('SIGKILL');
    }
    await closeServer(apiServer);
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
