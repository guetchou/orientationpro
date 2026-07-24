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

async function assertStaticAsset(baseUrl, pathname, expectedFragment) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
  const body = await response.text();
  if (expectedFragment && !body.includes(expectedFragment)) {
    throw new Error(`${pathname} does not include ${expectedFragment}`);
  }
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
    await assertStaticAsset(baseUrl, '/manifest.json', 'MAKOKI');
    await assertStaticAsset(baseUrl, '/robots.txt', 'https://makoki.org/sitemap.xml');
    await assertStaticAsset(baseUrl, '/sitemap.xml', 'https://makoki.org/');
    await assertStaticAsset(baseUrl, '/favicon.svg', 'data:image/png;base64');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const routes = [
      '/',
      '/login',
      '/register',
      '/tests',
      '/jobs',
      '/recruitment',
      '/book-appointment',
      '/blog',
      '/about',
      '/privacy',
      '/terms',
      '/cookies',
    ];

    const forbiddenPublicClaims = [
      'OrientationPro',
      'Orientation Pro Congo',
      '15,000+',
      '15k+',
      '500+ offres',
      '95% Satisfaction',
      '98%',
      'Première Plateforme',
      'Méthode reconnue et récompensée',
      'Plateforme Certifiée',
      'support@orientationpro.cg',
      '+242 06 123',
      'Dr. Marie Kimboula',
      'Prof. Jean Makaya',
      'Mme. Sarah Nzouba',
    ];

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
      for (const claim of forbiddenPublicClaims) {
        if (bodyText.includes(claim)) {
          throw new Error(`${route} exposes forbidden public content: ${claim}`);
        }
      }

      const title = await page.title();
      if (!title.includes('MAKOKI')) {
        throw new Error(`${route} has an unexpected title: ${title}`);
      }
      const canonical = await page.$eval('link[rel="canonical"]', (link) => link.href);
      const expectedCanonical = `https://makoki.org${route === '/' ? '/' : route}`;
      if (canonical !== expectedCanonical) {
        throw new Error(`${route} canonical mismatch: ${canonical} != ${expectedCanonical}`);
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
