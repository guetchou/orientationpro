import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { ApiError } from '@/lib/apiClient';
import type { RiasecResult } from '@/types/riasec';

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

let mockUser: { id: string; email: string; role?: string; displayName?: string } | null = {
  id: 'user-1',
  email: 'amina@example.com',
  role: 'user',
  displayName: 'Amina',
};
let mockProfile: { bio?: string; interests?: string; experience?: string; education?: string } | null = null;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser, profile: mockProfile }),
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

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Dashboard />
    </MemoryRouter>,
  );

beforeEach(() => {
  navigateMock.mockReset();
  listRiasecResultsMock.mockReset();
  mockUser = { id: 'user-1', email: 'amina@example.com', role: 'user', displayName: 'Amina' };
  mockProfile = null;
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

  it('loads real results via the RIASEC API, and reflects completed profile + test in progression and next step', async () => {
    mockProfile = { bio: 'Passionnée par les sciences.' };
    listRiasecResultsMock.mockResolvedValue([buildResult()]);
    renderDashboard();

    expect(await screen.findByText('Test RIASEC — RIA')).toBeInTheDocument();
    expect(screen.getByText('RIA')).toBeInTheDocument();
    expect(screen.getByText(/Explorez les métiers/)).toBeInTheDocument();
    expect(listRiasecResultsMock).toHaveBeenCalledWith(50, 0);
  });

  it('recovers from a failed load without losing the user in a dead end', async () => {
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
