import { test as base, expect, type Page } from '@playwright/test';

// Doit rester synchronisé avec backend/scripts/e2e-life-project-seed.js —
// base jetable dédiée, identifiants fixes, aucune donnée réelle de jeune.
export const E2E_FIXTURES = {
  existingAccount: { email: 'e2e-life-project-existing@example.test' },
  password: 'E2eStrongPassw0rd!2026',
};

export const E2E_DB_ENV = {
  DB_HOST: '127.0.0.1',
  DB_PORT: '34075',
  DB_USER: 'root',
  DB_PASSWORD: 'e2e_root_password',
  DB_NAME: 'orientationpro_life_project_e2e',
};

export const E2E_BACKEND_PORT = 34081;
export const E2E_FRONTEND_PORT = 34082;
export const E2E_SMTP_PORT = 34083;
export const E2E_SMTP_HTTP_PORT = 34084;

// Garde-fou transverse (#216) : toute erreur console inattendue ou réponse
// 5xx fait échouer le test, sans consommer un test dédié. Un test qui simule
// délibérément une panne (réseau coupé, e-mail déjà utilisé, session
// expirée...) déclare les erreurs attendues via
// `test.use({ allowedConsoleErrors: ['409'] })` plutôt que de les laisser
// faire échouer la garde par erreur — le navigateur journalise en console
// tout fetch en échec (4xx compris), que l'application le gère bien ou non.
// Chaînes simples (pas de RegExp) : les options de fixture Playwright sont
// sérialisées, et un RegExp ne survit pas à un aller-retour JSON.
export const test = base.extend<{ page: Page; allowedConsoleErrors: string[] }>({
  allowedConsoleErrors: [[], { option: true }],
  page: async ({ page, allowedConsoleErrors }, use) => {
    const consoleErrors: string[] = [];
    const serverErrors: string[] = [];

    // Pré-accepte le choix cookies (comme un visiteur revenant) pour que la
    // bannière n'intercepte jamais un clic pendant le parcours testé — le
    // consentement lui-même n'est pas ce que cette suite vérifie.
    await page.addInitScript(() => {
      const now = new Date();
      const expires = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      window.localStorage.setItem('makoki_consent_v1', JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        support: false,
        updatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      }));
    });

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
    });

    await use(page);

    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !allowedConsoleErrors.some((pattern) => message.includes(pattern)),
    );
    expect(unexpectedConsoleErrors, `unexpected console errors: ${unexpectedConsoleErrors.join(' | ')}`).toEqual([]);
    expect(serverErrors, `unexpected 5xx responses: ${serverErrors.join(' | ')}`).toEqual([]);
  },
});

export { expect };
