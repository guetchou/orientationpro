import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LifeProjectPage from './LifeProjectPage';
import * as api from './api';
import type { LifeProjectEnvelope } from './types';

vi.mock('./api', () => ({
  createProjectFromTriage: vi.fn(),
  executeLifeProjectSyncCommand: vi.fn(),
  getCapabilityRegistry: vi.fn(),
  getLifeProject: vi.fn(),
  getLifeProjectOrchestration: vi.fn(),
  getLifeProjectProgress: vi.fn(),
  listLifeProjects: vi.fn(),
  moveLifeProjectToClarification: vi.fn(),
  selectLifeProjectScenario: vi.fn(),
  transitionLifeProject: vi.fn(),
  createLifeProjectActionPlan: vi.fn(),
  updateLifeProjectAction: vi.fn(),
}));

const renderPage = () => render(<MemoryRouter><LifeProjectPage /></MemoryRouter>);

const envelope: LifeProjectEnvelope = {
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: 2,
  project: {
    id: 'project-1',
    ownerAccountId: 'account-1',
    title: 'Clarifier ma direction',
    purpose: 'Situation déclarée : lycee.',
    state: 'exploration',
    activeScenarioId: null,
    scenarios: [{
      id: 'scenario-1',
      title: 'Études et formation',
      description: 'Première piste à vérifier.',
      status: 'candidate',
      optionType: 'education',
      missingInformation: ['Conditions d’accès'],
      uncertainty: { level: 'high', reasons: ['À vérifier'] },
    }],
    actionPlans: [],
    missingInformation: ['Contraintes concrètes'],
    uncertainty: { level: 'high', reasons: ['Projet initial'] },
    updatedAt: '2026-07-29T08:00:00.000Z',
  },
};

const advancedEnvelope: LifeProjectEnvelope = {
  ...envelope,
  persistenceVersion: 6,
  project: {
    ...envelope.project,
    state: 'action',
    activeScenarioId: 'scenario-1',
    missingInformation: ['Budget disponible'],
    actionPlans: [{
      id: 'plan-1',
      scenarioId: 'scenario-1',
      title: 'Vérifier la piste',
      status: 'active',
      missingInformation: [],
      items: [
        {
          id: 'action-1',
          title: 'Contacter une formation',
          description: null,
          status: 'completed',
          dueAt: null,
          completedAt: '2026-07-29T09:00:00.000Z',
          evidenceIds: [],
          blockingReasons: [],
        },
        {
          id: 'action-2',
          title: 'Comparer les conditions',
          description: null,
          status: 'in_progress',
          dueAt: null,
          evidenceIds: [],
          blockingReasons: [],
        },
        {
          id: 'action-3',
          title: 'Réunir les documents',
          description: null,
          status: 'blocked',
          dueAt: null,
          evidenceIds: [],
          blockingReasons: ['Document manquant'],
        },
      ],
    }],
    updatedAt: '2026-07-29T10:30:00.000Z',
  },
};

const enableCapability = () => {
  vi.mocked(api.getCapabilityRegistry).mockResolvedValue({
    schemaVersion: 'makoki-capability-registry-v1',
    capabilities: [{
      id: 'life-project.core-v1',
      status: 'experimental',
      configured: true,
      publicLimitations: [],
    }],
  });
};

const loadExistingProject = (loadedEnvelope = envelope) => {
  vi.mocked(api.listLifeProjects).mockResolvedValue({
    schemaVersion: 'makoki-life-project-api-v1',
    projects: [{
      id: 'project-1',
      title: loadedEnvelope.project.title,
      state: loadedEnvelope.project.state,
      persistenceVersion: loadedEnvelope.persistenceVersion,
    }],
  });
  vi.mocked(api.getLifeProject).mockResolvedValue(loadedEnvelope);
};

