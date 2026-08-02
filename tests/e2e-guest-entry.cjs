const net = require('node:net');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');

const reservePort = () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.unref();
  server.on('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});

const waitForServer = async (url, process, timeoutMs = 15_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`Vite preview exited with code ${process.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Vite preview did not become ready.');
};

const assertPublicRoute = async (page, baseUrl, pathname, expectedText) => {
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'networkidle0' });
  const status = response?.status();
  if (status === undefined || status < 200 || status >= 400) {
    throw new Error(`${pathname} returned ${status ?? 'no response'}`);
  }
  await page.waitForSelector('#root');
  const current = new URL(page.url());
  if (current.pathname === '/login') throw new Error(`${pathname} redirected to login`);
  if (current.pathname !== pathname) throw new Error(`${pathname} resolved to ${current.pathname}`);
  const text = await page.$eval('body', (body) => body.innerText);
  if (!text.includes(expectedText)) {
    throw new Error(`${pathname} does not expose expected guest content: ${expectedText}`);
  }
};

async function main() {
  const build = spawnSync(
    process.execPath,
    [path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_LIFE_PROJECT_ENABLED: 'true',
      },
    },
  );
  if (build.status !== 0) {
    throw new Error(`Guest entry build exited with code ${build.status}`);
  }

  const port = await reservePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const preview = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        VITE_LIFE_PROJECT_ENABLED: 'true',
      },
    },
  );
  let output = '';
  preview.stdout.on('data', (chunk) => { output += chunk; });
  preview.stderr.on('data', (chunk) => { output += chunk; });

  let browser;
  try {
    await waitForServer(baseUrl, preview);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    await assertPublicRoute(page, baseUrl, '/parcours', 'Commence ton parcours');
    await assertPublicRoute(page, baseUrl, '/careers', 'Explore les métiers qui t’intéressent');

    await page.goto(`${baseUrl}/tests/riasec`, { waitUntil: 'networkidle0' });
    if (new URL(page.url()).pathname !== '/parcours') {
      throw new Error('Legacy RIASEC route does not converge to /parcours.');
    }

    console.log('Guest entry browser smoke passed: /parcours, /careers, legacy RIASEC redirect.');
  } catch (error) {
    if (output) process.stderr.write(output);
    throw error;
  } finally {
    if (browser) await browser.close();
    preview.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
