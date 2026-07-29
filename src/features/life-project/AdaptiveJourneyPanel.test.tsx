import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdaptiveJourneyPanel from './AdaptiveJourneyPanel';
import * as api from './api';
import type {
  LifeProjectEnvelope,
  LifeProjectOrchestrationEnvelope,
  LifeProjectProgressEnvelope,
} from './types';

vi.mock('./api', () => ({
  createLifeProjectActionPlan: vi.fn(),
  getLifeProjectOrchestration: vi.fn(),
  getLifeProjectProgress: vi.fn(),
  moveLifeProjectToClarification: vi.fn(),
  updateLifeProjectAction: vi.fn(),
}));

const envelope = (projectId = 'project-1'): LifeProjectEnvelope => ({
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: 2,
  project: {
    id: projectId,
    ownerAccountId: 'account-1',
    title: `Projet ${projectId}`,
    purpose: 'Situation déclarée par la personne.',
    state: 'exploration',
    activeScenarioId: null,
    scenarios: [{
      id: `scenario-${projectId}`,
      title: 'Études et formation',
      description: 'Une possibilité à vérifier.',
      status: 'candidate',
      optionType: 'education',
      assumptions: ['Une admission reste à confirmer.'],
      missingInformation: ['Conditions d’accès'],
      uncertainty: { level: 'high', reasons: ['Source locale manquante'] },
    }],
    actionPlans: [],
    missingInformation: ['Contraintes concrètes'],
    uncertainty: { level: 'high', reasons: ['Projet initial'] },
    updatedAt: '2026-07-29T08:00:00.000Z',
  },
});

const orchestration = (
  projectId: string,
  completedModuleIds: string[] = [],
  skippedModuleIds: string[] = [],
  moduleId = 'life-project.clarification',
): LifeProjectOrchestrationEnvelope => ({
  schemaVersion: 'makoki-life-project-orchestration-api-v1',
  persistenceVersion: 2,
  orchestration: {
    schemaVersion: 'makoki-life-path-orchestration-v1',
    projectId,
    projectState: 'exploration',
    generatedAt: '2026-07-29T08:00:00.000Z',
    signals: {
      missingInformationCount: 1,
      uncertaintyLevel: 'high',
      scenarioCount: 1,
      activeScenarioId: null,
      actions: { total: 0, planned: 0, in_progress: 0, completed: 0, blocked: 0, cancelled: 0 },
    },
    completedModuleIds,
    skippedModuleIds,
    recommendations: [{
      moduleId,
      label: moduleId === 'life-project.clarification' ? 'Clarifier la situation' : 'Module sans raccord',
      capabilityId: 'life-project.core-v1',
      availability: 'available',
      capabilityStatus: 'experimental',
      completion: skippedModuleIds.includes(moduleId)
        ? 'skipped'
        : completedModuleIds.includes(moduleId)
          ? 'completed'
          : 'pending',
      priority: 1,
      reasons: [{ code: 'MISSING', message: 'Une information reste à préciser.' }],
      blockers: [],
      publicLimitations: ['Cette proposition ne décide pas à la place de la personne.'],
    }],
    nextModuleId: skippedModuleIds.includes(moduleId) || completedModuleIds.includes(moduleId)
      ? null
      : moduleId,
    nextModuleReasons: [{ code: 'MISSING', message: 'Une information reste à préciser.' }],
  },
});

const progress = (projectId: string): LifeProjectProgressEnvelope => ({
  schemaVersion: 'makoki-life-project-progress-api-v1',
  persistenceVersion: 2,
  progress: {
    schemaVersion: 'makoki-life-project-progress-v1',
    projectId,
    state: 'not_started',
    counts: { planned: 0, in_progress: 0, completed: 0, blocked: 0, cancelled: 0 },
    nextActions: [],
    completedActions: [],
  },
});

const renderPanel = (project = envelope(), onEnvelope = vi.fn(), onMessage = vi.fn()) => render(
  <MemoryRouter>
    <AdaptiveJourneyPanel
      envelope={project}
      online
      cached={false}
      onEnvelope={onEnvelope}
      onMessage={onMessage}
    />
  </MemoryRouter>,
);

