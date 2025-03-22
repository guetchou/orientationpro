
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function SuperAdmin() {
  const { createSuperAdmin } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [firstName, setFirstName] = useState("Super");
  const [lastName, setLastName] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if we already have super admin accounts
  useEffect(() => {
    const checkSuperAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_super_admin', true)
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        // If super admin accounts already exist, warn the user
        if (data && data.length > 0) {
          toast.warning("Des comptes super administrateur existent déjà");
        }
      } catch (err) {
        console.error("Erreur lors de la vérification des super admins:", err);
      }
    };
    
    checkSuperAdmins();
  }, []);

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Creating super admin:", email);
      
      // Use the createSuperAdmin method from useAuth
      await createSuperAdmin(email, password, firstName, lastName);
      
      toast.success("Compte super administrateur créé avec succès !");
      
      // Store the credentials in localStorage for easy reference
      localStorage.setItem('defaultAdminEmail', email);
      localStorage.setItem('defaultAdminPassword', password);
      
      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Erreur inattendue:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Création du compte super administrateur</CardTitle>
            <p className="text-amber-600 font-medium mt-1">
              Identifiants par défaut: {email} / {password}
            </p>
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
            
            <form onSubmit={handleCreateSuperAdmin}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 6 caractères
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    "Créer le super administrateur"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-gray-500">
              Ce compte aura tous les droits d'administration sur la plateforme.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
