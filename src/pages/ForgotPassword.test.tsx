import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestPasswordReset } from '@/lib/apiClient';
import ForgotPassword from './ForgotPassword';

vi.mock('@/lib/apiClient', () => ({
  requestPasswordReset: vi.fn(),
}));

describe('récupération du Compte', () => {
  beforeEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  it('demande un lien Auth V1 et affiche toujours une confirmation neutre', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), {
      target: { value: 'personne@example.cg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer le lien' }));

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith('personne@example.cg');
    });
    expect(await screen.findByText('Vérifie ta boîte mail')).toBeInTheDocument();
    expect(
      screen.getByText(/Si un compte est associé à cette adresse/),
    ).toBeInTheDocument();
  });
});
