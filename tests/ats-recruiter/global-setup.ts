import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_DB_ENV } from './fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Exécute le script de seed backend (migrations + 2 organisations + comptes +
// offres publiées + candidature) dans backend/, même patron que
// ats-candidate/global-setup.ts.
export default function globalSetup() {
  const backendDir = path.join(__dirname, '..', '..', 'backend');
  execFileSync('node', ['scripts/e2e-ats-recruiter-seed.js', 'up'], {
    cwd: backendDir,
    env: { ...E2E_DB_ENV, ...process.env },
    stdio: 'inherit',
  });
}
