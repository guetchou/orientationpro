import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AnalysisResult } from '../AnalysisResult';
import type { CvAnalysis } from '../types';

const analysis: CvAnalysis = {
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
      <AnalysisResult analysis={analysis} />
    </MemoryRouter>,
  );

describe('AnalysisResult', () => {
  it('affiche la version du moteur makoki-cv-rules-v1', () => {
    renderResult();
    expect(screen.getAllByText(/makoki-cv-rules-v1/i).length).toBeGreaterThan(0);
  });

  it('affiche les composantes avec leurs maximums reels, jamais /100', () => {
    renderResult();
    expect(screen.getByText('76 / 100')).toBeInTheDocument(); // general
    expect(screen.getByText('20 / 30')).toBeInTheDocument();
    expect(screen.getByText('19 / 25')).toBeInTheDocument();
    expect(screen.getByText('18 / 25')).toBeInTheDocument();
    expect(screen.getByText('19 / 20')).toBeInTheDocument();
    expect(screen.queryByText('20 / 100')).not.toBeInTheDocument();
  });

  it("n'affiche aucune probabilite d'entretien ni score arbitraire", () => {
    const { container } = renderResult();
    const text = container.textContent || '';
    expect(text).not.toMatch(/probabilité d.entretien\s*:\s*\d/i);
    expect(text).not.toMatch(/85\s*[-–]\s*95\s*%/);
    expect(text).not.toMatch(/score de base/i);
  });

  it('affiche les recommandations explicables', () => {
    renderResult();
    expect(screen.getByText(/Résultats peu quantifiés/)).toBeInTheDocument();
    expect(screen.getByText(/résultats réels et vérifiables/)).toBeInTheDocument();
  });
});
