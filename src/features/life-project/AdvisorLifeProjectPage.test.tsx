import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdvisorLifeProjectPage from './AdvisorLifeProjectPage';
import * as api from './advisor-api';
import type { AdvisorEnvelope } from './advisor-types';

vi.mock('./advisor-api', () => ({
  createAdvisorProject: vi.fn(),
  generateAdvisorRecommendations: vi.fn(),
  getAdvisorCapabilityRegistry: vi.fn(),
  getAdvisorProject: vi.fn(),
  listAdvisorProjects: vi.fn(),
  saveAdvisorDiagnostic: vi.fn(),
  selectAdvisorScenario: vi.fn(),
}));

const diagnostic = {
  schemaVersion: 'makoki-life-diagnostic-v1' as const,
  id: 'diagnostic-1',
  objective: 'studies' as const,
  identity: {
    ageRange: '16-20',
    country: { value: 'Congo', verification: 'declared' as const, source: null, verifiedAt: null },
    zone: { value: 'Brazzaville', verification: 'declared' as const, source: null, verifiedAt: null },
    situation: { value: 'Terminale générale', verification: 'declared' as const, source: null, verifiedAt: null },
    educationLevel: { value: 'baccalaureate', verification: 'declared' as const, source: null, verifiedAt: null },
    diploma: { value: 'Baccalauréat en préparation', verification: 'declared' as const, source: null, verifiedAt: null },
    subjects: ['Mathématiques'],
    significantResults: ['Résultats moyens'],
    interruptions: [],
  },
  constraints: {
    mobility: 'local' as const,
    budget: { amount: null, currency: 'XAF', verification: 'unknown' as const },
    needIncomeWithinMonths: null,
    maxDurationMonths: 60,
    internetAccess: 'regular' as const,
    equipment: ['smartphone'],
    familyResponsibilities: [],
    availability: ['temps plein'],
    healthOrDisability: [],
    documents: ['baccalaureat'],
    availableModes: ['presentiel', 'online'],
  },
  preferences: {
    interests: ['numérique'],
    activities: ['résolution de problèmes'],
    favouriteSubjects: ['sciences'],
    workEnvironments: ['équipe'],
    workStyles: ['technique'],
    values: ['évolution'],
  },
  capabilities: {
    skills: ['logique'],
    internships: [],
    volunteering: [],
    jobs: [],
    personalProjects: ['initiation informatique'],
    responsibilities: [],
    languages: ['français'],
    digitalSkills: ['informatique de base'],
    evidence: [],
    regulatoryQualifications: [],
  },
  priorities: [{ id: 'interest', importance: 1 }],
  notes: null,
  recordedAt: '2026-07-30T10:00:00.000Z',
  updatedAt: '2026-07-30T10:05:00.000Z',
};

const scenario = {
  id: 'scenario-1',
  optionId: 'cg-umng-fst-informatique-reseaux',
  title: 'Licence professionnelle Informatique et Réseaux — UMNG',
  category: 'education',
  positioning: 'priority' as const,
  rank: 1,
  fitScore: 78,
  confidence: 'medium' as const,
  reasons: [{ signal: 'interests', explanation: 'Les intérêts déclarés correspondent à cette option.', score: 90 }],
  strengths: ['Intérêt pour le numérique'],
  conditions: ['Confirmer les modalités 2026-2027.'],
  risks: ['Frais et calendrier non publiés.'],
  blockingFactors: [],
  missingInformation: ['Coût ou fourchette de coût'],
  localOpportunities: [{
    id: 'opp-1',
    title: 'Programme Informatique et Réseaux',
    organization: 'Université Marien Ngouabi',
    zone: 'Brazzaville',
    sourceReferenceId: 'src-1',
    status: 'to_confirm' as const,
  }],
  sourceReferences: [{
    id: 'src-1',
    title: 'Université Marien Ngouabi — programmes FST',
    kind: 'official_web_page',
    url: 'https://example.test/source',
    version: null,
    verifiedAt: '2026-07-30T00:00:00.000Z',
    verificationStatus: 'verified' as const,
    scope: 'Confirme le programme, pas les frais.',
  }],
  firstActions: [{
    title: 'Contacter la FST',
    deadlineDays: 7,
    expectedEvidence: 'Réponse datée sur les conditions et les frais',
  }],
  alternatives: [],
  scoreBreakdown: {},
  penalties: { unverifiedCondition: 10 },
  generatedAt: '2026-07-30T10:10:00.000Z',
  engineVersion: 'makoki-life-recommendation-v1',
};

