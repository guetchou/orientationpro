import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const srcRoot = path.join(root, 'src');

const routeEntries = [
  'pages/Index.tsx',
  'pages/About.tsx',
  'pages/LegalNotice.tsx',
  'pages/Privacy.tsx',
  'pages/Terms.tsx',
  'pages/Cookies.tsx',
  'pages/Login.tsx',
  'pages/Register.tsx',
  'pages/ForgotPassword.tsx',
  'pages/ResetPassword.tsx',
  'pages/VerifyEmail.tsx',
  'pages/PostBac.tsx',
  'pages/CareerCatalog.tsx',
  'pages/OccupationDetail.tsx',
  'pages/Recrutement.tsx',
  'pages/ProfessionalJobsPage.tsx',
  'pages/Conseillers.tsx',
  'pages/Blog.tsx',
  'pages/BlogPost.tsx',
  'pages/CVOptimizer.tsx',
  'pages/CVHistory.tsx',
  'pages/Unauthorized.tsx',
  'pages/GuideEtudesCongo2024.tsx',
  'pages/BookAppointment.tsx',
  'pages/RecruitmentPage.tsx',
  'pages/Dashboard.tsx',
  'pages/Profile.tsx',
  'pages/NotFound.tsx',
  'features/life-project/UnifiedLifeProjectPage.tsx',
  'features/ats-candidate/JobListPage.tsx',
  'features/ats-candidate/JobDetailPage.tsx',
  'features/ats-candidate/MyApplicationsPage.tsx',
  'features/ats-candidate/ApplicationDetailPage.tsx',
  'features/ats-recruiter/JobsDashboardPage.tsx',
  'features/ats-recruiter/JobPipelinePage.tsx',
  'features/ats-recruiter/ApplicationReviewPage.tsx',
  'features/ats-recruiter/RecruiterAssignmentPage.tsx',
  'pages/admin/Dashboard.tsx',
  'pages/admin/SuperAdmin.tsx',
  'pages/admin/ATSAdmin.tsx',
  'pages/admin/BlogAdmin.tsx',
  'pages/admin/MediaManager.tsx',
  'pages/conseiller/Dashboard.tsx',
  'pages/recruteur/Dashboard.tsx',
  'pages/coach/Dashboard.tsx',
  'pages/rh/Dashboard.tsx',
  'pages/superadmin/Dashboard.tsx',
];

const universalForbidden = [
  /Orientation Pro Congo/iu,
  /support@orientationpro\.cg/iu,
  /\+242\s*06\s*123\s*456/iu,
  /page en cours de développement/iu,
  /mise à jour prévue bientôt/iu,
  /lorem ipsum/iu,
  /utilisateurs actifs[^\n]{0,30}1[,. ]?234/iu,
  /tests complétés[^\n]{0,30}5[,. ]?678/iu,
  /satisfaction[^\n]{0,20}98\s*%/iu,
  /contenu de démonstration/iu,
  /fausse donnée/iu,
];

describe('audit de toutes les destinations du routeur', () => {
  it('ne référence aucun écran déclaré mais absent', () => {
    const missing = routeEntries.filter((entry) => !fs.existsSync(path.join(srcRoot, entry)));
    expect(missing).toEqual([]);
  });

  it('ne contient aucune ancienne marque, fausse coordonnée ou page factice', () => {
    const findings: string[] = [];
    for (const entry of routeEntries) {
      const file = path.join(srcRoot, entry);
      const source = fs.readFileSync(file, 'utf8');
      for (const pattern of universalForbidden) {
        if (pattern.test(source)) findings.push(`${entry} :: ${pattern}`);
        pattern.lastIndex = 0;
      }
    }
    expect(findings).toEqual([]);
  });
});
