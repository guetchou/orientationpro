import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Card className="mx-auto w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 text-white shadow-lg">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-3xl">Connexion à MAKOKI</CardTitle>
              <CardDescription className="mt-2">
                Accède à tes passations et à tes résultats d’orientation.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Se connecter
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-gray-600">
            Pas encore de compte ?&nbsp;
            <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
              Créer un compte
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
