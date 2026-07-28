import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, oauthStartUrl } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'ACCOUNT_EXISTS') return 'Un compte existe déjà pour cette adresse e-mail.';
    if (error.code === 'INVALID_REGISTRATION') {
      return 'Utilise une adresse valide et un mot de passe d’au moins 12 caractères.';
    }
    return error.message;
  }
  return 'La création du compte a échoué. Vérifie la disponibilité du serveur.';
};

/** Force du mot de passe (0–4) à partir de la longueur et de la variété. */
const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  score = Math.min(score, 4);
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];
  return { score, label: labels[score], color: colors[score] };
};

const registerSchema = z
  .object({
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
  const [showPassword, setShowPassword] = useState(false);
  const [created, setCreated] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { signUp } = useAuth();

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
    window.location.assign(oauthStartUrl(provider));
  };

  const submitting = form.formState.isSubmitting;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Card className="mx-auto w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 text-white shadow-lg">
              {created ? <CheckCircle2 className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
            </div>
            <div>
              <CardTitle className="text-3xl">Créer un compte MAKOKI</CardTitle>
              <CardDescription className="mt-2">
                Un compte est nécessaire pour enregistrer les passations et les résultats d’orientation.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {created ? (
              <div className="space-y-5 text-center">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Le compte a été créé. Consulte ta messagerie et ouvre le lien de vérification avant de te connecter.
                </div>
                <Button asChild className="w-full">
                  <Link to="/login">Aller à la connexion</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  L’inscription est actuellement réservée aux personnes âgées d’au moins 16 ans. L’ouverture aux 14–15 ans
                  sera activée après mise en place d’un consentement parental conjoint et vérifiable.
                </div>
                {serverError && (
                  <div
                    className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}
                <Form {...form}>
                  <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse e-mail</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                type="email"
                                autoComplete="email"
                                placeholder="prenom@exemple.cg"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                className="px-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          {password ? (
                            <div className="mt-2" aria-live="polite">
                              <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      'h-1.5 flex-1 rounded-full transition-colors',
                                      i < strength.score ? strength.color : 'bg-gray-200',
                                    )}
                                  />
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Force : <span className="font-medium">{strength.label}</span> — 12 caractères minimum.
                              </p>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500">12 caractères minimum.</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmedAge"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-6 text-slate-700">
                              Je confirme avoir au moins 16 ans.
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="acceptedTerms"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-6 text-slate-700">
                              J’accepte les{' '}
                              <Link className="font-medium text-emerald-700 underline" to="/terms">
                                conditions d’utilisation
                              </Link>{' '}
                              et la{' '}
                              <Link className="font-medium text-emerald-700 underline" to="/privacy">
                                politique de confidentialité
                              </Link>
                              .
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={submitting || !form.formState.isValid}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Créer le compte
                    </Button>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400" aria-hidden="true">
                      <span className="h-px flex-1 bg-gray-200" />
                      ou inscription sociale
                      <span className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="grid gap-3">
                      <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={() => void startSocialRegistration('google')}>
                        Continuer avec Google
                      </Button>
                      <Button type="button" variant="outline" className="w-full" disabled={submitting} onClick={() => void startSocialRegistration('meta')}>
                        Continuer avec Facebook
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
          {!created && (
            <CardFooter className="justify-center text-sm text-gray-600">
              Déjà inscrit ?&nbsp;
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Se connecter
              </Link>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </main>
  );
}
