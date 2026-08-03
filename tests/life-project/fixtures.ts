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
// 5xx fait échouer le test, sans consommer un test dédié. `page.close()` et
// les erreurs volontairement provoquées par un test (ex. réseau coupé) ne
// doivent pas être des faux positifs — chaque test qui simule une panne
// l'assume explicitement plutôt que de compter sur cette fixture pour filtrer.
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const serverErrors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
    });

    await use(page);

    expect(consoleErrors, `unexpected console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
    expect(serverErrors, `unexpected 5xx responses: ${serverErrors.join(' | ')}`).toEqual([]);
  },
});

export { expect };
