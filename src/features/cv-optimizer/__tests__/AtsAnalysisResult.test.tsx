import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AtsAnalysisResult } from '../AtsAnalysisResult';
import type { AtsAnalysis } from '../types';

const analysis: AtsAnalysis = {
  id: 'a-1',
  algorithmVersion: 'makoki-cv-rules-v1',
  document: {
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    fileSize: 4096,
    pageCount: 2,
    detectedLanguage: 'fr',
  },
  scores: { generalReadiness: 76, targetRelevance: 64 },
  targetTitle: 'Conseiller clientèle',
  createdAt: '2026-07-28T09:00:00.000Z',
  snapshot: {
    status: 'completed',
    document: {
      fileName: 'cv.pdf',
      mimeType: 'application/pdf',
      fileSize: 4096,
      pageCount: 2,
      detectedLanguage: 'fr',
      textLength: 1500,
      wordCount: 240,
    },
    scores: {
      generalReadiness: 76,
      structure: 20,
      contentClarity: 19,
      impact: 18,
      technicalUsability: 19,
      targetRelevance: 64,
    },
    contactPresence: { hasEmail: true, hasPhone: true },
    sections: [
      { key: 'contact', present: true },
      { key: 'experience', present: true },
    ],
    skills: [{ canonical: 'comptabilité', domain: 'comptabilite-finance' }],
    strengths: [{ code: 'CONTACT_COMPLETE', title: 'Coordonnées complètes' }],
    issues: [
      {
        code: 'EXPERIENCE_NO_MEASURABLE_OUTCOME',
        severity: 'important',
        title: 'Résultats peu quantifiés',
        observation: 'Aucun résultat mesurable détecté.',
        recommendation: 'Ajoutez uniquement des résultats réels et vérifiables.',
        scoreImpact: -6,
      },
      {
        code: 'WEAK_ACTION_VERBS',
        severity: 'suggestion',
        title: 'Verbes d’action peu présents',
        observation: 'Peu de verbes d’action repérés.',
        recommendation: 'Commencez vos réalisations par des verbes d’action.',
        scoreImpact: -3,
      },
    ],
    targetMatch: {
      targetRelevance: 64,
      jobTitle: 'Conseiller clientèle',
      presentSkills: ['service client'],
      missingSkills: ['gestion de projet'],
      requiredSkills: ['service client', 'gestion de projet'],
      keywordOverlapPercent: 58,
    },
    methodology: {
      version: 'makoki-cv-rules-v1',
      type: 'deterministic_rules',
      limitations: ['Aucune reconnaissance OCR.', 'Aucune probabilité d’entretien.'],
    },
  },
};

const renderResult = () =>
  render(
    <MemoryRouter>
      <AtsAnalysisResult analysis={analysis} />
    </MemoryRouter>,
  );

describe('AtsAnalysisResult', () => {
  it('présente le résultat dans un langage compréhensible', () => {
    renderResult();
    expect(screen.getByText(/Niveau de préparation de ton CV/i)).toBeInTheDocument();
    expect(screen.getByText(/Points satisfaisants/i)).toBeInTheDocument();
    expect(screen.getByText(/Points à améliorer/i)).toBeInTheDocument();
    expect(screen.getByText(/Éléments à vérifier/i)).toBeInTheDocument();
    expect(screen.getByText(/Adéquation avec le poste ciblé/i)).toBeInTheDocument();
  });

  it('ne montre pas les identifiants et versions techniques du moteur', () => {
    const { container } = renderResult();
    const text = container.textContent || '';
    expect(text).not.toContain('makoki-cv-rules-v1');
    expect(text).not.toMatch(/Version du moteur/iu);
    expect(text).not.toMatch(/algorithmVersion/iu);
  });

  it('affiche les composantes avec leurs maximums réels, jamais /100', () => {
    renderResult();
    expect(screen.getByText('76 / 100')).toBeInTheDocument();
    expect(screen.getByText('20 / 30')).toBeInTheDocument();
    expect(screen.getByText('19 / 25')).toBeInTheDocument();
    expect(screen.getByText('18 / 25')).toBeInTheDocument();
    expect(screen.getByText('19 / 20')).toBeInTheDocument();
    expect(screen.queryByText('20 / 100')).not.toBeInTheDocument();
  });

  it("n'affiche aucune promesse de recrutement", () => {
    const { container } = renderResult();
    const text = (container.textContent || '').toLowerCase();
    expect(text).not.toMatch(/probabilité d.entretien\s*:\s*\d/);
    expect(text).not.toMatch(/85\s*[-–]\s*95\s*%/);
    expect(text).not.toMatch(/taux de recrutement/);
    expect(text).not.toMatch(/score de base/);
    expect(text).toMatch(/ne garantit ni entretien, ni sélection automatique, ni recrutement/);
  });

  it('restitue les observations et les recommandations', () => {
    renderResult();
    expect(screen.getByText(/Résultats peu quantifiés/)).toBeInTheDocument();
    expect(screen.getByText(/résultats réels et vérifiables/)).toBeInTheDocument();
  });
});
