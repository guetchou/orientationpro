import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_BACKEND_PORT, E2E_DB_ENV, E2E_FRONTEND_PORT } from './tests/ats-recruiter/fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Harnais navigateur réel pour l'issue #199 : backend + MySQL réels (base
// jetable partagée avec ats-candidate, IDs distincts) + frontend en mode dev.
// ATS_WORKFLOW_V1_ENABLED et VITE_ATS_RECRUITER_ENABLED ne sont activés que
// dans cet environnement de test, jamais par défaut.
const backendUrl = `http://127.0.0.1:${E2E_BACKEND_PORT}`;
const frontendUrl = `http://127.0.0.1:${E2E_FRONTEND_PORT}`;

export default defineConfig({
  testDir: './tests/ats-recruiter',
  testMatch: '*.spec.ts',
  outputDir: './test-results/ats-recruiter',
  globalSetup: path.join(__dirname, 'tests', 'ats-recruiter', 'global-setup.ts'),
  globalTeardown: path.join(__dirname, 'tests', 'ats-recruiter', 'global-teardown.ts'),
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'playwright-report/ats-recruiter.json' }]],
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: [
    {
      command: 'node src/server.js',
      cwd: path.join(__dirname, 'backend'),
      url: `${backendUrl}/api/test/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        ...E2E_DB_ENV,
        ...process.env,
        NODE_ENV: 'test',
        PORT: String(E2E_BACKEND_PORT),
        LEGACY_AUTH_ENABLED: 'false',
        LEGACY_API_ENABLED: 'false',
        AUTH_V1_ENABLED: 'true',
        ATS_WORKFLOW_V1_ENABLED: 'true',
        // Le scénario connecte 6 comptes distincts depuis la même IP de test ;
        // le limiteur auth par défaut (20/15min, production) est correct mais
        // trop bas pour ce harnais — relevé ici uniquement, jamais en prod.
        RATE_LIMIT_AUTH_MAX: '200',
        JWT_SECRET: 'ats-recruiter-e2e-jwt-secret-at-least-32-characters',
        APP_WEB_URL: frontendUrl,
        CORS_ORIGINS: frontendUrl,
        SMTP_HOST: '127.0.0.1',
        SMTP_PORT: '2525',
        SMTP_USER: 'e2e',
        SMTP_PASSWORD: 'e2e',
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
        VITE_ATS_RECRUITER_ENABLED: 'true',
      },
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
