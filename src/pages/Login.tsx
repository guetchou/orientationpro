
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com"); // Default email for testing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Tentative de connexion simplifiée avec:", { email });
      
      // Mode d'accès simplifié - envoi d'un lien magique par email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;
      
      toast.success('Un lien de connexion a été envoyé à votre email.');
      // Nous ne redirigeons pas immédiatement, l'utilisateur doit cliquer sur le lien dans son email
      
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      setError(err.message || "Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // Mode développement uniquement: connexion automatique pour les tests
  const handleDevLogin = async () => {
    setLoading(true);
    try {
      // ⚠️ UNIQUEMENT POUR DÉVELOPPEMENT: Connexion automatique sans mot de passe
      // Cette partie ne devrait être activée que dans un environnement de développement
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@example.com",
        password: "admin123" // Mot de passe par défaut pour test
      });
      
      if (error) throw error;
      
      toast.success('Connexion de développement réussie!');
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Erreur de connexion dev:", err);
      setError(err.message || "Échec de la connexion automatique");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-heading">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez votre email pour vous connecter
          </CardDescription>
          <CardDescription className="text-center text-amber-600 font-medium">
            Email par défaut: {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 p-3 rounded-md mb-4">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m.dupont@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi du lien de connexion...
                  </>
                ) : (
                  "Recevoir un lien de connexion"
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={handleDevLogin}
              type="button"
            >
              Connexion directe (développement uniquement)
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center">
            <span className="text-sm text-gray-500">
              Pas encore de compte?{" "}
              <Link to="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </span>
          </div>
          <div className="text-center">
            <Link to="/admin/super-admin" className="text-sm text-primary hover:underline">
              Créer un compte super administrateur
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
