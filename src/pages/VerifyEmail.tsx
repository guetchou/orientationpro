import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { apiFetch, ApiError, type AuthAccount } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  usePageMeta({ title: "Vérification de l’e-mail", description: "Confirmez votre adresse e-mail pour activer votre compte MAKOKI.", path: "/verify-email" });
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Vérification de ton adresse e-mail…');
  const token = searchParams.get('token');

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Le lien de vérification ne contient aucun jeton.');
        return;
      }
      try {
        await apiFetch<{ account: AuthAccount }>(
          '/v1/auth/verify-email',
          {
            method: 'POST',
            body: JSON.stringify({ token }),
          },
          { auth: false },
        );
        if (active) {
          setStatus('success');
          setMessage('Ton adresse e-mail est vérifiée. Tu peux maintenant te connecter.');
        }
      } catch (error) {
        if (!active) return;
        setStatus('error');
        setMessage(
          error instanceof ApiError
            ? error.message
            : 'Le lien est invalide, expiré ou le serveur est indisponible.',
        );
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-16">
      <Card className="mx-auto max-w-lg border-0 text-center shadow-2xl">
        <CardHeader className="space-y-4">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            status === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-8 w-8" />}
            {status === 'error' && <AlertCircle className="h-8 w-8" />}
          </div>
          <CardTitle>Vérification du compte MAKOKI</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <Button asChild><Link to="/login"><MailCheck className="mr-2 h-4 w-4" />Se connecter</Link></Button>
          )}
          {status === 'error' && (
            <Button asChild variant="outline"><Link to="/register">Créer un nouveau compte</Link></Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
