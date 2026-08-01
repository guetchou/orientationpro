// Doit rester synchronisé avec backend/scripts/e2e-ats-recruiter-seed.js —
// base jetable dédiée (partagée avec ats-candidate, IDs à préfixe distinct,
// aucun risque de collision), 2 organisations, manager + recruteurs fixes.
export const E2E_FIXTURES = {
  managerA: { accountId: '55555555-5555-4555-8555-555555555501', email: 'e2e-recruiter-manager-a@example.test' },
  recruiterA1: { accountId: '55555555-5555-4555-8555-555555555502', email: 'e2e-recruiter-a1@example.test' },
  recruiterA2: { accountId: '55555555-5555-4555-8555-555555555503', email: 'e2e-recruiter-a2@example.test' },
  managerB: { accountId: '55555555-5555-4555-8555-555555555504', email: 'e2e-recruiter-manager-b@example.test' },
  recruiterB1: { accountId: '55555555-5555-4555-8555-555555555505', email: 'e2e-recruiter-b1@example.test' },
  candidateA: { accountId: '55555555-5555-4555-8555-555555555506', email: 'e2e-recruiter-candidate-a@example.test' },
  password: 'E2eStrongPassw0rd!2026',
  jobTitleA: 'Développeur backend (E2E org A)',
  jobTitleB: 'Chargé de recrutement (E2E org B)',
};

export const E2E_DB_ENV = {
  DB_HOST: '127.0.0.1',
  DB_PORT: '34069',
  DB_USER: 'root',
  DB_PASSWORD: 'e2e_root_password',
  DB_NAME: 'orientationpro_ats_e2e',
};

export const E2E_BACKEND_PORT = 34073;
export const E2E_FRONTEND_PORT = 34074;
