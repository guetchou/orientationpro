'use strict';

const fs = require('node:fs');
const { chromium } = require('@playwright/test');

const webUrl = process.env.V6H_WEB_URL || 'https://makoki.org';
const email = process.env.V6H_RECIPE_EMAIL;
const password = process.env.V6H_RECIPE_PASSWORD;
const outputPath = process.env.V6H_BROWSER_OUTPUT || '/tmp/v6h-browser-evidence.json';
const screenshotPath = process.env.V6H_SCREENSHOT_PATH || '/tmp/v6h-authenticated-parcours.png';
const pdfPath = process.env.V6H_PDF_PATH || '/tmp/v6h-authenticated-synthesis.pdf';

if (!email || !password) {
  process.stderr.write('V6H_RECIPE_EMAIL and V6H_RECIPE_PASSWORD are required.\n');
  process.exit(2);
}

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'fr-FR',
    viewport: { width: 1440, height: 1100 },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  let consoleErrors = [];
  let pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    await page.goto(`${webUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByLabel('Adresse e-mail').fill(email);
    await page.getByLabel('Mot de passe').fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 });

    consoleErrors = [];
    pageErrors = [];
    await page.goto(`${webUrl}/parcours`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('heading', { level: 1, name: 'Espace de séance conseiller' }).waitFor({ timeout: 60000 });
    await page.getByRole('heading', { level: 2, name: '2. Options recommandées' }).waitFor({ timeout: 60000 });
    await page.getByRole('heading', { level: 2, name: '3. Comparaison' }).waitFor({ timeout: 60000 });
    await page.getByRole('heading', { level: 2, name: '4. Synthèse remise au jeune' }).waitFor({ timeout: 60000 });

    const scenarioCards = page.locator('[data-testid^="advisor-option-"]');
    const scenarioCount = await scenarioCards.count();
    if (scenarioCount < 3 || scenarioCount > 5) {
      throw new Error(`Expected 3 to 5 option cards, received ${scenarioCount}.`);
    }

    const table = page.getByRole('table');
    for (const heading of ['Option', 'Adéquation', 'Confiance', 'Durée', 'Coût', 'Calendrier', 'Accès / mobilité']) {
      await table.getByRole('columnheader', { name: heading }).waitFor();
    }

    const selectButtons = page.getByRole('button', { name: 'Retenir provisoirement cette option' });
    if (await selectButtons.count() === 0) {
      throw new Error('No provisional selection action is available.');
    }
    await selectButtons.first().click();
    await page.getByRole('button', { name: 'Choix provisoire enregistré' }).waitFor({ timeout: 60000 });
    await page.getByText('Le choix est enregistré comme provisoire, pas comme décision définitive.').waitFor({ timeout: 60000 });

    const summary = page.locator('#life-project-summary');
    await summary.scrollIntoViewIfNeeded();
    const summaryText = await summary.innerText();
    if (!summaryText.includes('Choix provisoire') || !summaryText.includes('Action sous sept jours')) {
      throw new Error('The final synthesis is missing the provisional choice or seven-day action.');
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${consoleErrors.join(' | ')}`);
    }
    if (pageErrors.length > 0) {
      throw new Error(`Browser page errors: ${pageErrors.join(' | ')}`);
    }

    const selectedButton = page.getByRole('button', { name: 'Choix provisoire enregistré' });
    const selectedCard = selectedButton.locator('xpath=ancestor::*[@data-testid][1]');
    const selectedCardText = await selectedCard.innerText();

    const evidence = {
      currentUrl: page.url(),
      h1: await page.getByRole('heading', { level: 1 }).innerText(),
      scenarioCount,
      comparisonColumns: ['Option', 'Adéquation', 'Confiance', 'Durée', 'Coût', 'Calendrier', 'Accès / mobilité'],
      provisionalChoiceVisible: true,
      synthesisVisible: true,
      selectedCardSummary: selectedCardText.slice(0, 500),
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      screenshotCreated: fs.existsSync(screenshotPath),
      pdfCreated: fs.existsSync(pdfPath),
    };
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
    process.stdout.write(`${JSON.stringify(evidence)}\n`);
  } finally {
    await context.close();
    await browser.close();
  }
};

main().catch((error) => {
  process.stderr.write(`V6-H browser recipe failed: ${error.message}\n`);
  process.exitCode = 1;
});
