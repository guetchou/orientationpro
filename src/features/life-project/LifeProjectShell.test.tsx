import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LifeProjectShell from './LifeProjectShell';
import * as api from './lifeProjectApi';
import type { LoadedLifeProject } from './types';

vi.mock('./lifeProjectApi');

const loaded: LoadedLifeProject = {
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: 2,
  project: {
    id: 'project-1',
    ownerAccountId: 'account-1',
    title: 'Mon orientation',
    purpose: 'Clarifier mon orientation',
    state: 'exploration',
    activeScenarioId: null,
    scenarios: [{
      id: 'scenario-1',
      title: 'Explorer les métiers du numérique',
      description: 'Une piste à vérifier localement.',
      horizon: null,
      status: 'exploring',
      optionType: 'occupation',
      assumptions: [],
      barriers: [],
      supports: [],
      missingInformation: ['Vérifier les formations accessibles'],
      uncertainty: { level: 'high', reasons: ['Données déclarées'] },
    }],
    actionPlans: [],
    missingInformation: ['Préciser les contraintes de mobilité'],
    uncertainty: { level: 'high', reasons: ['Début du parcours'] },
    createdAt: '2026-07-29T08:00:00.000Z',
    updatedAt: '2026-07-29T08:30:00.000Z',
  },
};

describe('LifeProjectShell', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    vi.mocked(api.getLifeProjectCapability).mockResolvedValue({
      id: 'life-project.core-v1',
      status: 'experimental',
      configured: true,
      publicLimitations: [],
    });
    vi.mocked(api.listLifeProjects).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reste masqué si le flag frontend est inactif', () => {
    const { container } = render(<LifeProjectShell frontendEnabled={false} />);
    expect(container).toBeEmptyDOMElement();
    expect(api.getLifeProjectCapability).not.toHaveBeenCalled();
  });

  it('reste masqué si la capacité serveur est désactivée', async () => {
    vi.mocked(api.getLifeProjectCapability).mockResolvedValue({
      id: 'life-project.core-v1',
      status: 'disabled',
      configured: false,
      publicLimitations: [],
    });
    const { container } = render(<LifeProjectShell frontendEnabled />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(api.listLifeProjects).not.toHaveBeenCalled();
  });

  it('reprend le projet le plus récemment mis à jour', async () => {
    vi.mocked(api.listLifeProjects).mockResolvedValue([{
      id: 'project-1',
      title: 'Mon orientation',
      purpose: 'Clarifier mon orientation',
      state: 'exploration',
      activeScenarioId: null,
      scenarioCount: 1,
      actionPlanCount: 0,
      persistenceVersion: 2,
      createdAt: loaded.project.createdAt,
      updatedAt: loaded.project.updatedAt,
    }]);
    vi.mocked(api.getLifeProject).mockResolvedValue(loaded);

    render(<LifeProjectShell frontendEnabled />);

    expect(await screen.findByRole('heading', { name: 'Mon orientation' })).toBeInTheDocument();
    expect(screen.getByText('Explorer les métiers du numérique')).toBeInTheDocument();
    expect(api.getLifeProject).toHaveBeenCalledWith('project-1');
  });

  it('crée et affiche un projet depuis le triage', async () => {
    vi.mocked(api.createProjectFromTriage).mockResolvedValue(loaded);
    render(<LifeProjectShell frontendEnabled />);

    await screen.findByRole('heading', { name: /commençons par votre situation/i });
    fireEvent.click(screen.getByLabelText('Je cherche un emploi'));
    fireEvent.click(screen.getByLabelText('Clarifier mon orientation'));
    fireEvent.click(screen.getByRole('button', { name: 'Créer mon parcours' }));

    await waitFor(() => expect(api.createProjectFromTriage).toHaveBeenCalledWith({
      situation: 'Je cherche un emploi',
      need: 'Clarifier mon orientation',
      title: 'Clarifier mon orientation',
    }));
    expect(await screen.findByRole('heading', { name: 'Mon orientation' })).toBeInTheDocument();
  });

  it('signale le mode hors ligne et empêche la sauvegarde', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    render(<LifeProjectShell frontendEnabled />);

    expect(await screen.findByText(/vous êtes hors ligne/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer mon parcours' })).toBeDisabled();
    expect(api.getLifeProjectCapability).not.toHaveBeenCalled();
  });

  it('affiche une erreur explicite et permet de réessayer', async () => {
    vi.mocked(api.getLifeProjectCapability)
      .mockRejectedValueOnce(new Error('Service indisponible'))
      .mockResolvedValueOnce({
        id: 'life-project.core-v1',
        status: 'experimental',
        configured: true,
        publicLimitations: [],
      });
    render(<LifeProjectShell frontendEnabled />);

    expect(await screen.findByText('Service indisponible')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(await screen.findByRole('heading', { name: /commençons par votre situation/i })).toBeInTheDocument();
  });
});
