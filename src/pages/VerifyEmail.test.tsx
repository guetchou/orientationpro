import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch, requestEmailVerification } from '@/lib/apiClient';
import VerifyEmail from './VerifyEmail';

vi.mock('@/lib/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/apiClient')>();
  return {
    ...actual,
    apiFetch: vi.fn(),
    requestEmailVerification: vi.fn(),
  };
});

describe('vérification de l’adresse e-mail', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(requestEmailVerification).mockReset();
  });

  it('affiche le formulaire de renvoi quand le lien ne contient pas de jeton', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    expect(screen.getByText('Lien de vérification manquant')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse e-mail')).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it.each([
    ['invalide', 'jeton-invalide'],
    ['expiré', 'jeton-expire'],
  ])('propose le renvoi pour un lien %s sans exposer le message backend', async (_label, token) => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError('The verification token is invalid or expired.', 400, 'INVALID_VERIFICATION_TOKEN'),
    );
    render(
      <MemoryRouter initialEntries={[`/verify-email?token=${token}`]}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Ce lien est invalide ou expiré.')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse e-mail')).toBeInTheDocument();
    expect(screen.queryByText('The verification token is invalid or expired.')).not.toBeInTheDocument();
  });

  it('affiche une confirmation française neutre après la demande de renvoi', async () => {
    vi.mocked(requestEmailVerification).mockResolvedValue();
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Adresse e-mail'), {
      target: { value: 'personne@example.cg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Renvoyer le lien' }));

    await waitFor(() => {
      expect(requestEmailVerification).toHaveBeenCalledWith('personne@example.cg');
    });
    expect(
      await screen.findByText(
        'Si un compte en attente est associé à cette adresse, un nouveau lien de vérification vient d’être envoyé.',
      ),
    ).toBeInTheDocument();
  });
});
