
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("newuser@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
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
      const userData = {
        first_name: 'Utilisateur',
        last_name: 'Test'
      };
      
      await signUp(email, password, userData);
      
      toast.success("Inscription réussie !");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.response?.data?.message === "Email already registered") {
        setError("Un compte existe déjà avec cet email. Veuillez vous connecter.");
        setTimeout(() => {
          navigate("/login", { state: { email } });
        }, 2000);
      } else {
        setError(error.message || "Une erreur inattendue s'est produite");
      }
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
            <p className="mt-2 text-center text-amber-600 font-medium">
              Identifiants par défaut: {email} / {password}
            </p>
          </div>

          <RegisterForm
            email={email}
            password={password}
            loading={loading}
            error={error}
            isSupabaseConfigured={true}
            handleEmailChange={(e) => setEmail(e.target.value)}
            handlePasswordChange={(e) => setPassword(e.target.value)}
            handleSubmit={handleRegister}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
