import { expect, test, type Browser, type Page } from '@playwright/test';

const accountA = process.env.V5G_ACCOUNT_A_EMAIL;
const accountB = process.env.V5G_ACCOUNT_B_EMAIL;
const password = process.env.V5G_TEST_PASSWORD;
const apiRoot = process.env.V5G_API_ROOT;
if (!accountA || !accountB || !password || !apiRoot) {
  throw new Error('V5-G test accounts and password are required');
}

const login = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
};

const isolatedAccountHasNoAccess = async (browser: Browser, projectId: string) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await login(page, accountB);
    await page.goto('/parcours');
    await expect(page.getByTestId('life-project-triage')).toBeVisible();
    const result = await page.evaluate(async ({ id, api }) => {
      const token = localStorage.getItem('userToken');
      const response = await fetch(
        `${api}/v1/life-projects/${encodeURIComponent(id)}`,
        { headers: { authorization: `Bearer ${token}` } },
      );
      return response.status;
    }, { id: projectId, api: apiRoot });
    expect(result).toBe(404);
  } finally {
    await context.close();
  }
};

test('authenticated browser completes the reversible life-project journey', async ({ page, browser }) => {
  await login(page, accountA);
  await page.goto('/parcours');
  await expect(page.getByRole('heading', { name: 'Construire mon projet de vie' })).toBeVisible();

  await page.getByLabel('Ma situation actuelle').selectOption('university');
  await page.getByLabel('Mon besoin principal').selectOption('training');
  await page.getByLabel('Où envisager les possibilités ?').selectOption('compare');
  await page.getByLabel('À quel horizon souhaitez-vous avancer ?').selectOption('months');
  await page.getByLabel('Une précision utile').fill('Preuve fonctionnelle V5-G en environnement jetable.');
  await page.getByRole('button', { name: 'Créer mon premier projet' }).click();
  await expect(page.getByTestId('life-project-shell')).toBeVisible();

  const cached = await page.evaluate(() => localStorage.getItem('makoki.life-project.last-readable.v1'));
  const projectId = JSON.parse(String(cached)).project.id as string;

  await page.getByRole('button', { name: 'Passer à la clarification' }).click();
  await expect(page.getByText('Clarification', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Choisir provisoirement' }).click();
  await expect(page.getByLabel('Scénario choisi')).toBeVisible();

  await page.getByLabel('Nom du plan').fill('Plan V5-G');
  await page.getByLabel('Première action observable').fill('Contacter une structure de test');
  await page.getByRole('button', { name: 'Ajouter cette action' }).click();
  await expect(page.getByText('Contacter une structure de test')).toBeVisible();

  const status = page.getByLabel('Changer le statut');
  const blockedReason = page.getByLabel('Raison du blocage, si nécessaire');
  await status.selectOption('in_progress');
  await expect(page.locator('div').filter({ hasText: /^En cours$/ })).toBeVisible();

  await blockedReason.fill('Dépendance externe indisponible');
  await status.selectOption('blocked');
  await expect(page.locator('div').filter({ hasText: /^Bloquée$/ })).toBeVisible();
  await expect(page.getByText('Dépendance externe indisponible')).toBeVisible();

  await status.selectOption('in_progress');
  await expect(page.locator('div').filter({ hasText: /^En cours$/ })).toBeVisible();

  await page.getByRole('button', { name: 'Demander une réorientation' }).click();
  await expect(page.getByText('Réorientation', { exact: true }).first()).toBeVisible();

  await isolatedAccountHasNoAccess(browser, projectId);
});