describe('LifeProjectPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
    vi.mocked(api.getLifeProjectOrchestration).mockResolvedValue({
      schemaVersion: 'makoki-life-project-orchestration-api-v1',
      persistenceVersion: 2,
      orchestration: {
        schemaVersion: 'makoki-life-path-orchestration-v1',
        projectId: 'project-1',
        projectState: 'exploration',
        generatedAt: '2026-07-29T08:00:00.000Z',
        signals: {
          missingInformationCount: 1,
          uncertaintyLevel: 'high',
          scenarioCount: 1,
          activeScenarioId: null,
          actions: { total: 0, planned: 0, in_progress: 0, completed: 0, blocked: 0, cancelled: 0 },
        },
        completedModuleIds: [],
        skippedModuleIds: [],
        recommendations: [{
          moduleId: 'life-project.clarification',
          label: 'Clarifier la situation',
          capabilityId: 'life-project.core-v1',
          availability: 'available',
          capabilityStatus: 'experimental',
          completion: 'pending',
          priority: 1,
          reasons: [{ code: 'MISSING', message: 'Une information reste à préciser.' }],
          blockers: [],
          publicLimitations: ['Cette proposition ne décide pas à la place de la personne.'],
        }],
        nextModuleId: 'life-project.clarification',
        nextModuleReasons: [{ code: 'MISSING', message: 'Une information reste à préciser.' }],
      },
    });
    vi.mocked(api.getLifeProjectProgress).mockResolvedValue({
      schemaVersion: 'makoki-life-project-progress-api-v1',
      persistenceVersion: 2,
      progress: {
        schemaVersion: 'makoki-life-project-progress-v1',
        projectId: 'project-1',
        state: 'not_started',
        counts: { planned: 0, in_progress: 0, completed: 0, blocked: 0, cancelled: 0 },
        nextActions: [],
        completedActions: [],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it('n’appelle pas l’API projet lorsque la capacité est désactivée', async () => {
    vi.mocked(api.getCapabilityRegistry).mockResolvedValue({
      schemaVersion: 'makoki-capability-registry-v1',
      capabilities: [{
        id: 'life-project.core-v1',
        status: 'disabled',
        configured: false,
        publicLimitations: [],
      }],
    });

    renderPage();

    expect(await screen.findByText('Parcours MAKOKI non activé')).toBeInTheDocument();
    expect(api.listLifeProjects).not.toHaveBeenCalled();
  });

  it('affiche le triage court, sauvegarde chaque réponse et annonce la sauvegarde', async () => {
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });

    renderPage();

    expect(await screen.findByTestId('life-project-triage')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ma situation actuelle'), { target: { value: 'lycee' } });
    fireEvent.change(screen.getByLabelText('Mon besoin principal'), { target: { value: 'studies' } });

    const saved = JSON.parse(localStorage.getItem('makoki.life-project.triage-draft.v1') || '{}');
    expect(saved.situation).toBe('lycee');
    expect(saved.need).toBe('studies');
    expect(screen.getByRole('status')).toHaveTextContent('Brouillon enregistré sur cet appareil');
  });

  it('conserve les réponses déjà saisies lorsque la validation échoue', async () => {
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });

    renderPage();
    await screen.findByTestId('life-project-triage');

    fireEvent.change(screen.getByLabelText('Ma situation actuelle'), { target: { value: 'lycee' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon premier projet' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('réponses déjà saisies sont conservées');
    expect(screen.getByLabelText('Ma situation actuelle')).toHaveValue('lycee');
    expect(localStorage.getItem('makoki.life-project.triage-draft.v1')).toContain('lycee');
    expect(api.createProjectFromTriage).not.toHaveBeenCalled();
  });

  it('reprend le dernier projet du compte et affiche scénarios et prochaines étapes', async () => {
    enableCapability();
    loadExistingProject();

    renderPage();

    expect(await screen.findByTestId('life-project-shell')).toBeInTheDocument();
    expect(screen.getByText('Études et formation')).toBeInTheDocument();
    expect(screen.getByText('Choisir provisoirement un scénario à vérifier.')).toBeInTheDocument();
    expect(localStorage.getItem('makoki.life-project.last-readable.v1')).toContain('project-1');
  });

  it('montre la valeur accumulée sans pourcentage de réussite', async () => {
    enableCapability();
    loadExistingProject(advancedEnvelope);

    renderPage();

    const summary = await screen.findByTestId('life-project-progress-summary');
    expect(summary).toHaveTextContent('Mon avancée');
    expect(summary).toHaveTextContent('Action');
    expect(summary).toHaveTextContent('Études et formation');
    expect(summary).toHaveTextContent('1 terminée(s) · 1 en cours');
    expect(summary).toHaveTextContent('1 information(s)');
    expect(summary).toHaveTextContent('1 action(s) sont bloquée(s)');
    expect(summary).toHaveTextContent('Projet créé et disponible pour la reprise');
    expect(summary).not.toHaveTextContent('%');
  });

  it('crée un projet depuis le triage puis efface seulement le brouillon confirmé', async () => {
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });
    vi.mocked(api.createProjectFromTriage).mockResolvedValue(envelope);

    renderPage();
    await screen.findByTestId('life-project-triage');

    fireEvent.change(screen.getByLabelText('Ma situation actuelle'), { target: { value: 'lycee' } });
    fireEvent.change(screen.getByLabelText('Mon besoin principal'), { target: { value: 'studies' } });
    fireEvent.change(screen.getByLabelText('Où envisager les possibilités ?'), { target: { value: 'compare' } });
    fireEvent.change(screen.getByLabelText('À quel horizon souhaitez-vous avancer ?'), { target: { value: 'explore' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon premier projet' }));

    await waitFor(() => expect(api.createProjectFromTriage).toHaveBeenCalledWith(expect.objectContaining({
      situation: 'lycee',
      need: 'studies',
      mobility: 'compare',
      urgency: 'explore',
    })));
    expect(await screen.findByTestId('life-project-shell')).toBeInTheDocument();
    expect(localStorage.getItem('makoki.life-project.triage-draft.v1')).toBeNull();
  });

  it('affiche le cache en lecture seule lorsque la capacité distante est inaccessible', async () => {
    localStorage.setItem('makoki.life-project.last-readable.v1', JSON.stringify(envelope));
    vi.mocked(api.getCapabilityRegistry).mockRejectedValue(new Error('réseau indisponible'));

    renderPage();

    expect(await screen.findByTestId('life-project-shell')).toBeInTheDocument();
    expect(screen.getByText(/Version locale en lecture seule/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('dernière version enregistrée');
  });

  it('explique pourquoi la création est indisponible hors ligne sans perdre le brouillon', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });

    renderPage();
    await screen.findByTestId('life-project-triage');
    fireEvent.change(screen.getByLabelText('Ma situation actuelle'), { target: { value: 'lycee' } });

    expect(screen.getByText(/La création est indisponible hors ligne/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer mon premier projet' })).toBeDisabled();
    expect(localStorage.getItem('makoki.life-project.triage-draft.v1')).toContain('lycee');
  });

  it('met en file un choix hors ligne uniquement après confirmation explicite', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    enableCapability();
    loadExistingProject();

    renderPage();
    await screen.findByTestId('life-project-shell');
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer ce choix pour la reprise' }));

    await waitFor(() => {
      const raw = localStorage.getItem('makoki.life-project.sync-queue.v1');
      expect(raw).toContain('select_scenario');
      expect(raw).toContain('scenario-1');
    });
    expect(api.selectLifeProjectScenario).not.toHaveBeenCalled();
    expect(await screen.findByTestId('life-project-sync-queue')).toHaveTextContent('1 modification');
  });

  it('affiche la prochaine étape, ses raisons, sa limite et les catégories de connaissance', async () => {
    enableCapability();
    loadExistingProject();

    renderPage();

    expect(await screen.findByText('Clarifier la situation')).toBeInTheDocument();
    expect(screen.getByText(/Une information reste à préciser/)).toBeInTheDocument();
    expect(screen.getByText(/Cette proposition ne décide pas/)).toBeInTheDocument();
    expect(screen.getByText('Déclarations de départ')).toBeInTheDocument();
    expect(screen.getByText('Hypothèses à vérifier')).toBeInTheDocument();
    expect(screen.getByText(/Informations vérifiées/)).toBeInTheDocument();
    expect(screen.getByText('Inconnues actuelles')).toBeInTheDocument();
  });

  it('permet le passage explicite et la réorientation sans score ni métier idéal', async () => {
    enableCapability();
    loadExistingProject();
    vi.mocked(api.transitionLifeProject).mockResolvedValue({
      ...envelope,
      persistenceVersion: 3,
      project: { ...envelope.project, state: 'reorientation' },
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Passer explicitement' }));
    await waitFor(() => expect(api.getLifeProjectOrchestration).toHaveBeenCalledWith(
      'project-1',
      [],
      ['life-project.clarification'],
    ));

    fireEvent.click(screen.getByRole('button', { name: 'Demander une réorientation' }));
    await waitFor(() => expect(api.transitionLifeProject).toHaveBeenCalledWith(
      'project-1',
      'reorientation',
      2,
      undefined,
      expect.stringMatching(/réorientation/),
    ));
    expect(screen.queryByText(/métier idéal|score de réussite/i)).not.toBeInTheDocument();
  });
});
