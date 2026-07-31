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

async function clickButtonByText(page, text) {
  const clicked = await page.evaluate((label) => {
    const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.trim() === label);
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!clicked) throw new Error(`Button not found: ${text}`);
}

async function clickButtonByTextIfPresent(page, text) {
  return page.evaluate((label) => {
    const button = [...document.querySelectorAll('button')].find((element) => element.textContent?.trim() === label);
    if (!button) return false;
    button.click();
    return true;
  }, text);
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
    await assertStaticAsset(baseUrl, '/sitemap.xml', 'https://makoki.org/legal');
    await assertStaticAsset(baseUrl, '/favicon.svg', 'data:image/png;base64');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[role="dialog"][aria-label="Gestion des cookies"]');
    const storageBeforeChoice = await page.evaluate(() => ({
      consent: localStorage.getItem('makoki_consent_v1'),
      analytics: localStorage.getItem('analytics_queue'),
      googleScript: Boolean(document.getElementById('makoki-google-analytics')),
      metaScript: Boolean(document.getElementById('makoki-meta-pixel')),
    }));
    if (storageBeforeChoice.consent || storageBeforeChoice.analytics || storageBeforeChoice.googleScript || storageBeforeChoice.metaScript) {
      throw new Error(`Non-essential tracking exists before consent: ${JSON.stringify(storageBeforeChoice)}`);
    }

    await clickButtonByText(page, 'Tout refuser');
    await page.waitForFunction(() => !document.querySelector('[role="dialog"][aria-label="Gestion des cookies"]'));
    const deniedConsent = await page.evaluate(() => JSON.parse(localStorage.getItem('makoki_consent_v1') || 'null'));
    if (!deniedConsent || deniedConsent.analytics || deniedConsent.marketing || deniedConsent.support) {
      throw new Error(`Invalid denied consent: ${JSON.stringify(deniedConsent)}`);
    }

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
      '/legal',
      '/privacy',
      '/terms',
      '/cookies',
    ];
    const canonicalPathByRoute = new Map([
      ['/tests', '/parcours'],
    ]);

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
      const status = response?.status();
      if (status === undefined || status < 200 || status >= 400) {
        throw new Error(`${route} returned ${status ?? 'no response'}`);
      }
      await page.waitForSelector('#root');
      const bodyText = await page.$eval('body', (body) => body.innerText);
      const brandInAltText = await page.evaluate(() =>
        Array.from(document.images).some((img) => (img.alt || '').includes('MAKOKI')),
      );
      if (!bodyText.includes('MAKOKI') && !brandInAltText) {
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
      const canonicalPath = canonicalPathByRoute.get(route) || route;
      const expectedCanonical = `https://makoki.org${canonicalPath === '/' ? '/' : canonicalPath}`;
      if (canonical !== expectedCanonical) {
        throw new Error(`${route} canonical mismatch: ${canonical} != ${expectedCanonical}`);
      }
    }

    const analyticsAfterDeniedNavigation = await page.evaluate(() => localStorage.getItem('analytics_queue'));
    if (analyticsAfterDeniedNavigation) {
      throw new Error('Local analytics were stored after consent was denied');
    }

    await page.goto(`${baseUrl}/legal`, { waitUntil: 'networkidle0' });
    const legalText = await page.$eval('body', (body) => body.innerText);
    for (const expected of ['Nexora', 'NGUIE Gess', 'contact@makoki.org', '+242 05 534 42 53', 'OVH SAS', 'Spaceship, Inc.']) {
      if (!legalText.includes(expected)) throw new Error(`/legal is missing ${expected}`);
    }

    await page.goto(`${baseUrl}/privacy`, { waitUntil: 'networkidle0' });
    const privacyText = await page.$eval('body', (body) => body.innerText);
    for (const expected of ['24 mois d’inactivité', '12 mois après la production du résultat', '10 ans', 'rgpd@makoki.org']) {
      if (!privacyText.includes(expected)) throw new Error(`/privacy is missing ${expected}`);
    }

    await page.goto(`${baseUrl}/register`, { waitUntil: 'networkidle0' });
    const registerText = await page.$eval('body', (body) => body.innerText);
    if (!registerText.includes('Je confirme avoir au moins 16 ans.')) {
      throw new Error('/register no longer exposes the required age confirmation');
    }
    if (registerText.includes('14–15 ans')) {
      throw new Error('/register still exposes the removed minor-consent banner');
    }

    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await clickButtonByText(page, 'Gérer mes cookies');
    await page.waitForSelector('[role="dialog"][aria-label="Gestion des cookies"]');

    let checkboxes = await page.$$('input[type="checkbox"]');
    if (checkboxes.length < 3) {
      const openedCustomization = await clickButtonByTextIfPresent(page, 'Personnaliser');
      if (!openedCustomization) {
        throw new Error('Consent dialog exposes neither categories nor a customization action');
      }
      await page.waitForFunction(() => document.querySelectorAll('input[type="checkbox"]').length >= 3);
      checkboxes = await page.$$('input[type="checkbox"]');
    }

    if (checkboxes.length < 3) throw new Error('Consent customization does not expose the expected categories');
    await checkboxes[0].click();
    await clickButtonByText(page, 'Enregistrer mes choix');
    const customizedConsent = await page.evaluate(() => JSON.parse(localStorage.getItem('makoki_consent_v1') || 'null'));
    if (!customizedConsent?.analytics || customizedConsent.marketing || customizedConsent.support) {
      throw new Error(`Invalid customized consent: ${JSON.stringify(customizedConsent)}`);
    }

    if (pageErrors.length > 0) {
      throw new Error(`Browser page errors: ${pageErrors.join(' | ')}`);
    }

    console.log(`E2E public smoke passed on ephemeral port ${port}: ${routes.join(', ')}, consent lifecycle`);
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
