import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Ce harnais tourne contre `npm run preview` (build statique, aucun backend réel
// derrière /api). Pour atteindre les pages protégées (UserRoute), on simule une
// session valide en interceptant /v1/auth/session — les appels de données plus
// profonds (instrument RIASEC, profil) échouent ensuite faute de backend, ce qui
// est acceptable ici : nos deux pages affichent leur <h1> dans tous les états
// (chargement, erreur, contenu), donc le test reste valide même en état dégradé.
// Une page qui échoue à charger ses données reste néanmoins un état réel que
// l'utilisateur peut rencontrer (coupure réseau, API indisponible) — pas un état
// artificiel inventé pour ce test.
const mockAuthenticatedSession = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('userToken', 'fake-a11y-test-token');
  });
  await page.route('**/api/v1/auth/session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        account: { id: 'a11y-test-account', email: 'a11y-test@example.com', status: 'active', roles: ['user'] },
      }),
    }),
  );
};

test('login exposes labelled controls, keyboard focus and WCAG AA contrast', async ({ page, browserName }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  await expect(page.getByLabel('Adresse e-mail')).toBeVisible();
  await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();

  await page.keyboard.press('Tab');
  const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  expect(firstFocused, `${browserName}: the first keyboard target must be actionable`).toBeTruthy();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('narrow reflow has no bidirectional page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/login');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('disabled parcours route fails closed without exposing authenticated content', async ({ page }) => {
  await page.goto('/parcours');
  await expect(page).toHaveURL(/\/parcours$/);
  await expect(page.getByRole('heading', { name: 'Page non trouvée' })).toBeVisible();
  await expect(page.getByText('Prochaine étape')).toHaveCount(0);
});

test('offline reload either serves the cached shell or exposes a browser failure', async ({ page, context }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => null);
  if (response !== null) {
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('alert').getByText('Mode hors ligne')).toBeVisible();
  }
});

test('RIASEC test page exposes exactly one h1 landmark for screen readers', async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.goto('/tests/riasec');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test RIASEC');

  // Scan volontairement restreint à ce que ce lot corrige réellement
  // (présence d'un h1, absence de titre vide) : un scan WCAG complet sur cette
  // page (sans backend réel derrière /api dans ce harnais) fait déjà remonter
  // plusieurs défauts préexistants et sans lien avec ce lot — structure de
  // liste du composant Sonner global, contraste du badge "Complété à X %"
  // dans AdaptiveProfileWizard, et un saut h1→h3 (règle "heading-order",
  // best-practice axe non mappée à un critère WCAG — CardTitle rend
  // systématiquement un h3, corriger le saut demanderait de changer le niveau
  // sémantique de ce composant partagé, hors périmètre d'un lot "h1 manquant").
  // Tous signalés dans la matrice UX (docs/audit/makoki-ux-friction-matrix.md)
  // pour des lots séparés, pas corrigés ici pour ne pas mélanger les
  // catégories de défauts.
  const results = await new AxeBuilder({ page })
    .withRules(['page-has-heading-one', 'empty-heading'])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test('profile page exposes exactly one h1 landmark for screen readers', async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mon profil');

  // Voir commentaire ci-dessus : scan restreint pour la même raison.
  const results = await new AxeBuilder({ page })
    .withRules(['page-has-heading-one', 'empty-heading'])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
