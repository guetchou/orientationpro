import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmPasswordReset, requestPasswordReset } from './apiClient';

describe('récupération du Compte via Auth V1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('demande un lien sans authentification et conserve une réponse neutre', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        message: 'If an active account exists, password reset instructions will be sent.',
      }), {
        status: 202,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await requestPasswordReset('personne@example.cg');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/password-reset/request',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'personne@example.cg' }),
      }),
    );
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('confirme le nouveau mot de passe avec le jeton à usage unique', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await confirmPasswordReset('jeton-valide', 'nouveau mot de passe robuste');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/password-reset/confirm',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          token: 'jeton-valide',
          password: 'nouveau mot de passe robuste',
        }),
      }),
    );
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBeNull();
  });
});
