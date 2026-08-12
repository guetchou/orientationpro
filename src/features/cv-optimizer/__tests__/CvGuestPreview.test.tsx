import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CvGuestPreview } from '../CvGuestPreview';

describe('CvGuestPreview', () => {
  it('montre un apercu utile puis reserve le rapport, export et sauvegarde au compte', () => {
    render(
      <MemoryRouter>
        <CvGuestPreview
          preview={{
            kind: 'cv-preview-v1',
            score: 76,
            targetScore: 63,
            sectionsPresent: 4,
            sectionsTotal: 6,
            highlights: ['Coordonnées détectées', 'Expériences structurées'],
            priorityAction: 'Ajoute des résultats chiffrés à tes expériences.',
            authenticationRequiredFor: ['full_report', 'export', 'save'],
          }}
          onRestart={() => undefined}
        />
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
});
