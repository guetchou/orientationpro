const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const puppeteer = require('puppeteer');

const projectRoot = path.resolve(__dirname, '..');

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, process, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Vite preview exited with code ${process.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview did not answer within ${timeoutMs}ms`);
}

async function main() {
  const port = await reservePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const preview = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: projectRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );

  let previewOutput = '';
  preview.stdout.on('data', (chunk) => { previewOutput += chunk; });
  preview.stderr.on('data', (chunk) => { previewOutput += chunk; });

  let browser;
  try {
    await waitForServer(baseUrl, preview);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const routes = ['/', '/login', '/tests', '/about', '/privacy', '/terms', '/cookies'];
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' });
      if (!response || response.status() !== 200) {
        throw new Error(`${route} returned ${response?.status() ?? 'no response'}`);
      }
      await page.waitForSelector('#root');
      const bodyText = await page.$eval('body', (body) => body.innerText);
      if (!bodyText.includes('MAKOKI')) {
        throw new Error(`${route} does not expose the MAKOKI brand`);
      }
    }

    const title = await page.title();
    if (!title.includes('MAKOKI')) {
      throw new Error(`Unexpected document title: ${title}`);
    }

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    const homeText = await page.$eval('body', (body) => body.innerText);
    const forbiddenPublicClaims = [
      'OrientationPro',
      '15,000+',
      '500+ offres',
      '95% Satisfaction',
      'Première Plateforme',
      'Méthode reconnue et récompensée',
    ];
    for (const claim of forbiddenPublicClaims) {
      if (homeText.includes(claim)) {
        throw new Error(`Forbidden public claim still visible: ${claim}`);
      }
    }

    if (pageErrors.length > 0) {
      throw new Error(`Browser page errors: ${pageErrors.join(' | ')}`);
    }

    console.log(`E2E public smoke passed on ephemeral port ${port}: ${routes.join(', ')}`);
  } catch (error) {
    if (previewOutput) process.stderr.write(previewOutput);
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
