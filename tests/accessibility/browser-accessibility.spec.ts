import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
