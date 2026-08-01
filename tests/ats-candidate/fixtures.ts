// Doit rester synchronisé avec backend/scripts/e2e-ats-candidate-seed.js —
// base jetable dédiée, IDs et identifiants fixes, aucun risque de collision.
export const E2E_FIXTURES = {
  candidateA: { email: 'e2e-candidate-a@example.test' },
  candidateB: { email: 'e2e-candidate-b@example.test' },
  recruiter: { email: 'e2e-recruiter@example.test' },
  password: 'E2eStrongPassw0rd!2026',
  jobTitle: 'Comptable (E2E)',
};

export const E2E_DB_ENV = {
  DB_HOST: '127.0.0.1',
  DB_PORT: '34069',
  DB_USER: 'root',
  DB_PASSWORD: 'e2e_root_password',
  DB_NAME: 'orientationpro_ats_e2e',
};

export const E2E_BACKEND_PORT = 34071;
export const E2E_FRONTEND_PORT = 34072;
