import { usePageMeta } from '@/hooks/usePageMeta';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, oauthStartUrl } from '@/lib/apiClient';
import { saveAuthReturnPath } from '@/lib/authReturn';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialProviderIcon } from '@/components/auth/SocialProviderIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'ACCOUNT_EXISTS') return 'Un compte existe déjà pour cette adresse e-mail.';
    if (error.code === 'INVALID_REGISTRATION') return 'Utilise une adresse valide et un mot de passe d’au moins 12 caractères.';
  }
  return 'Le compte n’a pas pu être créé. Vérifie ta connexion puis réessaie.';
};

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  score = Math.min(score, 4);
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];
  return { score, label: labels[score], color: colors[score] };
};

const registerSchema = z.object({
  email: z.string().min(1, 'Ton adresse e-mail est requise.').email('Adresse e-mail invalide.'),
  password: z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères.'),
  confirmation: z.string().min(1, 'Confirme ton mot de passe.'),
  confirmedAge: z.boolean(),
  acceptedTerms: z.boolean(),
})
  .refine((data) => data.password === data.confirmation, {
    path: ['confirmation'],
    message: 'Les deux mots de passe ne correspondent pas.',
  })
  .refine((data) => data.confirmedAge === true, {
    path: ['confirmedAge'],
    message: 'Tu dois confirmer avoir au moins 16 ans.',
  })
  .refine((data) => data.acceptedTerms === true, {
    path: ['acceptedTerms'],
    message: 'Tu dois accepter les conditions d’utilisation et la politique de confidentialité.',
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  usePageMeta({
    title: 'Créer un compte',
    description: 'Crée ton compte MAKOKI pour enregistrer tes résultats et poursuivre ton projet.',
    path: '/register',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const location = useLocation();
  const requestedFrom = (location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null)?.from;
  const requestedPath = requestedFrom?.pathname?.startsWith('/')
    ? `${requestedFrom.pathname}${requestedFrom.search || ''}${requestedFrom.hash || ''}`
    : undefined;
  const loginState = requestedFrom ? { from: requestedFrom } : undefined;

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', confirmation: '', confirmedAge: false, acceptedTerms: false },
  });

  const password = form.watch('password');
  const strength = passwordStrength(password || '');

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    try {
      await signUp(values.email, values.password);
      saveAuthReturnPath(requestedPath);
      setCreated(true);
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'ACCOUNT_EXISTS') {
        form.setError('email', { message: 'Un compte existe déjà pour cette adresse e-mail.' });
      }
      setServerError(messageForError(caught));
    }
  };

  const startSocialRegistration = async (provider: 'google' | 'meta') => {
    const consentValid = await form.trigger(['confirmedAge', 'acceptedTerms'], { shouldFocus: true });
    if (!consentValid) return;
    saveAuthReturnPath(requestedPath);
    window.location.assign(oauthStartUrl(provider));
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      headline="Crée ton espace MAKOKI"
      tagline="Enregistre tes résultats, retrouve ton projet et poursuis ton parcours sur tes différents appareils."
      imageName="orientation-etudiants"
      imageSide="right"
    >
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mt-2 text-slate-600">Après vérification de ton adresse, tu retrouveras le parcours que tu as commencé.</p>
      </div>

      {created ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Ton compte est créé. Ouvre le message envoyé à ton adresse e-mail, confirme ton inscription, puis connecte-toi pour reprendre ton parcours.
          </div>
          <Button asChild size="lg" className="w-full"><Link to="/login" state={loginState}>Aller à la connexion</Link></Button>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{serverError}</span>
            </div>
          )}
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse e-mail</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <FormControl><Input type="email" autoComplete="email" placeholder="prenom@exemple.cg" className="pl-10" {...field} /></FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <FormControl><Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="px-10" {...field} /></FormControl>
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password ? (
                    <div className="mt-2" aria-live="polite">
                      <div className="flex gap-1">{[0, 1, 2, 3].map((index) => <span key={index} className={cn('h-1.5 flex-1 rounded-full transition-colors', index < strength.score ? strength.color : 'bg-gray-200')} />)}</div>
                      <p className="mt-1 text-xs text-gray-500">Force : <span className="font-medium">{strength.label}</span> — 12 caractères minimum.</p>
                    </div>
                  ) : <p className="mt-1 text-xs text-gray-500">12 caractères minimum.</p>}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmation" render={({ field }) => (
                <FormItem><FormLabel>Confirmer le mot de passe</FormLabel><FormControl><Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="confirmedAge" render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl><FormLabel className="text-sm font-normal leading-6 text-slate-700">Je confirme avoir au moins 16 ans.</FormLabel></div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="acceptedTerms" render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl>
                    <FormLabel className="text-sm font-normal leading-6 text-slate-700">
                      J’accepte les <Link className="font-medium text-emerald-700 underline" to="/terms">conditions d’utilisation</Link> et la <Link className="font-medium text-emerald-700 underline" to="/privacy">politique de confidentialité</Link>.
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" size="lg" className="w-full" disabled={submitting || !form.formState.isValid}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Créer le compte
              </Button>
            </form>
          </Form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400" aria-hidden="true"><span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" /></div>
          <div className="grid gap-3">
            <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={() => void startSocialRegistration('google')}><SocialProviderIcon provider="google" />Continuer avec Google</Button>
            <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={() => void startSocialRegistration('meta')}><SocialProviderIcon provider="meta" />Continuer avec Facebook</Button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">Déjà inscrit ? <Link to="/login" state={loginState} className="font-semibold text-emerald-700 hover:underline">Se connecter</Link></p>
        </>
      )}
    </AuthLayout>
  );
}