const envelope: AdvisorEnvelope = {
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: 3,
  project: {
    id: 'project-1',
    ownerAccountId: 'account-1',
    title: 'Projet de vie — séance conseiller',
    purpose: 'Options vérifiables',
    state: 'comparison',
    activeScenarioId: null,
    scenarios: [{
      id: scenario.id,
      title: scenario.title,
      description: scenario.reasons[0].explanation,
      status: 'candidate',
      optionType: 'education',
      missingInformation: scenario.missingInformation,
      uncertainty: { level: 'medium', reasons: scenario.missingInformation },
    }],
    actionPlans: [],
    diagnostic,
    recommendation: {
      schemaVersion: 'makoki-life-recommendation-output-v1',
      engineVersion: 'makoki-life-recommendation-v1',
      status: 'complete',
      generatedAt: '2026-07-30T10:10:00.000Z',
      diagnosticSummary: {},
      scenarios: [scenario],
      nonPrioritized: [{ optionId: 'other', title: 'Option incompatible', reasons: ['Mobilité incompatible.'] }],
      missingInformation: ['Coût ou fourchette de coût'],
    },
    missingInformation: ['Coût ou fourchette de coût'],
    uncertainty: { level: 'medium', reasons: ['Coût inconnu'] },
    updatedAt: '2026-07-30T10:10:00.000Z',
  },
};

const enable = () => {
  vi.mocked(api.getAdvisorCapabilityRegistry).mockResolvedValue({
    schemaVersion: 'makoki-capability-registry-v1',
    capabilities: [{
      id: 'life-project.core-v1',
      status: 'experimental',
      configured: true,
      publicLimitations: [],
    }],
  });
};

describe('AdvisorLifeProjectPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.listAdvisorProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('refuse de simuler le moteur lorsque la capacité serveur est désactivée', async () => {
    vi.mocked(api.getAdvisorCapabilityRegistry).mockResolvedValue({
      schemaVersion: 'makoki-capability-registry-v1',
      capabilities: [{
        id: 'life-project.core-v1',
        status: 'disabled',
        configured: false,
        publicLimitations: [],
      }],
    });

    render(<AdvisorLifeProjectPage />);

    expect(await screen.findByText('Projet de vie indisponible')).toBeInTheDocument();
    expect(api.listAdvisorProjects).not.toHaveBeenCalled();
  });

  it('conserve le diagnostic progressif localement avant toute génération', async () => {
    enable();
    render(<AdvisorLifeProjectPage />);

    const diagnosticPanel = await screen.findByTestId('advisor-diagnostic');
    fireEvent.change(screen.getByLabelText('Ville ou zone'), { target: { value: 'Brazzaville' } });
    fireEvent.change(screen.getByLabelText('Situation actuelle'), { target: { value: 'Terminale générale' } });
    fireEvent.change(screen.getByLabelText('Intérêts'), { target: { value: 'numérique, sciences' } });
    fireEvent.change(screen.getByLabelText('Stages'), { target: { value: 'stage support informatique' } });
    fireEvent.change(screen.getByLabelText('Emplois'), { target: { value: 'aide familiale' } });

    await waitFor(() => {
      const stored = localStorage.getItem('makoki.life-project.advisor-diagnostic.v1') || '';
      expect(stored).toContain('Brazzaville');
      expect(stored).toContain('stage support informatique');
      expect(stored).toContain('aide familiale');
    });
    expect(diagnosticPanel).toHaveTextContent('Diagnostic progressif');
  });

  it('affiche les raisons, sources, risques, comparaison et synthèse actionnable', async () => {
    enable();
    vi.mocked(api.listAdvisorProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [{
        id: 'project-1',
        title: envelope.project.title,
        state: 'comparison',
        persistenceVersion: 3,
        scenarioCount: 1,
      }],
    });
    vi.mocked(api.getAdvisorProject).mockResolvedValue(envelope);
    vi.mocked(api.selectAdvisorScenario).mockResolvedValue({
      ...envelope,
      persistenceVersion: 5,
      project: { ...envelope.project, state: 'provisional_choice', activeScenarioId: scenario.id },
    });
    const print = vi.fn();
    Object.defineProperty(window, 'print', { configurable: true, value: print });

    render(<AdvisorLifeProjectPage />);

    expect((await screen.findAllByText(scenario.title)).length).toBeGreaterThan(0);
    expect(screen.getByText('Les intérêts déclarés correspondent à cette option.')).toBeInTheDocument();
    expect(screen.getAllByText('Frais et calendrier non publiés.')).not.toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Université Marien Ngouabi — programmes FST' })).toHaveAttribute('href', 'https://example.test/source');
    expect(screen.getByRole('heading', { name: '3. Comparaison' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '4. Synthèse remise au jeune' })).toBeInTheDocument();
    expect(screen.getByText('Aucun choix provisoire')).toBeInTheDocument();
    expect(screen.getAllByText('Contacter la FST')).not.toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Retenir provisoirement cette option' }));
    await waitFor(() => expect(api.selectAdvisorScenario).toHaveBeenCalledWith(envelope, scenario.id));
    expect(await screen.findByText('Le choix est enregistré comme provisoire, pas comme décision définitive.')).toBeInTheDocument();
    expect(screen.getAllByText(scenario.title)).not.toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Imprimer ou enregistrer en PDF' }));
    expect(print).toHaveBeenCalledOnce();
  });
});