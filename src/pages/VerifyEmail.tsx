import { usePageMeta } from '@/hooks/usePageMeta';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail, MailCheck } from 'lucide-react';
import {
  apiFetch,
  requestEmailVerification,
  type AuthAccount,
} from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  usePageMeta({ title: "Vérification de l’e-mail", description: "Confirmez votre adresse e-mail pour activer votre compte MAKOKI.", path: "/verify-email" });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [message, setMessage] = useState('Vérification de ton adresse e-mail…');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendComplete, setResendComplete] = useState(false);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Lien de vérification manquant');
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
      } catch {
        if (!active) return;
        setStatus('error');
        setMessage('Ce lien est invalide ou expiré.');
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [token]);

  const resend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResending(true);
    try {
      await requestEmailVerification(email);
    } finally {
      setResending(false);
      setResendComplete(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-16">
      <h1 className="sr-only">Vérification du compte MAKOKI</h1>
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
            resendComplete ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
                Si un compte en attente est associé à cette adresse, un nouveau lien de vérification vient d’être envoyé.
              </div>
            ) : (
              <form className="space-y-4 text-left" onSubmit={resend}>
                <label className="text-sm font-medium text-slate-700" htmlFor="verification-email">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="verification-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full" disabled={resending}>
                  {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Renvoyer le lien
                </Button>
              </form>
            )
          )}
        </CardContent>
      </Card>
    </main>
  );
}
