import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_DB_ENV } from './fixtures';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Exécute le script de seed backend (migrations + comptes + offre publiée)
// dans backend/, pour réutiliser bcrypt/mysql2 déjà installés là-bas plutôt
// que d'ajouter ces dépendances côté frontend pour ce seul harnais E2E.
export default function globalSetup() {
  const backendDir = path.join(__dirname, '..', '..', 'backend');
  execFileSync('node', ['scripts/e2e-ats-candidate-seed.js', 'up'], {
    cwd: backendDir,
    env: { ...process.env, ...E2E_DB_ENV },
    stdio: 'inherit',
  });
}
