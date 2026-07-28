import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/apiClient';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const destinationForRole = (role?: string) => {
  if (role === 'super_admin') return '/admin/super-admin';
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'conseiller') return '/conseiller/dashboard';
  return '/dashboard';
};

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') return 'Adresse e-mail ou mot de passe incorrect.';
    if (error.code === 'ACCOUNT_NOT_VERIFIED') return 'Ce compte doit être vérifié avant la connexion.';
    if (error.status === 429) return 'Trop de tentatives. Réessaie dans quelques minutes.';
    return error.message;
  }
  return 'La connexion a échoué. Vérifie la disponibilité du serveur.';
};

const loginSchema = z.object({
  email: z.string().min(1, 'Ton adresse e-mail est requise.').email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Ton mot de passe est requis.'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  usePageMeta({ title: "Connexion", description: "Connectez-vous à votre compte MAKOKI pour accéder à vos passations et résultats d’orientation.", path: "/login" });
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = (location.state as any)?.from?.pathname as string | undefined;

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (user) navigate(requestedPath || destinationForRole(user.role), { replace: true });
  }, [navigate, requestedPath, user]);

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const result = await signIn(values.email, values.password);
      navigate(requestedPath || destinationForRole(result.user?.role), { replace: true });
    } catch (caught) {
      setServerError(messageForError(caught));
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      headline="Content de te revoir"
      tagline="Connecte-toi pour retrouver tes passations, tes résultats d’orientation et ton accompagnement."
      imageName="accompagnement-conseiller"
    >
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">Connexion</h1>
        <p className="mt-2 text-slate-600">Accède à tes passations et à tes résultats d’orientation.</p>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse e-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input type="email" autoComplete="email" placeholder="prenom@exemple.cg" className="pl-10" {...field} />
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
                <div className="flex items-center justify-between">
                  <FormLabel>Mot de passe</FormLabel>
                  <Link to="/forgot-password" className="text-sm font-medium text-emerald-700 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Se connecter
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
