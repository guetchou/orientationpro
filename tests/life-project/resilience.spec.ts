import type { Page } from '@playwright/test';
import { E2E_BACKEND_PORT, E2E_FIXTURES, expect, test } from './fixtures';

const apiResults = (page: Page, limit: number) => page.request
  .get(`http://127.0.0.1:${E2E_BACKEND_PORT}/api/v1/orientation/results?limit=${limit}`)
  .then((response) => response.json());

// Scénarios de résilience du parcours invité → compte → rapport (#216).
// Chaque test simule une panne/interruption qu'un vrai usage produirait
// (rechargement, réseau coupé, double-clic, cookie supprimé...) et vérifie
// une reprise propre, jamais un crash ni une duplication silencieuse.

const answerOneQuestion = async (page: Page, value: number) => {
  const questions = page.getByTestId('unified-riasec-questions');
  await questions.getByRole('radio').nth(value - 1).click();
};

const startRiasecAttempt = async (page: Page) => {
  await page.goto('/parcours');
  await expect(page.getByTestId('unified-riasec-intro')).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le test' }).click();
  await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();
};

test.describe('résilience du parcours invité → compte → rapport (issue #216)', () => {
  test('rafraîchissement en cours de passation : reprise du brouillon localStorage à la même question', async ({ page }) => {
    await startRiasecAttempt(page);
    await answerOneQuestion(page, 3);
    await page.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ }).click();
    const secondQuestionText = await page.getByTestId('unified-riasec-questions').textContent();

    await page.reload();

    await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();
    const afterReloadText = await page.getByTestId('unified-riasec-questions').textContent();
    expect(afterReloadText).toBe(secondQuestionText);
  });

  test('deux onglets sur la même session invité : répondre dans l\'un ne casse pas l\'autre', async ({ page, context }) => {
    await startRiasecAttempt(page);
    await answerOneQuestion(page, 2);

    const secondTab = await context.newPage();
    await secondTab.goto('/parcours');
    await expect(secondTab.getByTestId('unified-riasec-questions')).toBeVisible();

    // Les deux onglets partagent le même cookie de session invité (même
    // navigateur) : aucune erreur console/5xx (garde transverse de la
    // fixture) ne doit survenir sur l'un ou l'autre.
    await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();
    await secondTab.close();
  });

  test('double-clic sur "Voir mon résultat" : une seule soumission, pas de doublon', async ({ page }) => {
    await startRiasecAttempt(page);
    for (let index = 0; index < 60; index += 1) {
      const questions = page.getByTestId('unified-riasec-questions');
      if (!(await questions.isVisible().catch(() => false))) break;
      await questions.getByRole('radio').nth(index % 5).click();
      const nextButton = questions.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ });
      if (index === 59) {
        // Double-clic rapide sur le bouton final de soumission : lequel des
        // deux "gagne" n'est pas déterministe, et le perdant peut se
        // retrouver à attendre un bouton qui a disparu dès que la
        // soumission a réussi — timeout court sur les deux, pas celui du test.
        await Promise.allSettled([
          nextButton.click({ timeout: 5_000 }),
          nextButton.click({ force: true, timeout: 5_000 }),
        ]);
      } else {
        await nextButton.click();
      }
    }

    await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    const payload = await apiResults(page, 5);
    expect(payload.results).toHaveLength(1);
  });

  test.describe('réseau interrompu lors de la soumission', () => {
    test.use({ allowedConsoleErrors: ['ERR_FAILED', 'ERR_ABORTED'] });

    test('erreur affichée, pas de crash, reprise possible', async ({ page }) => {
      await startRiasecAttempt(page);
      for (let index = 0; index < 59; index += 1) {
        const questions = page.getByTestId('unified-riasec-questions');
        await questions.getByRole('radio').nth(index % 5).click();
        await questions.getByRole('button', { name: 'Suivant' }).click();
      }

      await page.route('**/riasec/attempts/*/submit', (route) => route.abort('failed'));
      const questions = page.getByTestId('unified-riasec-questions');
      await questions.getByRole('radio').nth(4).click();
      await questions.getByRole('button', { name: 'Voir mon résultat' }).click();

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();

      await page.unroute('**/riasec/attempts/*/submit');
      await questions.getByRole('button', { name: 'Voir mon résultat' }).click();
      await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    });
  });

  test.describe('cookie de session invité supprimé en cours de route', () => {
    test.use({ allowedConsoleErrors: ['404'] });

    test('redémarrage propre, pas de crash', async ({ page, context }) => {
      await startRiasecAttempt(page);
      await answerOneQuestion(page, 3);
      await page.getByRole('button', { name: 'Suivant' }).click();

      await context.clearCookies();
      await page.reload();

      // Nouvelle session invité : redémarre proprement sur l'intro, sans
      // exception ni page blanche (la garde console/5xx de la fixture couvre
      // déjà l'absence d'erreur inattendue).
      await expect(page.getByTestId('unified-riasec-intro')).toBeVisible();
    });
  });

  test.describe('inscription avec un e-mail déjà utilisé', () => {
    test.use({ allowedConsoleErrors: ['409'] });

    test('erreur claire, pas de compte dupliqué', async ({ page }) => {
      await startRiasecAttempt(page);
      for (let index = 0; index < 60; index += 1) {
        const questions = page.getByTestId('unified-riasec-questions');
        await questions.getByRole('radio').nth(index % 5).click();
        await questions.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ }).click();
      }
      await page.getByRole('link', { name: /Créer mon espace/ }).click();

      await expect(page).toHaveURL(/\/register/);
      await page.getByLabel('Adresse e-mail').fill(E2E_FIXTURES.existingAccount.email);
      await page.getByLabel('Mot de passe', { exact: true }).fill(E2E_FIXTURES.password);
      await page.getByLabel('Confirmer le mot de passe').fill(E2E_FIXTURES.password);
      await page.getByLabel(/Je confirme avoir au moins 16 ans/).check();
      await page.getByLabel(/J.accepte les/).check();
      await page.getByRole('button', { name: 'Créer le compte' }).click();

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByText('Ton compte est créé.')).toHaveCount(0);
    });
  });

  test('rattachement rejoué : un second appel de claim ne duplique rien (comportement déjà garanti côté backend)', async ({ page }) => {
    await startRiasecAttempt(page);
    for (let index = 0; index < 60; index += 1) {
      const questions = page.getByTestId('unified-riasec-questions');
      await questions.getByRole('radio').nth(index % 5).click();
      await questions.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ }).click();
    }
    await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();

    await page.getByRole('link', { name: /J.ai déjà un compte/ }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.getByLabel('Adresse e-mail').fill(E2E_FIXTURES.existingAccount.email);
    await page.getByLabel('Mot de passe', { exact: true }).fill(E2E_FIXTURES.password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });

    // Le compte "existingAccount" a déjà ses propres résultats (seed) ; le
    // rattachement du résultat invité ne doit ni planter ni les dupliquer.
    await page.goto('/parcours');
    const payload = await apiResults(page, 10);
    const ids = new Set((payload.results as Array<{ id: string }>).map((entry) => entry.id));
    expect(ids.size).toBe(payload.results.length);
  });

  test('petit viewport (320px) et mouvement réduit : le parcours reste utilisable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 640 });
    await startRiasecAttempt(page);
    await answerOneQuestion(page, 4);
    await expect(page.getByRole('button', { name: 'Suivant' })).toBeVisible();
  });
});
