import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Header from '@/components/layout/Header';
import About from './About';
import Home from './Home';

vi.mock('@/hooks/usePageMeta', () => ({ usePageMeta: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));

beforeAll(() => {
  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds: readonly number[] = [];

    disconnect() {}
    observe() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
    unobserve() {}
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: IntersectionObserverMock,
  });
});

const renderWithRouter = (element: ReactNode) => render(
  <MemoryRouter>{element}</MemoryRouter>,
);

describe('public positioning', () => {
  it('speaks to visitor needs without exposing technical vocabulary or unsupported promises', () => {
    const view = renderWithRouter(<Home />);

    expect(screen.getByRole('heading', { name: /Découvre les métiers qui te correspondent, en 15 minutes/u })).toBeInTheDocument();
    expect(screen.getByText(/Tu n’as pas besoin d’avoir déjà toutes les réponses/u)).toBeInTheDocument();
    expect(screen.getByText(/La décision t’appartient/u)).toBeInTheDocument();

    const primaryLinks = screen.getAllByRole('link', { name: /Commencer mon projet/u });
    expect(primaryLinks[0]).toHaveAttribute('href', '/parcours');

    const publicCopy = view.container.textContent || '';
    for (const forbidden of [
      'RIASEC',
      'ESCO',
      'O*NET',
      'calcul côté serveur',
      'conseillers et coachs autorisés',
      'opportunités au Congo',
      'métiers et contexte locaux',
      'Ton métier idéal',
      'sans compte',
      'sans inscription',
    ]) {
      expect(publicCopy).not.toContain(forbidden);
    }
  });

  it('explains the approach and its limitations on the About page', () => {
    renderWithRouter(<About />);

    expect(screen.getByRole('heading', { name: /Mieux te connaître, explorer tes possibilités et avancer avec plus de clarté/u })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /D’où viennent les informations métiers/u })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ce que Makoki ne peut pas décider à ta place/u })).toBeInTheDocument();
    expect(screen.getByText(/La décision (?:finale )?(?:reste la tienne|t[’']appartient)/iu)).toBeInTheDocument();
  });

  it('uses Emploi in the public navigation on desktop and mobile', () => {
    renderWithRouter(<Header />);

    expect(screen.getByRole('link', { name: 'Emploi' })).toHaveAttribute('href', '/jobs');
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));

    const employmentLinks = screen.getAllByRole('link', { name: 'Emploi' });
    expect(employmentLinks).toHaveLength(2);
    employmentLinks.forEach((link) => expect(link).toHaveAttribute('href', '/jobs'));
    expect(screen.queryByRole('link', { name: 'Offres' })).not.toBeInTheDocument();
  });
});