describe('AdaptiveJourneyPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(api.getLifeProjectOrchestration).mockImplementation(async (
      projectId,
      completedModuleIds = [],
      skippedModuleIds = [],
    ) => orchestration(projectId, completedModuleIds, skippedModuleIds));
    vi.mocked(api.getLifeProjectProgress).mockImplementation(async (projectId) => progress(projectId));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('commence réellement la clarification et renvoie le projet mis à jour', async () => {
    const current = envelope();
    const updated: LifeProjectEnvelope = {
      ...current,
      persistenceVersion: 3,
      project: { ...current.project, state: 'clarification' },
    };
    const onEnvelope = vi.fn();
    const onMessage = vi.fn();
    vi.mocked(api.moveLifeProjectToClarification).mockResolvedValue(updated);

    renderPanel(current, onEnvelope, onMessage);

    fireEvent.click(await screen.findByRole('button', { name: 'Commencer cette étape' }));

    await waitFor(() => expect(api.moveLifeProjectToClarification).toHaveBeenCalledWith('project-1', 2));
    expect(onEnvelope).toHaveBeenCalledWith(updated);
    expect(onMessage).toHaveBeenCalledWith(expect.stringMatching(/passé en clarification/));
  });

  it('isole les modules terminés et passés lors du changement de projet', async () => {
    localStorage.setItem(
      'makoki.life-project.modules.project-1.v1',
      JSON.stringify({ completed: [], skipped: ['life-project.clarification'] }),
    );
    localStorage.setItem(
      'makoki.life-project.modules.project-2.v1',
      JSON.stringify({ completed: ['profile.review'], skipped: [] }),
    );

    const onEnvelope = vi.fn();
    const onMessage = vi.fn();
    const view = renderPanel(envelope('project-1'), onEnvelope, onMessage);

    await waitFor(() => expect(api.getLifeProjectOrchestration).toHaveBeenCalledWith(
      'project-1',
      [],
      ['life-project.clarification'],
    ));

    view.rerender(
      <MemoryRouter>
        <AdaptiveJourneyPanel
          envelope={envelope('project-2')}
          online
          cached={false}
          onEnvelope={onEnvelope}
          onMessage={onMessage}
        />
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.getLifeProjectOrchestration).toHaveBeenCalledWith(
      'project-2',
      ['profile.review'],
      [],
    ));
  });

  it('permet de reprendre une étape passée et met à jour sa persistance locale', async () => {
    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Passer explicitement' }));
    expect(await screen.findByTestId('skipped-modules')).toHaveTextContent('Clarifier la situation');
    expect(localStorage.getItem('makoki.life-project.modules.project-1.v1')).toContain('life-project.clarification');

    fireEvent.click(screen.getByRole('button', { name: 'Reprendre Clarifier la situation' }));

    await waitFor(() => expect(api.getLifeProjectOrchestration).toHaveBeenLastCalledWith(
      'project-1',
      [],
      [],
    ));
    expect(localStorage.getItem('makoki.life-project.modules.project-1.v1')).toBe(JSON.stringify({
      completed: [],
      skipped: [],
    }));
  });

  it('désactive une recommandation sans action raccordée et explique la limite', async () => {
    vi.mocked(api.getLifeProjectOrchestration).mockResolvedValue(
      orchestration('project-1', [], [], 'life-project.future-module'),
    );

    renderPanel();

    const button = await screen.findByRole('button', { name: 'Commencer cette étape' });
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/pas encore raccordée/);
  });

  it('n’affiche aucun fait vérifié sans provenance raccordée', async () => {
    renderPanel();

    const verified = await screen.findByTestId('verified-information-unavailable');
    expect(verified).toHaveTextContent('capacité non raccordée');
    expect(verified).toHaveTextContent('source');
    expect(verified).toHaveTextContent('date de vérification');
    expect(verified).toHaveTextContent('périmètre géographique');
    expect(verified).toHaveTextContent('Aucune donnée n’est donc présentée comme vérifiée');
  });
});
