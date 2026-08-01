import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_DB_ENV } from './fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function globalTeardown() {
  const backendDir = path.join(__dirname, '..', '..', 'backend');
  execFileSync('node', ['scripts/e2e-ats-candidate-seed.js', 'down'], {
    cwd: backendDir,
    env: { ...process.env, ...E2E_DB_ENV },
    stdio: 'inherit',
  });
}
