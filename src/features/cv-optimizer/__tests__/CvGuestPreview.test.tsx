import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CvGuestPreview } from '../CvGuestPreview';

const preview = {
  kind: 'cv-preview-v1' as const,
  score: 76,
  targetScore: 63,
  sectionsPresent: 4,
  sectionsTotal: 6,
  highlights: ['Coordonnées détectées', 'Expériences structurées'],
  priorityAction: 'Ajoute des résultats chiffrés à tes expériences.',
  authenticationRequiredFor: ['full_report', 'export', 'save'] as const,
};

const AuthStateProbe = () => {
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  return <div data-testid="auth-return-path">{from || 'missing'}</div>;
};

describe('CvGuestPreview', () => {
  it('montre un apercu utile puis reserve le rapport, export et sauvegarde au compte', () => {
    render(
      <MemoryRouter>
        <CvGuestPreview preview={preview} onRestart={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /aperçu gratuit/i })).toBeInTheDocument();
    expect(screen.getByText('76/100')).toBeInTheDocument();
    expect(screen.getByText(/4 sections sur 6/i)).toBeInTheDocument();
    expect(screen.getByText(/rapport complet, l’export et la sauvegarde/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /créer mon compte/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /me connecter/i })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: /télécharger/i })).not.toBeInTheDocument();
  });

  it('conserve cv-optimizer comme destination apres connexion', () => {
    render(
      <MemoryRouter initialEntries={['/cv-optimizer']}>
        <Routes>
          <Route path="/cv-optimizer" element={<CvGuestPreview preview={preview} onRestart={() => undefined} />} />
          <Route path="/login" element={<AuthStateProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: /me connecter/i }));
    expect(screen.getByTestId('auth-return-path')).toHaveTextContent('/cv-optimizer');
  });
});
