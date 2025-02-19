
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
        
        if (signUpError.message === "User already registered") {
          setError("Un compte existe déjà avec cet email. Veuillez vous connecter.");
          setTimeout(() => {
            navigate("/login", { state: { email } });
          }, 2000);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header avec bouton retour */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm"
        >
          <div>
            <h2 className="mt-2 text-center text-3xl font-heading font-bold text-gray-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Rejoignez-nous pour accéder à tous nos services d'orientation
            </p>
            {!isSupabaseConfigured() && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  La connexion à Supabase n'est pas configurée. Veuillez configurer l'intégration Supabase.
                </p>
              </div>
            )}
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-red-50 p-4"
              >
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
                {error.includes("existe déjà") && (
                  <p className="mt-2 text-sm text-red-700">
                    <Link to="/login" className="font-medium text-red-700 hover:text-red-600 underline">
                      Connectez-vous ici
                    </Link>
                  </p>
                )}
              </motion.div>
            )}

            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className="pl-10"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full relative"
                disabled={loading || !isSupabaseConfigured()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Déjà inscrit ?{" "}
                <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                  Connectez-vous ici
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                En vous inscrivant, vous acceptez nos{" "}
                <a href="#" className="underline hover:text-gray-700">conditions d'utilisation</a>
                {" "}et notre{" "}
                <a href="#" className="underline hover:text-gray-700">politique de confidentialité</a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
