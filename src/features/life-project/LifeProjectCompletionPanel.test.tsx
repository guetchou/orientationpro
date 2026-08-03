import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LifeProjectCompletionPanel from './LifeProjectCompletionPanel';
import * as api from './advisor-api';
import type { AdvisorEnvelope } from './advisor-types';

vi.mock('./advisor-api', () => ({
  LIFE_PROJECT_UPDATED_EVENT: 'makoki:life-project-updated',
  getAdvisorProject: vi.fn(),
  listAdvisorProjects: vi.fn(),
}));

const scenario = {
  id: 'scenario-1',
  optionId: 'option-1',
  title: 'Licence professionnelle Informatique et Réseaux — UMNG',
  category: 'education',
  positioning: 'priority' as const,
  rank: 1,
  fitScore: 82,
  confidence: 'medium' as const,
  reasons: [{ signal: 'interests', explanation: 'Les intérêts déclarés correspondent à cette option.', score: 90 }],
  strengths: ['Intérêt pour le numérique'],
  conditions: ['Confirmer les modalités 2026-2027.'],
  risks: ['Frais à vérifier.'],
  blockingFactors: [],
  missingInformation: [],
  durationMonths: 24,
  cost: { amount: 250000, currency: 'XAF', fundingAvailable: false, status: 'known' as const },
  calendar: {
    status: 'open' as const,
    nextStartAt: '2026-10-01T00:00:00.000Z',
    applicationDeadlineAt: '2026-09-01T00:00:00.000Z',
  },
  modes: ['presentiel'],
  geographies: ['Brazzaville'],
  entryLevel: { minimumRank: 4, label: 'Baccalauréat', status: 'to_confirm' as const },
  localOpportunities: [],
  sourceReferences: [],
  firstActions: [{
    title: 'Contacter la FST',
    deadlineDays: 7,
    expectedEvidence: 'Réponse datée sur les conditions et les frais',
  }],
  alternatives: [],
  scoreBreakdown: {},
  penalties: {},
  generatedAt: '2026-08-02T10:00:00.000Z',
  engineVersion: 'makoki-life-recommendation-v1',
};

const envelope: AdvisorEnvelope = {
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: 5,
  project: {
    id: 'project-1',
    ownerAccountId: 'account-1',
    title: 'Mon projet d’avenir',
    purpose: 'Construire un projet réaliste',
    state: 'provisional_choice',
    activeScenarioId: scenario.id,
    scenarios: [{
      id: scenario.id,
      title: scenario.title,
      description: scenario.reasons[0].explanation,
      status: 'active',
      optionType: 'education',
      missingInformation: [],
      uncertainty: { level: 'medium', reasons: [] },
    }],
    actionPlans: [],
    diagnostic: null,
    recommendation: {
      schemaVersion: 'makoki-life-recommendation-output-v1',
      engineVersion: 'makoki-life-recommendation-v1',
      status: 'complete',
      generatedAt: '2026-08-02T10:00:00.000Z',
      diagnosticSummary: {},
      scenarios: [scenario],
      nonPrioritized: [],
      missingInformation: [],
    },
    missingInformation: [],
    uncertainty: { level: 'medium', reasons: [] },
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
};

describe('LifeProjectCompletionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listAdvisorProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [{
        id: envelope.project.id,
        title: envelope.project.title,
        state: envelope.project.state,
        persistenceVersion: envelope.persistenceVersion,
        scenarioCount: 1,
      }],
    });
    vi.mocked(api.getAdvisorProject).mockResolvedValue(envelope);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('affiche calendrier, organisation, synthèse et impression PDF', async () => {
    const print = vi.fn();
    Object.defineProperty(window, 'print', { configurable: true, value: print });

    render(<LifeProjectCompletionPanel />);

    expect(await screen.findByRole('heading', { name: 'Comparaison de tes pistes' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Calendrier' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Organisation' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Lieu ou disponibilité' })).toBeInTheDocument();
    expect(screen.getAllByText('24 mois').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/250.*000 XAF/u).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/candidature avant le 01\/09\/2026/u).length).toBeGreaterThan(0);
    expect(screen.getAllByText('presentiel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Brazzaville').length).toBeGreaterThan(0);

    expect(document.querySelector('#life-project-summary')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ta piste retenue et la première action' })).toBeInTheDocument();
    expect(screen.getAllByText('Piste retenue').length).toBeGreaterThan(0);
    expect(screen.getByText('Contacter la FST')).toBeInTheDocument();
    expect(screen.getByText(/Résultat attendu/u)).toBeInTheDocument();
    expect(screen.getByText(/Réponse datée sur les conditions et les frais/u)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Imprimer ou télécharger en PDF' }));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('se met à jour lorsque le parcours publie une nouvelle enveloppe', async () => {
    render(<LifeProjectCompletionPanel />);
    expect((await screen.findAllByText(scenario.title)).length).toBeGreaterThan(0);

    const updated: AdvisorEnvelope = {
      ...envelope,
      project: {
        ...envelope.project,
        title: 'Projet mis à jour',
      },
    };
    window.dispatchEvent(new CustomEvent('makoki:life-project-updated', { detail: updated }));

    expect(await screen.findByText('Projet mis à jour')).toBeInTheDocument();
  });
});
