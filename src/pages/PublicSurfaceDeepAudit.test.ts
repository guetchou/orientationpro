import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const srcRoot = path.join(root, 'src');

const publicEntries = [
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
  'pages/Conseillers.tsx',
  'pages/ProfessionalJobsPage.tsx',
  'pages/Blog.tsx',
  'pages/BlogPost.tsx',
  'pages/GuideEtudesCongo2024.tsx',
  'pages/BookAppointment.tsx',
  'pages/RecruitmentPage.tsx',
  'pages/Unauthorized.tsx',
  'pages/NotFound.tsx',
  'features/life-project/UnifiedLifeProjectPage.tsx',
];

const forbidden = [
  /Orientation Pro Congo/iu,
  /orientationpro\.cg/iu,
  /\+242\s*06\s*123\s*456/iu,
  /page en cours de développement/iu,
  /mise à jour prévue bientôt/iu,
  /fonctionnalité expérimentale/iu,
  /capacité serveur/iu,
  /API correspondante/iu,
  /dans cet environnement/iu,
  /module(?:s)? non disponible/iu,
  /module[^\n]{0,80}non raccord/iu,
  /calcul explicable/iu,
  /orchestration distante/iu,
  /profil invité/iu,
  /faux bouton/iu,
  /faux article/iu,
  /phase pilote/iu,
  /bibliothèque éditoriale complète est en préparation/iu,
  /première valeur obtenue/iu,
  /parcours unique MAKOKI/iu,
  /comprendre le modèle RIASEC/iu,
  /mon profil RIASEC/iu,
  /ton RIASEC/iu,
  /score descriptif/iu,
  /adéquation[^\n]{0,30}sur 100/iu,
  /confiance (?:élevée|moyenne|faible)/iu,
  /version[^\n]{0,40}algorithme/iu,
  /résultat [^\n]{0,50}calculé le/iu,
  /dépend des données disponibles dans l.API/iu,
  /fonctions réellement disponibles/iu,
  /modules encore en phase/iu,
  /soumis aux permissions/iu,
];

const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/gu;

const resolveLocalImport = (fromFile: string, specifier: string): string | null => {
  let base: string;
  if (specifier.startsWith('@/')) base = path.join(srcRoot, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;

  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
};

const collectReachableUiFiles = () => {
  const queue = publicEntries.map((entry) => path.join(srcRoot, entry));
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current) || !fs.existsSync(current)) continue;
    visited.add(current);

    const source = fs.readFileSync(current, 'utf8');
    for (const match of source.matchAll(importPattern)) {
      const resolved = resolveLocalImport(current, match[1]);
      if (!resolved) continue;
      const relative = path.relative(srcRoot, resolved).replaceAll('\\', '/');
      if (
        relative.includes('/admin/')
        || relative.includes('/__tests__/')
        || relative.endsWith('.test.ts')
        || relative.endsWith('.test.tsx')
      ) continue;
      queue.push(resolved);
    }
  }

  return [...visited].filter((file) => file.endsWith('.tsx'));
};

describe('audit profond des surfaces publiques', () => {
  it('référence toutes les pages publiques attendues', () => {
    const missing = publicEntries.filter((entry) => !fs.existsSync(path.join(srcRoot, entry)));
    expect(missing).toEqual([]);
  });

  it('ne publie ni texte de développement, ni ancienne marque, ni vocabulaire moteur', () => {
    const findings: string[] = [];
    for (const file of collectReachableUiFiles()) {
      const source = fs.readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        if (pattern.test(source)) {
          findings.push(`${path.relative(root, file)} :: ${pattern}`);
        }
        pattern.lastIndex = 0;
      }
    }
    expect(findings).toEqual([]);
  });

  it('conserve une destination réelle pour chaque redirection historique', () => {
    const router = fs.readFileSync(path.join(srcRoot, 'router/AppRouter.tsx'), 'utf8');
    const historicalRoutes = [
      '/tests',
      '/tests/riasec',
      '/tests/emotional',
      '/tests/learning',
      '/tests/multiple',
      '/tests/career-transition',
      '/tests/no-diploma',
      '/tests/senior-employment',
      '/tests/entrepreneurial',
      '/orientation/results',
      '/orientation/results/:resultId',
      '/orientation/results/:resultId/careers',
      '/orientation-services',
      '/test-results',
    ];
    for (const route of historicalRoutes) expect(router).toContain(`path="${route}"`);
    expect(router).toContain('to="/parcours"');
  });
});
