import { usePageMeta } from '@/hooks/usePageMeta';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { requestPasswordReset } from '@/lib/apiClient';

const schema = z.object({
  email: z.string().min(1, 'Ton adresse e-mail est requise.').email('Adresse e-mail invalide.'),
});
type Values = z.infer<typeof schema>;

export default function ForgotPassword() {
  usePageMeta({
    title: 'Mot de passe oublié',
    description: 'Réinitialise le mot de passe de ton compte MAKOKI : reçois un lien de réinitialisation par e-mail.',
    path: '/forgot-password',
  });
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: Values) => {
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch {
      // On n'expose pas l'existence d'un compte : message neutre.
      setSent(true);
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      headline="On s’occupe de tout"
      tagline="Pas de panique : indique ton adresse e-mail et reçois un lien pour réinitialiser ton mot de passe."
      imageName="employabilite-cv"
    >
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </Link>

      {sent ? (
        <div className="space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Vérifie ta boîte mail</h1>
            <p className="mt-2 text-slate-600">
              Si un compte est associé à cette adresse, un lien de réinitialisation vient d’être envoyé. Pense à regarder
              tes courriers indésirables.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link to="/login">Revenir à la connexion</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-900">Mot de passe oublié</h1>
            <p className="mt-2 text-slate-600">Entre ton adresse e-mail pour recevoir un lien de réinitialisation.</p>
          </div>


          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="forgot-password-email">Adresse e-mail</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input id="forgot-password-email" type="email" autoComplete="email" placeholder="prenom@exemple.cg" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Envoyer le lien
              </Button>
            </form>
          </Form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Tu te souviens de ton mot de passe ?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
              Se connecter
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
