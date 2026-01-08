import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/lib/supabaseClient";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, User, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useDemoMode } from '../demo-system/frontend/hooks/useDemoMode';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('admin');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, signOut, refreshAuthState } = useAuth();
  const { isDemoMode } = useDemoMode ? useDemoMode() : { isDemoMode: false };

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Vérifier les tokens de connexion
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    // Si on a des données utilisateur, rediriger selon le rôle
    if (userData) {
      try {
        const userInfo = JSON.parse(userData);
        const userRole = userInfo.role;
        
        // Éviter les boucles en vérifiant si on est déjà sur la bonne page
        const currentPath = window.location.pathname;
        let shouldRedirect = false;
        let targetPath = '';
        
        switch (userRole) {
          case 'super_admin':
            targetPath = '/admin/super-admin';
            shouldRedirect = currentPath !== targetPath;
            break;
          case 'admin':
            targetPath = '/admin/dashboard';
            shouldRedirect = currentPath !== targetPath;
            break;
          case 'conseiller':
            targetPath = '/conseiller/dashboard';
            shouldRedirect = currentPath !== targetPath;
            break;
          case 'user':
            targetPath = '/dashboard';
            shouldRedirect = currentPath !== targetPath;
            break;
          default:
            targetPath = '/dashboard';
            shouldRedirect = currentPath !== targetPath;
            break;
        }
        
        if (shouldRedirect) {
          navigate(targetPath, { replace: true });
        }
        return;
      } catch (e) {
        console.error('Erreur parsing userData:', e);
        // Nettoyer les données corrompues
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
      }
    }
    
    // Ancienne logique pour compatibilité
    if (adminToken) {
      // Utilisateur admin connecté via backend
      navigate('/admin/dashboard', { replace: true });
    } else if (userToken && !userData) {
      // Utilisateur normal connecté via backend (sans données de rôle)
      navigate('/dashboard', { replace: true });
    } else if (user && !adminToken && !userToken) {
      // Utilisateur connecté via Supabase
      if (user.role === 'admin') {
        navigate('/admin/super-admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Tentative de connexion:", { email, mode: loginMode });
      
      // Si ce n'est pas un compte de test, essayer la connexion Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          // Récupérer le profil utilisateur depuis la base de données
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .eq('email', email)
            .single();

          if (profileError) {
            console.warn('Profil non trouvé, création d\'un profil par défaut');
          }

          const userData = {
            id: data.user.id,
            email: data.user.email,
            role: profile?.user_roles?.[0]?.role || 'user',
            full_name: profile?.full_name || email.split('@')[0],
            is_super_admin: profile?.is_super_admin || false
          };

          // Stocker les informations utilisateur
          localStorage.setItem('userToken', data.session?.access_token || 'supabase-token');
          localStorage.setItem('userData', JSON.stringify(userData));
          localStorage.setItem('userRole', userData.role);

          toast.success('Connexion réussie !');

          // Redirection selon le rôle
          switch (userData.role) {
            case 'super_admin':
              navigate('/admin/super-admin', { replace: true });
              break;
            case 'admin':
              navigate('/admin/dashboard', { replace: true });
              break;
            case 'conseiller':
              navigate('/conseiller/dashboard', { replace: true });
              break;
            case 'user':
              navigate('/dashboard', { replace: true });
              break;
            default:
              navigate('/dashboard', { replace: true });
              break;
          }
        }
      } catch (supabaseError: any) {
        // Si Supabase échoue, essayer le backend local comme fallback
        console.log("Tentative de connexion via backend local...");
        
        const response = await fetch('http://10.10.0.5:7474/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            role: loginMode === 'admin' ? 'admin' : 'user'
          }),
        });

        const backendData = await response.json();

        if (!response.ok) {
          throw new Error(backendData.message || 'Échec de la connexion');
        }

        if (backendData.success) {
          // Stocker les informations utilisateur dans localStorage
          localStorage.setItem('userToken', backendData.token);
          localStorage.setItem('userData', JSON.stringify(backendData.user));
          localStorage.setItem('userRole', backendData.user.role);
          // Forcer la synchronisation du contexte
          if (refreshAuthState) refreshAuthState();
          // Redirection dynamique selon le rôle
          switch (backendData.user.role) {
            case 'admin':
              navigate('/admin/dashboard', { replace: true });
              break;
            case 'superadmin':
              navigate('/superadmin/dashboard', { replace: true });
              break;
            case 'conseiller':
              navigate('/conseiller/dashboard', { replace: true });
              break;
            case 'coach':
              navigate('/coach/dashboard', { replace: true });
              break;
            case 'recruteur':
              navigate('/recruteur/dashboard', { replace: true });
              break;
            case 'rh':
              navigate('/rh/dashboard', { replace: true });
              break;
            default:
              navigate('/dashboard', { replace: true });
              break;
          }
        } else {
          throw new Error(backendData.message || 'Échec de la connexion');
        }
      }
      
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      
      let errorMessage = err.message || "Une erreur inattendue s'est produite";
      
      // Messages d'erreur personnalisés
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid login')) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      }
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError') || errorMessage === 'Failed to fetch') {
        errorMessage = "L’adresse e-mail que vous avez saisie n’est pas associée à un compte. Trouvez votre compte et connectez-vous.";
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
    // Ne rien pré-remplir
    setEmail("");
    setPassword("");
  };

  const handleLogout = () => {
    console.log('🔄 Nettoyage d\'urgence...');
    
    // Nettoyer TOUS les tokens et données
    const keysToRemove = [
      'userToken', 'adminToken', 'userData', 'adminUser', 'userRole',
      'rememberedEmail', 'rememberedMode', 'authToken'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Nettoyer les cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
            console.log('Nettoyage terminé, rechargement...');
    
    // Recharger la page
    window.location.href = '/';
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
              
              {isDemoMode && (
                <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded text-center font-semibold">
                  Mode DEMO activé : toutes les données sont simulées
                </div>
              )}
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
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
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
                    placeholder="Mot de passe"
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
                    Se connecter
                  </>
                )}
              </Button>
            </form>
            
            {/* Instructions de démarrage */}
            
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
