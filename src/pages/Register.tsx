
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

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
      console.log("Attempting to register:", { email });
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("Registration error:", signUpError);
        
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

      if (data.user) {
        // Create profile record for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            department: 'admin',
            is_super_admin: true,
            first_name: 'Admin',
            last_name: 'User',
            status: 'active'
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }

        toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
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

          <RegisterForm
            email={email}
            password={password}
            loading={loading}
            error={error}
            isSupabaseConfigured={isSupabaseConfigured()}
            handleEmailChange={(e) => setEmail(e.target.value)}
            handlePasswordChange={(e) => setPassword(e.target.value)}
            handleSubmit={handleRegister}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
