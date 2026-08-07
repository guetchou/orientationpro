import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link2, Loader2, ShieldCheck, Unlink } from 'lucide-react';
import {
  ApiError,
  listOAuthIdentities,
  startOAuthLink,
  unlinkOAuthProvider,
  type LinkedIdentity,
} from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { SocialProviderIcon } from '@/components/auth/SocialProviderIcon';

type ProviderId = 'google' | 'meta';

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'meta', label: 'Facebook' },
];

const providerLabel = (id: string) => (id === 'meta' ? 'Facebook' : 'Google');

export default function ConnectedAccounts() {
  const [identities, setIdentities] = useState<LinkedIdentity[] | null>(null);
  const [busy, setBusy] = useState<ProviderId | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setIdentities(await listOAuthIdentities());
    } catch {
      setIdentities([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Retour du flux de liaison : le backend redirige vers /profile?link=success|error.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const link = params.get('link');
    if (!link) return;
    if (link === 'success') {
      setNotice({ type: 'success', text: `${providerLabel(params.get('provider') || '')} est maintenant lié à ton compte.` });
    } else {
      const messages: Record<string, string> = {
        IDENTITY_TAKEN: 'Ce compte social est déjà lié à un autre compte MAKOKI.',
        ACCOUNT_UNAVAILABLE: 'Ton compte ne peut pas être lié pour le moment.',
      };
      setNotice({ type: 'error', text: messages[params.get('code') || ''] || 'La liaison n’a pas abouti. Réessaie.' });
    }
    void load();
    navigate('/profile', { replace: true });
  }, [location.search, navigate, load]);

  const isLinked = (provider: string) => identities?.some((identity) => identity.provider === provider) ?? false;

  const handleLink = async (provider: ProviderId) => {
    setBusy(provider);
    setNotice(null);
    try {
      window.location.href = await startOAuthLink(provider);
    } catch (error) {
      setBusy(null);
      setNotice({
        type: 'error',
        text: error instanceof ApiError && error.status === 401
          ? 'Reconnecte-toi puis réessaie de lier ce compte.'
          : 'Impossible de démarrer la liaison. Réessaie.',
      });
    }
  };

  const handleUnlink = async (provider: ProviderId) => {
    setBusy(provider);
    setNotice(null);
    try {
      await unlinkOAuthProvider(provider);
      await load();
      setNotice({ type: 'success', text: `${providerLabel(provider)} a été délié de ton compte.` });
    } catch {
      setNotice({ type: 'error', text: 'Impossible de délier ce compte. Réessaie.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6" aria-labelledby="connected-accounts-title">
      <h2 id="connected-accounts-title" className="flex items-center gap-2 text-xl font-semibold text-gray-950">
        <ShieldCheck className="h-5 w-5 text-emerald-600" /> Comptes connectés
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Lie Google ou Facebook pour te reconnecter en un clic la prochaine fois, en plus de ton mot de passe.
      </p>

      {notice && (
        <div
          className={`mt-4 rounded-lg border p-3 text-sm ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
          role="status"
        >
          {notice.text}
        </div>
      )}

      <ul className="mt-5 divide-y divide-gray-100">
        {PROVIDERS.map(({ id, label }) => {
          const linked = isLinked(id);
          const loading = busy === id;
          return (
            <li key={id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <SocialProviderIcon provider={id} />
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{linked ? 'Connecté' : 'Non connecté'}</p>
                </div>
              </div>
              {linked ? (
                <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => handleUnlink(id)}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlink className="mr-2 h-4 w-4" />}
                  Délier
                </Button>
              ) : (
                <Button type="button" size="sm" disabled={loading} onClick={() => handleLink(id)}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                  Lier {label}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
