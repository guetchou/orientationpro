import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères.');
      return;
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password);
      setCreated(true);
    } catch (caught) {
      setError(messageForError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-16">
      <Card className="mx-auto w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 text-white shadow-lg">
            {created ? <CheckCircle2 className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>
          <div>
            <CardTitle className="text-3xl">Créer un compte MAKOKI</CardTitle>
            <CardDescription className="mt-2">
              Un compte est nécessaire pour enregistrer les passations et les Résultats d’orientation.
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
              {error && (
                <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={12}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="px-10"
                      required
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
                  <p className="text-xs text-gray-500">12 caractères minimum.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirmation">Confirmer le mot de passe</Label>
                  <Input
                    id="register-confirmation"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Créer le compte
                </Button>
              </form>
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
    </main>
  );
}
