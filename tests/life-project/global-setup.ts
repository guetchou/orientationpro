import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_DB_ENV } from './fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Exécute le script de seed backend (migrations + instrument RIASEC + compte
// fixe) dans backend/, même patron que tests/ats-candidate/global-setup.ts.
export default function globalSetup() {
  const backendDir = path.join(__dirname, '..', '..', 'backend');
  execFileSync('node', ['scripts/e2e-life-project-seed.js', 'up'], {
    cwd: backendDir,
    env: { ...process.env, ...E2E_DB_ENV },
    stdio: 'inherit',
  });
}
