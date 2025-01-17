import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!isSupabaseConfigured()) {
      toast.error("La connexion à Supabase n'est pas configurée");
      setLoading(false);
      return;
    }

    // Validation basique
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }
    
    try {
      const { error: signUpError } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Erreur d'inscription:", signUpError);
        
        // Gestion spécifique des erreurs
        if (signUpError.message === "User already registered") {
          setError("Un compte existe déjà avec cet email. Veuillez vous connecter.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
      navigate("/login");
    } catch (error: any) {
      console.error("Erreur inattendue:", error);
      setError("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-heading font-bold text-gray-900">
            Créer un compte
          </h2>
          {!isSupabaseConfigured() && (
            <p className="mt-2 text-center text-sm text-red-600">
              La connexion à Supabase n'est pas configurée. Veuillez configurer l'intégration Supabase.
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes("existe déjà") && (
                <p className="mt-2 text-sm text-red-700">
                  <Link to="/login" className="font-medium text-red-700 hover:text-red-600 underline">
                    Connectez-vous ici
                  </Link>
                </p>
              )}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isSupabaseConfigured()}
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà inscrit ?{" "}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;