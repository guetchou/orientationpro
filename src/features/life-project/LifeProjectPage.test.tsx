import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LifeProjectPage from './LifeProjectPage';
import * as api from './api';
import type { LifeProjectEnvelope } from './types';

vi.mock('./api', () => ({
  createProjectFromTriage: vi.fn(),
  executeLifeProjectSyncCommand: vi.fn(),
  getCapabilityRegistry: vi.fn(),
  getLifeProject: vi.fn(),
  listLifeProjects: vi.fn(),
  moveLifeProjectToClarification: vi.fn(),
  selectLifeProjectScenario: vi.fn(),
}));

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

const loadExistingProject = () => {
  vi.mocked(api.listLifeProjects).mockResolvedValue({
    schemaVersion: 'makoki-life-project-api-v1',
    projects: [{
      id: 'project-1',
      title: envelope.project.title,
      state: 'exploration',
      persistenceVersion: 2,
    }],
  });
  vi.mocked(api.getLifeProject).mockResolvedValue(envelope);
};

describe('LifeProjectPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
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

    render(<LifeProjectPage />);

    expect(await screen.findByText('Parcours MAKOKI non activé')).toBeInTheDocument();
    expect(api.listLifeProjects).not.toHaveBeenCalled();
  });

  it('affiche le triage court et conserve chaque réponse dans le brouillon local', async () => {
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });

    render(<LifeProjectPage />);

    expect(await screen.findByTestId('life-project-triage')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ma situation actuelle'), { target: { value: 'lycee' } });
    fireEvent.change(screen.getByLabelText('Mon besoin principal'), { target: { value: 'studies' } });

    const saved = JSON.parse(localStorage.getItem('makoki.life-project.triage-draft.v1') || '{}');
    expect(saved.situation).toBe('lycee');
    expect(saved.need).toBe('studies');
  });

  it('reprend le dernier projet du compte et affiche scénarios et prochaines étapes', async () => {
    enableCapability();
    loadExistingProject();

    render(<LifeProjectPage />);

    expect(await screen.findByTestId('life-project-shell')).toBeInTheDocument();
    expect(screen.getByText('Études et formation')).toBeInTheDocument();
    expect(screen.getByText('Choisir provisoirement un scénario à vérifier.')).toBeInTheDocument();
    expect(localStorage.getItem('makoki.life-project.last-readable.v1')).toContain('project-1');
  });

  it('crée un projet depuis le triage puis efface seulement le brouillon confirmé', async () => {
    enableCapability();
    vi.mocked(api.listLifeProjects).mockResolvedValue({
      schemaVersion: 'makoki-life-project-api-v1',
      projects: [],
    });
    vi.mocked(api.createProjectFromTriage).mockResolvedValue(envelope);

    render(<LifeProjectPage />);
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

    render(<LifeProjectPage />);

    expect(await screen.findByTestId('life-project-shell')).toBeInTheDocument();
    expect(screen.getByText(/Version locale en lecture seule/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('dernière version enregistrée');
  });

  it('met en file un choix hors ligne uniquement après confirmation explicite', async () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    enableCapability();
    loadExistingProject();

    render(<LifeProjectPage />);
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
});
