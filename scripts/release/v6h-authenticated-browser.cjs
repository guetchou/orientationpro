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

const waitForHeading = async (page, name, level) => {
  await page.getByRole('heading', { name, level, exact: true }).waitFor({ timeout: 60000 });
};

const attachDiagnostics = (page, diagnostics) => {
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 500) {
      diagnostics.serverErrors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });
};

const login = async (page) => {
  await page.goto(`${webUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 });
};

const completeGuestQuestionnaire = async (page) => {
  await page.goto(`${webUrl}/parcours`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForHeading(page, 'Construis ton projet d’avenir', 1);
  const intro = page.locator('[data-testid="unified-riasec-intro"]');
  await intro.waitFor({ timeout: 60000 });
  const introText = await intro.innerText();
  if (!introText.includes('60')) throw new Error('The public instrument does not announce 60 affirmations.');
  await page.getByRole('button', { name: 'Commencer le test' }).click();

  for (let index = 0; index < 60; index += 1) {
    await waitForHeading(page, `Affirmation ${index + 1}`, 2);
    const answers = page.getByRole('radio');
    if (await answers.count() < 2) throw new Error(`No response scale on affirmation ${index + 1}.`);
    await answers.last().click();
    if (index === 59) {
      await page.getByRole('button', { name: 'Voir mon résultat' }).click();
    } else {
      await page.getByRole('button', { name: 'Suivant' }).click();
    }
  }

  const guestPreview = page.locator('[data-testid="guest-life-project-soft-gate"]');
  const registrationGate = page.locator('[data-testid="guest-registration-gate"]');
  await guestPreview.waitFor({ timeout: 60000 });
  await registrationGate.waitFor({ timeout: 60000 });

  const guestText = await guestPreview.innerText();
  for (const expected of [
    'Une première tendance se dégage',
    'Tes autres tendances',
    'Les familles de métiers à explorer',
    'Tes prochaines actions personnelles',
  ]) {
    if (!guestText.includes(expected)) throw new Error(`Guest preview is missing: ${expected}.`);
  }
  if (await guestPreview.getByRole('link').count() !== 0) {
    throw new Error('The guest preview still exposes a direct navigation link.');
  }
  if (await page.locator('[data-testid="authenticated-career-value"]').count() !== 0) {
    throw new Error('Authenticated career value is visible before login.');
  }

  return {
    guestPreviewVisible: true,
    lockedSectionsVisible: true,
    guestCareerLinkCount: 0,
  };
};

const claimGuestResultThroughLogin = async (page) => {
  await page.getByRole('link', { name: 'J’ai déjà un compte' }).click();
  await page.waitForURL(/\/login/, { timeout: 60000 });
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  try {
    await page.waitForURL(/\/parcours(?:$|[?#])/, { timeout: 60000 });
  } catch {
    await page.goto(`${webUrl}/parcours`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.locator('[data-testid="unified-riasec-summary"]').waitFor({ timeout: 60000 });
  await page.locator('[data-testid="authenticated-career-value"]').waitFor({ timeout: 60000 });
  if (await page.locator('[data-testid="guest-registration-gate"]').count() !== 0) {
    throw new Error('The registration gate is still visible after authentication.');
  }
};

const fillDiagnosticAndGenerate = async (page) => {
  await waitForHeading(page, 'Donne les informations utiles pour affiner ton projet', 2);
  await page.getByLabel('Ce que tu veux faire maintenant').selectOption('studies');
  await page.getByLabel('Ville ou zone').fill('Brazzaville');
  await page.getByLabel('Situation actuelle').fill('Bachelier en recherche d’orientation pour la rentrée');
  await page.getByLabel('Niveau d’études').fill('Baccalauréat');
  await page.getByLabel('Diplôme principal').fill('Baccalauréat scientifique obtenu');
  await page.getByLabel('Mobilité possible').selectOption('local');
  await page.getByLabel('Budget maximum en FCFA').fill('350000');
  await page.getByLabel('Durée maximale envisagée en mois').fill('48');
  await page.getByLabel('Dans combien de mois as-tu besoin d’un revenu ?').fill('36');
  await page.getByLabel('Autres centres d’intérêt').fill('numérique, informatique, communication, création');
  await page.getByLabel('Compétences que tu maîtrises déjà').fill('logique, communication, organisation');
  await page.getByLabel('Expériences utiles').fill('Aide numérique informelle, projet scolaire avec tableur');
  await page.getByLabel('Contraintes importantes').fill('Transport local, budget limité, besoin d’informations vérifiables');

  const projectResponsePromise = page.waitForResponse((response) => {
    const pathname = new URL(response.url()).pathname;
    return response.request().method() === 'POST' && pathname.endsWith('/v1/life-projects');
  }, { timeout: 60000 });
  const recommendationResponsePromise = page.waitForResponse((response) => {
    const pathname = new URL(response.url()).pathname;
    return response.request().method() === 'POST' && pathname.endsWith('/recommendations');
  }, { timeout: 60000 });

  await page.getByRole('button', { name: 'Préparer mes pistes' }).click();
  const projectResponse = await projectResponsePromise;
  const projectPayload = await projectResponse.json();
  if (projectResponse.status() !== 201 || !projectPayload?.project?.id) {
    throw new Error(`Project creation failed with HTTP ${projectResponse.status()}.`);
  }
  const recommendationResponse = await recommendationResponsePromise;
  if (recommendationResponse.status() !== 200) {
    throw new Error(`Recommendation generation failed with HTTP ${recommendationResponse.status()}.`);
  }

  await waitForHeading(page, 'Tes pistes à comparer', 2);
  const selectionButtons = page.getByRole('button', { name: 'Approfondir cette piste' });
  const scenarioCount = await selectionButtons.count();
  if (scenarioCount < 3 || scenarioCount > 5) {
    throw new Error(`Expected 3 to 5 scenario cards, received ${scenarioCount}.`);
  }

  const pageText = await page.locator('main').innerText();
  const durationCostVisible = /mois|FCFA|Durée et coût à confirmer/u.test(pageText);
  const calendarVisible = /Calendrier/u.test(pageText);
  const modalitiesVisible = /Modalités|présentiel|à distance|en ligne/u.test(pageText);
  const firstActionVisible = pageText.includes('Premières actions possibles');

  await selectionButtons.first().click();
  await page.getByRole('button', { name: 'Piste enregistrée' }).waitFor({ timeout: 60000 });
  await waitForHeading(page, 'Ta prochaine étape', 3);

  return {
    projectId: projectPayload.project.id,
    scenarioCount,
    durationCostVisible,
    calendarVisible,
    modalitiesVisible,
    firstActionVisible,
    provisionalChoiceVisible: true,
  };
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const diagnostics = { consoleErrors: [], pageErrors: [], serverErrors: [] };
  let firstContext;
  let secondContext;

  try {
    firstContext = await browser.newContext({
      locale: 'fr-FR',
      viewport: { width: 1440, height: 1100 },
      serviceWorkers: 'block',
    });
    const firstPage = await firstContext.newPage();
    attachDiagnostics(firstPage, diagnostics);

    const guestEvidence = await completeGuestQuestionnaire(firstPage);
    await claimGuestResultThroughLogin(firstPage);
    const projectEvidence = await fillDiagnosticAndGenerate(firstPage);

    await firstPage.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await pageReadyAfterAuthentication(firstPage);
    await firstPage.getByRole('button', { name: 'Piste enregistrée' }).waitFor({ timeout: 60000 });
    const persistenceAfterReload = true;

    await firstContext.close();
    firstContext = null;

    secondContext = await browser.newContext({
      locale: 'fr-FR',
      viewport: { width: 1440, height: 1100 },
      serviceWorkers: 'block',
    });
    const secondPage = await secondContext.newPage();
    attachDiagnostics(secondPage, diagnostics);
    await login(secondPage);
    await secondPage.goto(`${webUrl}/parcours`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await pageReadyAfterAuthentication(secondPage);
    await secondPage.getByRole('button', { name: 'Piste enregistrée' }).waitFor({ timeout: 60000 });

    const printButtonCount = await secondPage.getByRole('button', { name: /Imprimer|Télécharger.*PDF/u }).count();
    const synthesisSectionCount = await secondPage.locator('#life-project-summary').count();
    const printableSynthesisVisible = printButtonCount > 0 && synthesisSectionCount > 0;

    await secondPage.screenshot({ path: screenshotPath, fullPage: true });
    await secondPage.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    const evidence = {
      currentUrl: secondPage.url(),
      ...guestEvidence,
      claimedAfterLogin: true,
      authenticatedResultVisible: true,
      ...projectEvidence,
      persistenceAfterReload,
      persistenceAfterRelogin: true,
      comparisonComplete: projectEvidence.durationCostVisible && projectEvidence.calendarVisible && projectEvidence.modalitiesVisible,
      printableSynthesisVisible,
      consoleErrorCount: diagnostics.consoleErrors.length,
      pageErrorCount: diagnostics.pageErrors.length,
      serverErrorCount: diagnostics.serverErrors.length,
      consoleErrors: diagnostics.consoleErrors.slice(0, 10),
      pageErrors: diagnostics.pageErrors.slice(0, 10),
      serverErrors: diagnostics.serverErrors.slice(0, 10),
      screenshotCreated: fs.existsSync(screenshotPath),
      pdfCreated: fs.existsSync(pdfPath),
    };
    fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { mode: 0o600 });
    process.stdout.write(`${JSON.stringify(evidence)}\n`);

    if (diagnostics.consoleErrors.length > 0) {
      throw new Error(`Browser console errors: ${diagnostics.consoleErrors.join(' | ')}`);
    }
    if (diagnostics.pageErrors.length > 0) {
      throw new Error(`Browser page errors: ${diagnostics.pageErrors.join(' | ')}`);
    }
    if (diagnostics.serverErrors.length > 0) {
      throw new Error(`HTTP 5xx responses: ${diagnostics.serverErrors.join(' | ')}`);
    }
  } finally {
    if (firstContext) await firstContext.close();
    if (secondContext) await secondContext.close();
    await browser.close();
  }
};

const pageReadyAfterAuthentication = async (page) => {
  await page.locator('[data-testid="unified-riasec-summary"]').waitFor({ timeout: 60000 });
  await page.locator('[data-testid="authenticated-career-value"]').waitFor({ timeout: 60000 });
  await waitForHeading(page, 'Donne les informations utiles pour affiner ton projet', 2);
};

main().catch((error) => {
  process.stderr.write(`V6-H browser recipe failed: ${error.message}\n`);
  process.exitCode = 1;
});
