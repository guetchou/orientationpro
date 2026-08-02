import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { ApiError } from '@/lib/apiClient';
import type { RiasecResult } from '@/types/riasec';
import type { AdaptiveProfilePayload } from '@/features/profile/profileApi';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('@/features/life-project/config', () => ({
  isLifeProjectFrontendEnabled: () => false,
}));

const listRiasecResultsMock = vi.fn();
vi.mock('@/services/riasecApi', () => ({
  listRiasecResults: (...args: unknown[]) => listRiasecResultsMock(...args),
}));

const getAdaptiveProfileMock = vi.fn();
vi.mock('@/features/profile/profileApi', () => ({
  getAdaptiveProfile: () => getAdaptiveProfileMock(),
}));

let mockUser: { id: string; email: string; role?: string; displayName?: string } | null = {
  id: 'user-1',
  email: 'amina@example.com',
  role: 'user',
  displayName: 'Amina',
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, profile: null }),
}));

const buildResult = (overrides: Partial<RiasecResult> = {}): RiasecResult =>
  ({
    id: 'result-1',
    resultType: 'riasec',
    displayCode: 'RIA',
    primaryCode: 'RIA',
    createdAt: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }) as RiasecResult;

const buildProfilePayload = (completionPercent: number | null): AdaptiveProfilePayload =>
  ({
    profile: completionPercent === null ? null : { completion_percent: completionPercent },
    education: [],
    skills: [],
    hypotheses: [],
  }) as unknown as AdaptiveProfilePayload;

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>,
  );

beforeEach(() => {
  navigateMock.mockReset();
  listRiasecResultsMock.mockReset();
  getAdaptiveProfileMock.mockReset();
  getAdaptiveProfileMock.mockResolvedValue(buildProfilePayload(0));
  mockUser = { id: 'user-1', email: 'amina@example.com', role: 'user', displayName: 'Amina' };
});

describe('Dashboard', () => {
  it('propose de commencer le parcours et affiche un état vide honnête', async () => {
    listRiasecResultsMock.mockResolvedValue([]);
    renderDashboard();

    expect(await screen.findByText('Bienvenue, Amina')).toBeInTheDocument();
    expect(screen.getByText(/Découvre ce qui t’intéresse/)).toBeInTheDocument();
    expect(await screen.findByText(/Tu n’as pas encore de résultat enregistré/)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('À commencer')).toBeInTheDocument();
  });

  it('charge les résultats réels et propose les métiers lorsque le profil est complet', async () => {
    getAdaptiveProfileMock.mockResolvedValue(buildProfilePayload(100));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    expect(await screen.findByText('Résultat 1')).toBeInTheDocument();
    expect(screen.queryByText('RIA')).not.toBeInTheDocument();
    expect(await screen.findByText('100 %')).toBeInTheDocument();
    expect(screen.getByText(/Explore les métiers/)).toBeInTheDocument();
    expect(listRiasecResultsMock).toHaveBeenCalledWith(50, 0);
  });

  it('continue de proposer le profil tant que le pourcentage backend reste incomplet', async () => {
    getAdaptiveProfileMock.mockResolvedValue(buildProfilePayload(40));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    expect(await screen.findByText(/Continue ton profil \(40 % renseigné\)/)).toBeInTheDocument();
    expect(await screen.findByText('40 %')).toBeInTheDocument();
    expect(screen.queryByText(/Explore les métiers/)).not.toBeInTheDocument();
  });

  it('n’invente pas de pourcentage lorsque le profil ne peut pas être chargé', async () => {
    getAdaptiveProfileMock.mockRejectedValue(new ApiError('indisponible', 503));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    await screen.findByText('Résultat 1');
    expect(await screen.findByText('Non disponible')).toBeInTheDocument();
    expect(screen.getByText(/Complète ton profil/)).toBeInTheDocument();
  });

  it('permet de réessayer après un échec de chargement des résultats', async () => {
    listRiasecResultsMock
      .mockRejectedValueOnce(new ApiError('Service indisponible', 503))
      .mockResolvedValueOnce([buildResult()]);
    renderDashboard();

    expect(await screen.findByText('Tes résultats ne peuvent pas être chargés pour le moment.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Réessayer/ }));

    await waitFor(() => expect(screen.getByText('Résultat 1')).toBeInTheDocument());
    expect(listRiasecResultsMock).toHaveBeenCalledTimes(2);
  });

  it('ouvre le parcours unifié depuis un résultat enregistré', async () => {
    listRiasecResultsMock.mockResolvedValue([buildResult({ id: 'result-42' })]);
    renderDashboard();

    fireEvent.click(await screen.findByText('Résultat 1'));
    expect(navigateMock).toHaveBeenCalledWith('/parcours');
  });
});
