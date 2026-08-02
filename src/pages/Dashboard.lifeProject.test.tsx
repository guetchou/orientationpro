import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { RiasecResult } from '@/types/riasec';
import type { AdaptiveProfilePayload } from '@/features/profile/profileApi';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('@/features/life-project/config', () => ({
  isLifeProjectFrontendEnabled: () => true,
}));

vi.mock('@/services/riasecApi', () => ({
  listRiasecResults: () =>
    Promise.resolve([
      { id: 'r1', resultType: 'riasec', displayCode: 'RIA', primaryCode: 'RIA', createdAt: '2026-07-01T10:00:00.000Z' } as RiasecResult,
    ]),
}));

vi.mock('@/features/profile/profileApi', () => ({
  getAdaptiveProfile: () =>
    Promise.resolve({ profile: { completion_percent: 100 }, education: [], skills: [], hypotheses: [] } as unknown as AdaptiveProfilePayload),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'amina@example.com', role: 'user', displayName: 'Amina' }, profile: null }),
}));

describe('Dashboard with Life Project flag enabled', () => {
  it('propose de poursuivre le parcours lorsque le questionnaire et le profil sont terminés', async () => {
    const { default: Dashboard } = await import('./Dashboard');
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Poursuis ton projet/)).toBeInTheDocument();
    expect(screen.queryByText(/Explore les métiers/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mon parcours/ })).toBeInTheDocument();
  });
});
