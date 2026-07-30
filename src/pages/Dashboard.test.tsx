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
  it('shows the "first test" next step and an honest empty state when nothing is completed yet', async () => {
    listRiasecResultsMock.mockResolvedValue([]);
    renderDashboard();

    expect(await screen.findByText('Bienvenue, Amina !')).toBeInTheDocument();
    expect(screen.getByText(/Passez votre premier test/)).toBeInTheDocument();
    expect(await screen.findByText(/Aucun résultat enregistré/)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('loads real results via the RIASEC API, and only stops suggesting profile work once completion is genuinely 100%', async () => {
    getAdaptiveProfileMock.mockResolvedValue(buildProfilePayload(100));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    expect(await screen.findByText('Test RIASEC — RIA')).toBeInTheDocument();
    expect(screen.getByText('RIA')).toBeInTheDocument();
    expect(await screen.findByText('100 %')).toBeInTheDocument();
    expect(screen.getByText(/Explorez les métiers/)).toBeInTheDocument();
    expect(listRiasecResultsMock).toHaveBeenCalledWith(50, 0);
  });

  it('keeps suggesting profile completion using the real backend percentage, not an invented threshold', async () => {
    getAdaptiveProfileMock.mockResolvedValue(buildProfilePayload(40));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    expect(await screen.findByText(/Continuez votre profil \(40 % complété\)/)).toBeInTheDocument();
    expect(await screen.findByText('40 %')).toBeInTheDocument();
    expect(screen.queryByText(/Explorez les métiers/)).not.toBeInTheDocument();
  });

  it('does not fabricate a profile percentage when the profile call fails; falls back without a false number', async () => {
    getAdaptiveProfileMock.mockRejectedValue(new ApiError('indisponible', 503));
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    await screen.findByText('Test RIASEC — RIA');
    expect(await screen.findByText('—')).toBeInTheDocument();
    expect(screen.getByText(/Complétez votre profil/)).toBeInTheDocument();
  });

  it('recovers from a failed results load without losing the user in a dead end', async () => {
    listRiasecResultsMock
      .mockRejectedValueOnce(new ApiError('Service indisponible', 503))
      .mockResolvedValueOnce([buildResult()]);
    renderDashboard();

    expect(await screen.findByText('Service indisponible')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Réessayer/ }));

    await waitFor(() => expect(screen.getByText('Test RIASEC — RIA')).toBeInTheDocument());
    expect(listRiasecResultsMock).toHaveBeenCalledTimes(2);
  });

  it('opens a result on the real orientation results route, not the legacy dead route', async () => {
    listRiasecResultsMock.mockResolvedValue([buildResult({ id: 'result-42' })]);
    renderDashboard();

    fireEvent.click(await screen.findByText('Test RIASEC — RIA'));
    expect(navigateMock).toHaveBeenCalledWith('/orientation/results/result-42');
  });
});
