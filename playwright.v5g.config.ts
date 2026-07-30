import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.V5G_WEB_URL;
const outputDir = process.env.V5G_PLAYWRIGHT_OUTPUT;
if (!baseURL || !outputDir) {
  throw new Error('V5G_WEB_URL and V5G_PLAYWRIGHT_OUTPUT are required');
}

export default defineConfig({
  testDir: './tests/release',
  testMatch: 'v5g-functional.spec.ts',
  outputDir,
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['line'],
    ['json', { outputFile: `${outputDir}/report.json` }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    reducedMotion: 'reduce',
  },
  projects: [{
    name: 'firefox-authenticated',
    use: { ...devices['Desktop Firefox'] },
  }],
});
