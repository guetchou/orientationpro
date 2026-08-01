import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Garantie structurelle : l'interface recruteur ATS ne doit jamais être
// accessible sans session ni sans rôle staff (même patron que
// ats-candidate/route-protection.test.ts).
const routerSource = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'router', 'AppRouter.tsx'),
  'utf8',
);

const isProtectedByAtsRecruiterGuard = (route: string) => {
  const re = new RegExp(
    `path="${route.replace(/\//g, '\\/').replace(/:/g, '\\:')}"[^\\n]*element=\\{\\s*<AuthGuard requireAuth roles=\\{ATS_RECRUITER_ROLES\\}>`,
  );
  return re.test(routerSource);
};

describe('protection des routes recruteur ATS', () => {
  it('/recruteur/ats/offres est protégé par le garde ATS_RECRUITER_ROLES', () => {
    expect(isProtectedByAtsRecruiterGuard('/recruteur/ats/offres')).toBe(true);
  });

  it('/recruteur/ats/offres/:jobId/pipeline est protégé', () => {
    expect(isProtectedByAtsRecruiterGuard('/recruteur/ats/offres/:jobId/pipeline')).toBe(true);
  });

  it('/recruteur/ats/offres/:jobId/equipe est protégé', () => {
    expect(isProtectedByAtsRecruiterGuard('/recruteur/ats/offres/:jobId/equipe')).toBe(true);
  });

  it('/recruteur/ats/candidatures/:applicationId est protégé', () => {
    expect(isProtectedByAtsRecruiterGuard('/recruteur/ats/candidatures/:applicationId')).toBe(true);
  });

  it('le garde inclut recruiter, recruitment_manager, admin et super_admin — jamais "recruteur" (chaîne legacy)', () => {
    expect(routerSource).toMatch(
      /ATS_RECRUITER_ROLES = \['recruiter', 'recruitment_manager', 'admin', 'super_admin'\]/,
    );
  });

  it('les routes recruteur ATS sont gated par isAtsRecruiterFrontendEnabled', () => {
    expect(routerSource).toMatch(/atsRecruiterFrontendEnabled &&/);
  });

  it('la route legacy /recruteur/dashboard reste protégée par RecruteurRoute, non modifiée', () => {
    expect(routerSource).toMatch(
      /path="\/recruteur\/dashboard" element=\{<RecruteurRoute><RecruteurDashboard \/><\/RecruteurRoute>\}/,
    );
  });
});
