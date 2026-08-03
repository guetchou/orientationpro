import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, oauthStartUrl, refreshAuthSession } from '@/lib/apiClient';
import { destinationForRoles } from '@/lib/authDestination';
import {
  clearAuthReturnPath,
  normalizeAuthReturnPath,
  readAuthReturnPath,
  saveAuthReturnPath,
} from '@/lib/authReturn';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialProviderIcon } from '@/components/auth/SocialProviderIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') return 'Adresse e-mail ou mot de passe incorrect.';
    if (error.code === 'ACCOUNT_NOT_VERIFIED') return 'Vérifie ton adresse e-mail avant de te connecter.';
    if (error.status === 429) return 'Trop de tentatives. Réessaie dans quelques minutes.';
    return 'La connexion n’a pas abouti. Réessaie dans quelques instants.';
  }
  return 'La connexion n’a pas abouti. Vérifie ta connexion internet puis réessaie.';
};

const loginSchema = z.object({
  email: z.string().min(1, 'Ton adresse e-mail est requise.').email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Ton mot de passe est requis.'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  usePageMeta({
    title: 'Connexion',
    description: 'Connecte-toi à MAKOKI pour retrouver ton résultat et poursuivre ton projet.',
    path: '/login',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthCompleting, setOauthCompleting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedFrom = (location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null)?.from;
  const statePath = requestedFrom?.pathname
    ? `${requestedFrom.pathname}${requestedFrom.search || ''}${requestedFrom.hash || ''}`
    : undefined;
  const requestedPath = normalizeAuthReturnPath(statePath) || readAuthReturnPath();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const finishAuthentication = (fallback: string) => {
    const destination = requestedPath || fallback;
    clearAuthReturnPath();
    navigate(destination, { replace: true });
  };

  useEffect(() => {
    if (user) finishAuthentication(destinationForRoles(user.role));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauth = params.get('oauth');
    const code = params.get('code');
    if (oauth === 'error') {
      const messages: Record<string, string> = {
        ACCOUNT_LINK_REQUIRED: 'Un compte existe déjà avec cette adresse. Connecte-toi avec ton mot de passe.',
        OAUTH_CANCELLED: 'La connexion a été annulée.',
        OAUTH_STATE_INVALID: 'La tentative de connexion a expiré. Recommence depuis cette page.',
        OAUTH_PROVIDER_REJECTED: 'Ton identité n’a pas pu être confirmée.',
        OAUTH_ACCOUNT_UNAVAILABLE: 'Ce compte ne peut pas être utilisé actuellement.',
      };
      setServerError(messages[code || ''] || 'La connexion n’a pas abouti.');
      return;
    }
    if (oauth !== 'success') return;

    let active = true;
    setOauthCompleting(true);
    void refreshAuthSession()
      .then((payload) => {
        if (!active) return;
        if (!payload) throw new Error('session unavailable');
        finishAuthentication(destinationForRoles(payload.account.roles));
      })
      .catch(() => {
        if (active) setServerError('La connexion n’a pas pu être finalisée. Recommence depuis cette page.');
      })
      .finally(() => {
        if (active) setOauthCompleting(false);
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const result = await signIn(values.email, values.password);
      finishAuthentication(destinationForRoles(result.user?.role));
    } catch (caught) {
      setServerError(messageForError(caught));
    }
  };

  const rememberReturnPath = () => saveAuthReturnPath(requestedPath);
  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      headline="Content de te revoir"
      tagline="Connecte-toi pour retrouver ton résultat, reprendre ton parcours et continuer là où tu t’es arrêté."
      imageName="accompagnement-conseiller"
    >
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Connexion</h1>
        <p className="mt-2 text-slate-600">Après connexion, tu retrouveras automatiquement le parcours que tu avais commencé.</p>
      </div>

      {serverError && (
        <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="mb-5 grid gap-3">
        <Button asChild type="button" variant="outline" className="w-full" aria-disabled={oauthCompleting}>
          <a href={oauthStartUrl('google')} onClick={rememberReturnPath}>
            <SocialProviderIcon provider="google" />Continuer avec Google
          </a>
        </Button>
        <Button asChild type="button" variant="outline" className="w-full" aria-disabled={oauthCompleting}>
          <a href={oauthStartUrl('meta')} onClick={rememberReturnPath}>
            <SocialProviderIcon provider="meta" />Continuer avec Facebook
          </a>
        </Button>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-600" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-200" />ou avec ton mot de passe<span className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="login-email">Adresse e-mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="login-email" type="email" autoComplete="email" placeholder="prenom@exemple.cg" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel htmlFor="login-password">Mot de passe</FormLabel>
                <Link to="/forgot-password" className="text-sm font-medium text-emerald-700 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="px-10" {...field} />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-600" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" size="lg" className="w-full" disabled={submitting || oauthCompleting}>
            {submitting || oauthCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Se connecter
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-emerald-700 hover:underline">Créer un compte</Link>
      </p>
    </AuthLayout>
  );
}
