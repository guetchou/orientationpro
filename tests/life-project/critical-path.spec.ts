import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

// Parcours réel : /parcours (UnifiedLifeProjectPage) → RIASEC (EmbeddedRiasecStep)
// → invité (aperçu + porte de compte) → inscription → vérification e-mail
// (attrapeur SMTP local, jamais un envoi réel) → connexion → profil complet +
// familles de métiers + situation (formulaire unique, LifeProjectWorkspace) →
// pistes générées → choix d'une piste → comparaison + synthèse imprimable
// (LifeProjectCompletionPanel) → déconnexion/reconnexion → persistance.
//
// Compte de test créé dynamiquement (email horodaté), jamais de donnée réelle
// de jeune. Aucune assertion sur le score RIASEC exact ici : c'est le rôle de
// riasec-oracles.spec.ts. Ce fichier vérifie uniquement que le parcours se
// déroule de bout en bout sans rupture, sans duplication et avec persistance
// réelle après reconnexion.

const testEmail = `e2e-life-project-critical-${Date.now()}@example.test`;
const testPassword = 'E2eStrongPassw0rd!2026';

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  // Attendre la fin réelle de la connexion (redirection hors de /login) avant
  // de naviguer ailleurs, sinon page.goto() peut interrompre la requête de
  // connexion en vol et /parcours se charge alors sans session.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
};

const answerRiasecSurvey = async (page: Page) => {
  await expect(page.getByTestId('unified-riasec-intro')).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le test' }).click();
  await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();

  let index = 0;
  // Boucle jusqu'à disparition du questionnaire (dernière question soumise) ;
  // l'ordre des items est mélangé par tentative, donc on ne peut pas se fier
  // à un nombre fixe d'itérations ni à l'identité des affirmations.
  // Cycler sur les 5 positions de réponse évite un profil dégénéré (score
  // identique sur les 6 dimensions) sans avoir besoin de connaître la
  // dimension de chaque item.
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
  test('invité : répond au RIASEC, voit un aperçu limité et une porte de compte sans option de poursuite anonyme', async ({ page }) => {
    await page.goto('/parcours');
    await answerRiasecSurvey(page);

    await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    await expect(page.getByTestId('guest-registration-gate')).toBeVisible();
    await expect(page.getByRole('link', { name: /Créer mon espace/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /J.ai déjà un compte/ })).toBeVisible();

    // Le résultat complet (toutes tendances, familles de métiers) n'est pas
    // affiché à l'invité — seul l'aperçu limité l'est.
    await expect(page.getByTestId('authenticated-career-value')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-summary')).toHaveCount(0);
  });

  test('création de compte, vérification e-mail, connexion — rattachement du résultat sans repasser le test', async ({ page }) => {
    await page.goto('/parcours');
    await answerRiasecSurvey(page);
    await page.getByRole('link', { name: /Créer mon espace/ }).click();

    await expect(page).toHaveURL(/\/register/);
    await page.getByLabel('Adresse e-mail').fill(testEmail);
    await page.getByLabel('Mot de passe', { exact: true }).fill(testPassword);
    await page.getByLabel('Confirmer le mot de passe').fill(testPassword);
    await page.getByLabel(/Je confirme avoir au moins 16 ans/).check();
    await page.getByLabel(/J.accepte les/).check();
    await page.getByRole('button', { name: 'Créer le compte' }).click();

    await expect(page.getByText('Ton compte est créé.')).toBeVisible({ timeout: 15_000 });

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
    // Rattachement réussi = le résultat s'affiche directement, sans repasser
    // par l'intro/le questionnaire RIASEC.
    await expect(page.getByTestId('unified-riasec-intro')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-questions')).toHaveCount(0);
    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
  });

  test('le profil complet, les familles de métiers et le formulaire de situation sont visibles après connexion', async ({ page }) => {
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
    await expect(page.getByTestId('authenticated-career-value')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Donne les informations utiles pour affiner ton projet' })).toBeVisible();
  });

  test('remplir la situation, générer des pistes, en choisir une — comparaison et synthèse imprimable apparaissent', async ({ page }) => {
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await page.getByLabel('Ville ou zone').fill('Brazzaville');
    await page.getByLabel('Situation actuelle').fill('Étudiant en dernière année de lycée');
    await page.getByLabel('Niveau d’études').fill('Terminale');
    await page.getByRole('button', { name: 'Préparer mes pistes' }).click();

    await expect(page.getByRole('heading', { name: 'Tes pistes à comparer' })).toBeVisible({ timeout: 20_000 });
    const firstOption = page.getByRole('button', { name: 'Approfondir cette piste' }).first();
    await firstOption.click();
    await expect(page.getByText('Piste enregistrée')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Comparaison complète de tes pistes' })).toBeVisible();
    await expect(page.locator('#life-project-summary')).toBeVisible();
    await expect(page.getByRole('button', { name: /Imprimer ou télécharger en PDF/ })).toBeVisible();
  });

  test('déconnexion puis reconnexion dans un nouveau contexte — persistance complète du parcours', async ({ page, context }) => {
    await context.clearCookies();
    await login(page, testEmail, testPassword);
    await page.goto('/parcours');

    await expect(page.getByTestId('unified-riasec-summary')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comparaison complète de tes pistes' })).toBeVisible();
    await expect(page.locator('#life-project-summary')).toBeVisible();
    await expect(page.getByText('Piste choisie provisoirement')).toBeVisible();
  });
});
