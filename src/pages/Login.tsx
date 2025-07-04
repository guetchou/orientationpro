
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('admin');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/test/health');
      const data = await response.json();
      console.log('Test backend:', data);
      return response.ok;
    } catch (error) {
      console.error('Backend non accessible:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Mode de connexion:", loginMode);
      console.log("Données:", { email, password: password ? "***" : "vide" });
      
      if (loginMode === 'admin') {
        // Test de la connexion backend d'abord
        const backendConnected = await testBackendConnection();
        
        if (!backendConnected) {
          throw new Error('Le serveur backend n\'est pas accessible. Assurez-vous qu\'il est démarré sur le port 3000.');
        }

        // Connexion admin via backend
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            password, 
            role: 'admin' 
          })
        });

        console.log('Réponse du serveur:', response.status, response.statusText);

        if (!response.ok) {
          let errorMessage = 'Erreur de connexion';
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // Si la réponse n'est pas du JSON, c'est probablement du HTML
            const textResponse = await response.text();
            console.error('Réponse non-JSON:', textResponse.substring(0, 200));
            errorMessage = 'Le serveur a retourné une réponse inattendue. Vérifiez que le backend est correctement configuré.';
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Résultat de la connexion:', result);

        if (!result.success) {
          throw new Error(result.message || 'Connexion échouée');
        }

        // Stocker les informations d'authentification admin
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        
        toast.success('Connexion admin réussie!');
        navigate('/admin/super-admin');
        
      } else {
        // Connexion utilisateur via Supabase
        try {
          await signIn(email, password);
          toast.success('Connexion utilisateur réussie!');
          navigate(from);
        } catch (supabaseError: any) {
          throw new Error(supabaseError.message || 'Erreur de connexion utilisateur');
        }
      }
      
      // Gestion du "se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedMode', loginMode);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedMode');
      }
      
    } catch (err: any) {
      console.error("Erreur de connexion complète:", err);
      
      let errorMessage = err.message || "Une erreur inattendue s'est produite";
      
      // Messages d'erreur personnalisés
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = "Impossible de contacter le serveur. Vérifiez que le backend est démarré.";
      } else if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
        errorMessage = "Erreur de communication avec le serveur. Le backend semble retourner du HTML au lieu de JSON.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les préférences sauvegardées
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedMode = localStorage.getItem('rememberedMode') as 'user' | 'admin';
    
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    
    if (rememberedMode) {
      setLoginMode(rememberedMode);
    }
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleModeSwitch = (mode: 'user' | 'admin') => {
    setLoginMode(mode);
    setError(null);
    
    if (mode === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connexion
              </CardTitle>
              <CardDescription className="text-gray-600">
                Accédez à votre espace personnel
              </CardDescription>
            </div>
            
            {/* Sélecteur de mode */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <Button
                type="button"
                variant={loginMode === 'user' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeSwitch('user')}
                className="flex-1 gap-2"
              >
                <User className="h-4 w-4" />
                Utilisateur
              </Button>
              <Button
                type="button"
                variant={loginMode === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeSwitch('admin')}
                className="flex-1 gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-200 p-3 rounded-md mb-4"
              >
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email {loginMode === 'admin' && '(Admin)'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={loginMode === 'admin' ? 'admin@example.com' : 'user@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter {loginMode === 'admin' && '(Admin)'}
                  </>
                )}
              </Button>
            </form>
            
            {/* Informations de test */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">
                🧪 Comptes de test :
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <div>👤 Utilisateur: user@example.com / password123</div>
                <div>🛡️ Admin: admin@example.com / admin123</div>
              </div>
            </div>

            {/* Instructions de démarrage */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>⚠️ Important:</strong> Pour la connexion admin, le serveur backend doit être démarré :
              </p>
              <div className="text-xs text-yellow-600 mt-1 font-mono">
                <div>cd backend && npm start</div>
                <div>ou node src/server.js</div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                S'inscrire
              </Link>
            </p>
            
            <div className="text-center">
              <Link
                to="/admin/super-admin"
                className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
              >
                Accès direct administrateur
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
