import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/accessibility',
  outputDir: './test-results/accessibility',
  timeout: 45_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'playwright-report/accessibility.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4179',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4179 --strictPort',
    url: 'http://127.0.0.1:4179/login',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
