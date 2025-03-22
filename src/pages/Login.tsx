
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com"); // Default email for testing
  const [password, setPassword] = useState("admin123"); // Default password for testing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", { email });
      await signIn(email, password);
      
      // If successful, navigate to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.response?.data?.message === "Invalid login credentials") {
        setError("Email ou mot de passe incorrect");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Veuillez confirmer votre email avant de vous connecter");
      } else {
        setError(error.message || "Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <Card className="w-full max-w-md border-0 shadow-lg bg-white/90 backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-heading">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour vous connecter
          </CardDescription>
          <CardDescription className="text-center text-amber-600 font-medium">
            Identifiants par défaut: {email} / {password}
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
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link 
                    to="/reset-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>
          </form>
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
