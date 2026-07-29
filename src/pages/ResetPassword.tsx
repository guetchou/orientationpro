import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ApiError, clearAuthSession, confirmPasswordReset } from '@/lib/apiClient';

const schema = z.object({
  password: z.string().min(12, 'Le mot de passe doit contenir au moins 12 caractères.'),
  confirmation: z.string().min(1, 'Confirme ton nouveau mot de passe.'),
}).refine((values) => values.password === values.confirmation, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmation'],
});

type Values = z.infer<typeof schema>;

export default function ResetPassword() {
  usePageMeta({
    title: 'Nouveau mot de passe',
    description: 'Définis un nouveau mot de passe sécurisé pour ton compte MAKOKI.',
    path: '/reset-password',
  });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [complete, setComplete] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmation: '' },
  });

  const onSubmit = async (values: Values) => {
    if (!token) return;
    setServerError(null);
    try {
      await confirmPasswordReset(token, values.password);
      clearAuthSession();
      setComplete(true);
    } catch (error) {
      setServerError(
        error instanceof ApiError && error.code === 'INVALID_PASSWORD_RESET'
          ? 'Ce lien est invalide ou expiré. Demande un nouveau lien.'
          : 'Le lien est invalide, expiré ou le serveur est indisponible.',
      );
    }
  };

  return (
    <AuthLayout
      headline="Sécurise ton compte"
      tagline="Choisis un nouveau mot de passe unique. Toutes les anciennes sessions seront révoquées."
      imageName="accompagnement-conseiller"
    >
      {!token ? (
        <div className="space-y-5">
          <AlertCircle className="h-12 w-12 text-red-600" />
          <h1 className="font-heading text-3xl font-bold text-slate-900">Lien invalide</h1>
          <p className="text-slate-600">Ce lien ne contient aucun jeton de réinitialisation.</p>
          <Button asChild className="w-full"><Link to="/forgot-password">Demander un nouveau lien</Link></Button>
        </div>
      ) : complete ? (
        <div className="space-y-5">
          <CheckCircle2 className="h-12 w-12 text-emerald-700" />
          <h1 className="font-heading text-3xl font-bold text-slate-900">Mot de passe modifié</h1>
          <p className="text-slate-600">Ton nouveau mot de passe est actif. Reconnecte-toi pour ouvrir une nouvelle session.</p>
          <Button asChild className="w-full"><Link to="/login">Se connecter</Link></Button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-900">Nouveau mot de passe</h1>
            <p className="mt-2 text-slate-600">Utilise au moins 12 caractères et évite un mot de passe déjà employé ailleurs.</p>
          </div>

          {serverError && (
            <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="new-password">Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input id="new-password" type="password" autoComplete="new-password" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="confirm-new-password">Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input id="confirm-new-password" type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enregistrer le mot de passe
              </Button>
            </form>
          </Form>
        </>
      )}
    </AuthLayout>
  );
}