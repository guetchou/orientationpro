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
  it('emploie explicitement le registre ATS', () => {
    renderResult();
    expect(screen.getByText(/Compatibilité ATS selon les règles MAKOKI/i)).toBeInTheDocument();
    expect(screen.getByText(/Règles ATS réussies/i)).toBeInTheDocument();
    expect(screen.getByText(/Problèmes détectés/i)).toBeInTheDocument();
    expect(screen.getByText(/Éléments à vérifier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/optimisation ATS/i).length).toBeGreaterThan(0);
  });

  it('associe le score au moteur versionné makoki-cv-rules-v1', () => {
    renderResult();
    expect(screen.getAllByText(/makoki-cv-rules-v1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Version du moteur d’analyse/i)).toBeInTheDocument();
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

  it("n'affiche aucune affirmation interdite", () => {
    const { container } = renderResult();
    const text = (container.textContent || '').toLowerCase();
    expect(text).not.toMatch(/probabilité d.entretien\s*:\s*\d/);
    expect(text).not.toMatch(/85\s*[-–]\s*95\s*%/);
    expect(text).not.toMatch(/taux de recrutement/);
    expect(text).not.toMatch(/score de base/);
    // Aucune formulation POSITIVE de garantie de passage des ATS.
    expect(text).not.toMatch(/garantit\s+(le\s+)?passage/);
    expect(text).not.toMatch(/passe(z|ra)?\s+les\s+ats/);
    // La reproduction de tous les ATS ne doit apparaitre que niee.
    expect(text).not.toMatch(/reproduit\s+tous\s+les\s+ats/);
    // Le disclaimer nie explicitement la garantie et la reproduction.
    expect(text).toMatch(/ni d.une garantie de\s*passage des ats/);
    expect(text).toMatch(/ni d.une reproduction de tous les ats/);
  });

  it('restitue les preuves et les recommandations', () => {
    renderResult();
    expect(screen.getByText(/Résultats peu quantifiés/)).toBeInTheDocument();
    expect(screen.getByText(/résultats réels et vérifiables/)).toBeInTheDocument();
  });
});
