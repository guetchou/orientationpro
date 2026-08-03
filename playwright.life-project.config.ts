import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  E2E_BACKEND_PORT,
  E2E_DB_ENV,
  E2E_FRONTEND_PORT,
  E2E_SMTP_HTTP_PORT,
  E2E_SMTP_PORT,
} from './tests/life-project/fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Harnais navigateur réel pour l'issue #216 : backend + MySQL réels (base
// jetable dédiée) + frontend en mode dev + un attrapeur SMTP minimal (aucun
// email réel n'est jamais envoyé) pour driver la vérification de compte
// exactement comme un vrai utilisateur. AUTH_V1_ENABLED, LIFE_PROJECT_API_ENABLED
// et VITE_LIFE_PROJECT_ENABLED ne sont activés que dans cet environnement de
// test, jamais par défaut.
const backendUrl = `http://127.0.0.1:${E2E_BACKEND_PORT}`;
const frontendUrl = `http://127.0.0.1:${E2E_FRONTEND_PORT}`;

export default defineConfig({
  testDir: './tests/life-project',
  testMatch: '*.spec.ts',
  outputDir: './test-results/life-project',
  globalSetup: path.join(__dirname, 'tests', 'life-project', 'global-setup.ts'),
  globalTeardown: path.join(__dirname, 'tests', 'life-project', 'global-teardown.ts'),
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'playwright-report/life-project.json' }]],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: [
    {
      command: 'node tests/life-project/smtp-catcher.cjs',
      cwd: __dirname,
      url: `http://127.0.0.1:${E2E_SMTP_HTTP_PORT}/health`,
      reuseExistingServer: false,
      timeout: 15_000,
      env: {
        SMTP_CATCHER_PORT: String(E2E_SMTP_PORT),
        SMTP_CATCHER_HTTP_PORT: String(E2E_SMTP_HTTP_PORT),
      },
    },
    {
      command: 'node src/server.js',
      cwd: path.join(__dirname, 'backend'),
      url: `${backendUrl}/api/test/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...E2E_DB_ENV,
        NODE_ENV: 'test',
        PORT: String(E2E_BACKEND_PORT),
        LEGACY_AUTH_ENABLED: 'false',
        LEGACY_API_ENABLED: 'false',
        AUTH_V1_ENABLED: 'true',
        LIFE_PROJECT_API_ENABLED: 'true',
        CAREER_API_ENABLED: 'true',
        CV_API_V1_ENABLED: 'false',
        ATS_WORKFLOW_V1_ENABLED: 'false',
        DATA_RIGHTS_API_ENABLED: 'false',
        JWT_SECRET: 'life-project-e2e-jwt-secret-at-least-32-characters',
        // Les rate-limits (backend/src/server.js) protègent la production
        // contre le brute force/l'abus — ils restent actifs ici, juste
        // desserrés pour ce backend jetable de test qui enchaîne
        // délibérément de nombreuses tentatives RIASEC (/api/v1/orientation,
        // scope "expensive") et connexions/inscriptions (scope "auth") par run.
        RATE_LIMIT_AUTH_MAX: '500',
        RATE_LIMIT_EXPENSIVE_MAX: '2000',
        APP_WEB_URL: frontendUrl,
        CORS_ORIGINS: frontendUrl,
        SMTP_HOST: '127.0.0.1',
        SMTP_PORT: String(E2E_SMTP_PORT),
        SMTP_SECURE: 'false',
        SMTP_USER: 'life-project-e2e',
        SMTP_PASSWORD: 'life-project-e2e',
        SMTP_FROM: 'no-reply@example.test',
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${E2E_FRONTEND_PORT} --strictPort`,
      cwd: __dirname,
      url: frontendUrl,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        VITE_API_URL: `${backendUrl}/api`,
        VITE_LIFE_PROJECT_ENABLED: 'true',
      },
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
