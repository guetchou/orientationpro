import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const publicSurfaces = [
  '../pages/Profile.tsx',
  '../features/profile/AdaptiveProfileWizard.tsx',
  '../features/profile/ProfileHypothesisPanel.tsx',
  '../features/cv-optimizer/CvOptimizerPage.tsx',
  '../features/cv-optimizer/AtsAnalysisResult.tsx',
  '../features/cv-optimizer/CvAnalysisHistory.tsx',
  '../components/home/CTASection.tsx',
];

const forbiddenPublicPhrases = [
  'Compte Auth V1',
  'Données isolées par compte dans MySQL',
  'Catalogue ESCO français installé',
  'sans lien ESCO',
  'Confiance technique',
  'Synthèse versionnée du profil',
  'Résultat RIASEC v2',
  'Profil RIASEC',
  'Moteur :',
  'Version du moteur d’analyse',
  'makoki-cv-rules-v1',
  'Mes analyses ATS',
];

describe('authenticated public copy', () => {
  it('n’expose pas le vocabulaire interne dans les surfaces utilisateur principales', () => {
    for (const relativePath of publicSurfaces) {
      const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
      for (const forbidden of forbiddenPublicPhrases) {
        expect(source, `${relativePath} contient encore « ${forbidden} »`).not.toContain(forbidden);
      }
    }
  });
});
