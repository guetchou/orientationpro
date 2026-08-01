import { expect, test, type Page } from '@playwright/test';
import { E2E_FIXTURES } from './fixtures';

// Les comptes recruteur/manager n'ont pas le rôle "user" : /dashboard (derrière
// UserRoute) les rebondit vers /unauthorized après une connexion pourtant
// réussie. On attend seulement la sortie de /login, puis chaque test navigue
// explicitement vers la page recruteur voulue (gardée par ATS_RECRUITER_ROLES).
const login = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(E2E_FIXTURES.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10_000 });
};

const selectOption = async (page: Page, labelText: string, optionName: string) => {
  await page.getByLabel(labelText).click();
  await page.getByRole('option', { name: optionName, exact: true }).click();
};

let jobAPipelineUrl = '';
let applicationAReviewUrl = '';

test.describe.serial('parcours recruteur ATS — issue #199 (isolation organisation)', () => {
  test('manager A ne voit que les offres de son organisation', async ({ page }) => {
    await login(page, E2E_FIXTURES.managerA.email);
    await page.goto('/recruteur/ats/offres');
    await expect(page.getByRole('heading', { name: 'Offres' })).toBeVisible();
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleA })).toBeVisible();
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleB })).toHaveCount(0);

    await page.getByRole('link', { name: E2E_FIXTURES.jobTitleA }).click();
    await expect(page).toHaveURL(/\/recruteur\/ats\/offres\/.+\/pipeline/);
    jobAPipelineUrl = page.url();
    await expect(page.getByText('Candidature reçue')).toBeVisible();
  });

  test('un recruteur non affecté ne voit pas l’offre de son organisation', async ({ page }) => {
    await login(page, E2E_FIXTURES.recruiterA2.email);
    await page.goto('/recruteur/ats/offres');
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleA })).toHaveCount(0);
  });

  test('manager A affecte un recruteur à l’offre', async ({ page }) => {
    await login(page, E2E_FIXTURES.managerA.email);
    await page.goto('/recruteur/ats/offres');
    await page.getByRole('link', { name: 'Équipe' }).first().click();
    await expect(page).toHaveURL(/\/equipe/);

    // Recherche l'account_id du recruteur A1 via une requête directe n'est pas
    // possible côté navigateur : l'E2E utilise l'email comme identifiant n'est
    // pas supporté par le formulaire (il attend un account id) — ce test
    // affecte donc recruiterA1 via son identifiant réel, connu du seed.
    const accountIdInput = page.getByLabel(/identifiant du compte recruteur/i);
    await accountIdInput.fill(E2E_FIXTURES.recruiterA1.accountId);
    await page.getByRole('button', { name: /^affecter$/i }).click();
    await expect(page.getByText(E2E_FIXTURES.recruiterA1.accountId)).toBeVisible();
  });

  test('le recruteur affecté voit désormais l’offre et peut ouvrir la candidature', async ({ page }) => {
    await login(page, E2E_FIXTURES.recruiterA1.email);
    await page.goto('/recruteur/ats/offres');
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleA })).toBeVisible();

    await page.goto(new URL(jobAPipelineUrl).pathname);
    await page.getByText('Candidature reçue').click();
    await expect(page).toHaveURL(/\/recruteur\/ats\/candidatures\/.+/);
    applicationAReviewUrl = page.url();
  });

  test('le recruteur affecté évalue puis rejette la candidature avec un motif', async ({ page }) => {
    await login(page, E2E_FIXTURES.recruiterA1.email);
    await page.goto(new URL(applicationAReviewUrl).pathname);

    await expect(page.getByRole('heading', { name: 'Évaluation interne' })).toBeVisible();
    await selectOption(page, 'Recommandation', 'Faire avancer');
    await page.getByLabel(/note interne/i).fill('Bon entretien technique, à confirmer en équipe.');
    await page.getByRole('button', { name: /enregistrer l.évaluation/i }).click();
    await expect(page.getByText('Bon entretien technique, à confirmer en équipe.')).toBeVisible();

    // La candidature "reçue" ne peut avancer que vers "en cours d'examen" — le
    // graphe d'états réel (backend/src/ats-v1/workflow.js) ne permet pas de
    // rejeter directement depuis "submitted".
    await selectOption(page, 'Nouvel état', "En cours d'examen");
    await page.getByRole('button', { name: 'Appliquer' }).click();
    await expect(page.getByRole('heading', { name: "En cours d'examen" })).toBeVisible();

    await selectOption(page, 'Nouvel état', 'Candidature rejetée');
    await selectOption(page, 'Motif de rejet', 'Profil non qualifié');
    await page.getByLabel(/détail \(visible en interne/i).fill('Compétences techniques insuffisantes pour ce poste.');
    await page.getByRole('button', { name: 'Appliquer' }).click();

    await expect(page.getByRole('heading', { name: 'Candidature rejetée' })).toBeVisible();
    await expect(page.getByText(/Profil non qualifié/)).toBeVisible();
  });

  test('manager B ne voit que les offres de son organisation, aucune trace de l’organisation A', async ({ page }) => {
    await login(page, E2E_FIXTURES.managerB.email);
    await page.goto('/recruteur/ats/offres');
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleB })).toBeVisible();
    await expect(page.getByRole('link', { name: E2E_FIXTURES.jobTitleA })).toHaveCount(0);
  });

  test('manager B ne peut pas accéder à la candidature ni au pipeline de l’organisation A par navigation directe', async ({ page }) => {
    await login(page, E2E_FIXTURES.managerB.email);

    await page.goto(new URL(applicationAReviewUrl).pathname);
    await expect(page.getByRole('alert')).toBeVisible();
    let alertText = await page.getByRole('alert').textContent();
    expect(alertText).not.toMatch(/organisation|Organisation A|Compétences techniques/);

    await page.goto(new URL(jobAPipelineUrl).pathname);
    await expect(page.getByRole('alert')).toBeVisible();
    alertText = await page.getByRole('alert').textContent();
    expect(alertText).not.toMatch(/organisation|Organisation A/);
  });
});
