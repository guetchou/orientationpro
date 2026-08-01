import { expect, test, type Page } from '@playwright/test';
import { E2E_FIXTURES } from './fixtures';

const login = async (page: Page, email: string) => {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(E2E_FIXTURES.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
};

let candidateAApplicationUrl = '';

test.describe.serial('parcours candidat ATS — issue #198', () => {
  test('connexion → offre publiée → candidature → confirmation → doublon proactif → historique → retrait → persistance', async ({ page }) => {
    await login(page, E2E_FIXTURES.candidateA.email);

    await page.goto('/offres');
    await expect(page.getByRole('heading', { name: 'Offres publiées' })).toBeVisible();
    await page.getByRole('link', { name: E2E_FIXTURES.jobTitle }).click();

    await expect(page.getByRole('heading', { name: E2E_FIXTURES.jobTitle })).toBeVisible();
    await expect(page.getByLabel(/Postuler sans lier/)).toBeChecked();
    await page.getByRole('button', { name: 'Envoyer ma candidature' }).click();

    await expect(page).toHaveURL(/\/mes-candidatures\/.+/);
    await expect(page.getByRole('heading', { name: 'Candidature envoyée' })).toBeVisible();
    candidateAApplicationUrl = page.url();

    // Revenir sur l'offre : le doublon est géré proactivement, pas par une erreur brute.
    await page.goto('/offres');
    await page.getByRole('link', { name: E2E_FIXTURES.jobTitle }).click();
    await expect(page.getByText('Vous avez déjà déposé une candidature pour cette offre.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Envoyer ma candidature' })).toHaveCount(0);

    await page.goto('/mes-candidatures');
    await expect(page.getByRole('heading', { name: 'Mes candidatures' })).toBeVisible();
    await expect(page.getByText(E2E_FIXTURES.jobTitle)).toBeVisible();
    await expect(page.getByText('Candidature envoyée')).toBeVisible();

    await page.getByText(E2E_FIXTURES.jobTitle).click();
    await expect(page.getByText('Historique')).toBeVisible();

    await page.getByRole('button', { name: 'Retirer ma candidature' }).click();
    await expect(page.getByText('Confirmez-vous le retrait')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmer le retrait' }).click();

    await expect(page.getByRole('heading', { name: 'Candidature retirée' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retirer ma candidature' })).toHaveCount(0);

    // Reprise après rafraîchissement : l'état retiré est bien persisté côté serveur.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Candidature retirée' })).toBeVisible();
  });

  test("accès croisé : un candidat ne peut pas voir la candidature d'un autre, sans fuite d'information", async ({ page }) => {
    test.skip(!candidateAApplicationUrl, 'dépend du test précédent');
    await login(page, E2E_FIXTURES.candidateB.email);

    const applicationPath = new URL(candidateAApplicationUrl).pathname;
    await page.goto(applicationPath);

    await expect(page.getByRole('alert')).toBeVisible();
    const alertText = await page.getByRole('alert').textContent();
    expect(alertText).not.toMatch(/e2e-candidate-a|Comptable \(E2E\)/);
  });

  test('accessibilité clavier : le formulaire de candidature est utilisable sans souris', async ({ page }) => {
    await login(page, E2E_FIXTURES.candidateB.email);
    await page.goto('/offres');
    await page.getByRole('link', { name: E2E_FIXTURES.jobTitle }).click();

    await page.getByLabel(/Postuler sans lier/).focus();
    await expect(page.getByLabel(/Postuler sans lier/)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Envoyer ma candidature' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/mes-candidatures\/.+/);
    await expect(page.getByRole('heading', { name: 'Candidature envoyée' })).toBeVisible();
  });

  test('responsive : /offres et /mes-candidatures tiennent sur un viewport 320px sans débordement horizontal', async ({ page }) => {
    await login(page, E2E_FIXTURES.candidateA.email);
    await page.setViewportSize({ width: 320, height: 640 });

    for (const path of ['/offres', '/mes-candidatures']) {
      await page.goto(path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(overflow, `débordement horizontal sur ${path}`).toBe(false);
    }
  });
});
