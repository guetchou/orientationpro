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

    for (const route of ['/', '/login', '/tests']) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' });
      if (!response || response.status() !== 200) {
        throw new Error(`${route} returned ${response?.status() ?? 'no response'}`);
      }
      await page.waitForSelector('#root');
    }

    if (pageErrors.length > 0) {
      throw new Error(`Browser page errors: ${pageErrors.join(' | ')}`);
    }

    console.log(`E2E smoke passed on ephemeral port ${port}: /, /login, /tests`);
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
