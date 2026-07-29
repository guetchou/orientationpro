import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, confirmPasswordReset } from '@/lib/apiClient';
import ResetPassword from './ResetPassword';

vi.mock('@/lib/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/apiClient')>();
  return {
    ...actual,
    confirmPasswordReset: vi.fn(),
    clearAuthSession: vi.fn(),
  };
});

describe('définition du nouveau mot de passe', () => {
  beforeEach(() => {
    vi.mocked(confirmPasswordReset).mockReset();
  });

  it('confirme un mot de passe robuste avec le jeton du lien', async () => {
    vi.mocked(confirmPasswordReset).mockResolvedValue();
    render(
      <MemoryRouter initialEntries={['/reset-password?token=jeton-valide']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'nouveau mot de passe robuste' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'nouveau mot de passe robuste' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le mot de passe' }));

    await waitFor(() => {
      expect(confirmPasswordReset).toHaveBeenCalledWith(
        'jeton-valide',
        'nouveau mot de passe robuste',
      );
    });
    expect(await screen.findByText('Mot de passe modifié')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/login');
  });

  it('refuse une page sans jeton et propose un nouveau lien', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    expect(screen.getByText('Lien invalide')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Demander un nouveau lien' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('refuse deux mots de passe différents avant tout appel API', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=jeton-valide']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'nouveau mot de passe robuste' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'mot de passe robuste différent' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le mot de passe' }));

    expect(await screen.findByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument();
    expect(confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('traduit une erreur de jeton expiré sans exposer le message backend', async () => {
    vi.mocked(confirmPasswordReset).mockRejectedValue(
      new ApiError('The reset token is invalid or expired.', 400, 'INVALID_PASSWORD_RESET'),
    );
    render(
      <MemoryRouter initialEntries={['/reset-password?token=jeton-expire']}>
        <ResetPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'nouveau mot de passe robuste' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'nouveau mot de passe robuste' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer le mot de passe' }));

    expect(
      await screen.findByText('Ce lien est invalide ou expiré. Demande un nouveau lien.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('The reset token is invalid or expired.')).not.toBeInTheDocument();
  });
});
