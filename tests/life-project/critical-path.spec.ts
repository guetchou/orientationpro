import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

// Parcours réel : /parcours (UnifiedLifeProjectPage) → questionnaire des centres
// d’intérêt (EmbeddedRiasecStep) → invité (aperçu + porte de compte) →
// inscription → vérification e-mail (attrapeur SMTP local, jamais un envoi réel)
// → connexion → profil complet + familles de métiers + situation en quatre
// étapes (LifeProjectWorkspace) → pistes générées → choix d'une piste →
// comparaison + synthèse imprimable (LifeProjectCompletionPanel) →
// déconnexion/reconnexion → persistance.

const testEmail = `e2e-life-project-critical-${Date.now()}@example.test`;
const testPassword = 'E2eStrongPassw0rd!2026';

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
};

const answerInterestSurvey = async (page: Page) => {
  await expect(page.getByTestId('unified-riasec-intro')).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le questionnaire' }).click();
  await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();

  let index = 0;
  for (; index < 100; index += 1) {
    const questions = page.getByTestId('unified-riasec-questions');
    if (!(await questions.isVisible().catch(() => false))) break;
    const options = questions.getByRole('radio');
    await options.nth(index % 5).click();
    const nextButton = questions.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ });
    await nextButton.click();
  }
};

test.describe.serial('parcours critique — invité → compte → rapport (issue #216)', () => {
  test('invité : répond au questionnaire, voit un aperçu limité et une porte de compte sans option de poursuite anonyme', async ({ page }) => {
    await page.goto('/parcours');
    await answerInterestSurvey(page);

    await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    await expect(page.getByTestId('guest-registration-gate')).toBeVisible();
    await expect(page.getByRole('link', { name: /Créer mon espace/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /J.ai déjà un compte/ })).toBeVisible();
    await expect(page.getByTestId('authenticated-career-value')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-summary')).toHaveCount(0);
  });

  test('création de compte, vérification e-mail, connexion — rattachement du résultat sans repasser le questionnaire', async ({ page }) => {
    await page.goto('/parcours');
    await answerInterestSurvey(page);
    await page.getByRole('link', { name: /Créer mon espace/ }).click();

    await expect(page).toHaveURL(/\/register/);
    await page.getByLabel('Adresse e-mail').fill(testEmail);
    await page.getByLabel('Mot de passe', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirmer le mot de passe').fill(testPassword);
    await page.getByLabel(/Je confirme avoir au moins 16 ans/).check();
    await page.getByLabel(/J.accepte les/).check();
    await page.getByRole('button', { name: 'Créer le compte' }).click();

    await expect(page.getByText('Ton espace est presque prêt.')).toBeVisible({ timeout: 15_000 });

    const { fetchLatestEmail, extractLink } = await import('./mail');
    const { E2E_SMTP_HTTP_PORT } = await import('./fixtures');
    const emailBody = await fetchLatestEmail(E2E_SMTP_HTTP_PORT, testEmail);
    const verifyLink = extractLink(emailBody, '/verify-email');
    const verifyUrl = new URL(verifyLink);

    await page.goto(verifyUrl.pathname + verifyUrl.search);
    await page.getByRole('link', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel('Adresse e-mail').fill(testEmail);
    await page.getByLabel('Mot de passe', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/parcours/, { timeout: 15_000 });
    await expect(page.getByTestId('unified-riasec-intro')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-questions')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
  });

  test('le profil complet, les familles de métiers et la première étape du formulaire sont visibles après connexion', async ({ page }) => {
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
    await expect(page.getByTestId('authenticated-career-value')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ta situation' })).toBeVisible();
    await expect(page.getByText('Étape 1 sur 4')).toBeVisible();
  });

  test('compléter les quatre étapes, générer des pistes, en choisir une — comparaison et synthèse imprimable apparaissent', async ({ page }) => {
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await page.getByLabel('Ville ou zone').fill('Brazzaville');
    await page.getByLabel('Situation actuelle').selectOption({ label: 'Lycéen' });
    await page.getByLabel('Niveau d’études').selectOption({ label: 'Terminale' });
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('heading', { name: 'Tes possibilités' })).toBeVisible();
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('heading', { name: 'Ce que tu apportes' })).toBeVisible();
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByRole('heading', { name: 'Tes priorités' })).toBeVisible();
    await page.getByLabel(/Priorité 1/).selectOption('interest');
    await page.getByRole('button', { name: 'Préparer mes pistes' }).click();

    await expect(page.getByRole('heading', { name: 'Tes pistes à comparer' })).toBeVisible({ timeout: 20_000 });
    const firstOption = page.getByRole('button', { name: 'Choisir cette piste pour la suite' }).first();
    await firstOption.click();
    await expect(page.getByText('Piste retenue').first()).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Comparaison de tes pistes' })).toBeVisible();
    await expect(page.locator('#life-project-summary')).toBeVisible();
    await expect(page.getByRole('button', { name: /Imprimer ou télécharger en PDF/ })).toBeVisible();
  });

  test('déconnexion puis reconnexion dans un nouveau contexte — persistance complète du parcours', async ({ page, context }) => {
    await context.clearCookies();
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comparaison de tes pistes' })).toBeVisible();
    await expect(page.locator('#life-project-summary')).toBeVisible();
    await expect(page.getByText('Piste retenue').first()).toBeVisible();
  });
});
