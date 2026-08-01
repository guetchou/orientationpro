import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Garantie structurelle : le parcours candidat ATS ne doit jamais être
// accessible sans session (même patron que cv-optimizer/route-protection.test.ts).
const routerSource = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'router', 'AppRouter.tsx'),
  'utf8',
);

const isProtected = (route: string) => {
  const re = new RegExp(
    `path="${route.replace(/\//g, '\\/')}"[^\\n]*element=\\{<UserRoute>`,
  );
  return re.test(routerSource);
};

describe('protection des routes candidat ATS', () => {
  it('/offres est protégé par UserRoute', () => {
    expect(isProtected('/offres')).toBe(true);
  });

  it('/offres/:jobId est protégé par UserRoute', () => {
    expect(isProtected('/offres/:jobId')).toBe(true);
  });

  it('/mes-candidatures est protégé par UserRoute', () => {
    expect(isProtected('/mes-candidatures')).toBe(true);
  });

  it('/mes-candidatures/:applicationId est protégé par UserRoute', () => {
    expect(isProtected('/mes-candidatures/:applicationId')).toBe(true);
  });

  it('les routes candidat ATS sont gated par isAtsCandidateFrontendEnabled, comme /parcours', () => {
    expect(routerSource).toMatch(/atsCandidateFrontendEnabled &&/);
  });

  it('la route legacy /jobs (tableau non authentifié) n’est pas touchée', () => {
    expect(routerSource).toMatch(/path="\/jobs" element=\{<ProfessionalJobsPage \/>\}/);
  });
});
