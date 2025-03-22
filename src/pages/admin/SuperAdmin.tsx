
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminRegistrationForm } from "@/components/admin/AdminRegistrationForm";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const { createSuperAdmin, createMasterAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [activeTab, setActiveTab] = useState("super");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "super" && createSuperAdmin) {
        await createSuperAdmin(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
      } else if (activeTab === "master" && createMasterAdmin) {
        await createMasterAdmin(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );
      } else {
        throw new Error("La fonction de création d'administrateur n'est pas disponible");
      }
      
      navigate("/login");
    } catch (error: any) {
      console.error("Erreur lors de la création de l'administrateur:", error);
      setError(error.message || "Une erreur s'est produite lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-center font-heading">Créer un Administrateur</CardTitle>
              <CardDescription className="text-center">
                Créez un compte avec des privilèges administratifs sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="super" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="super">Super Admin</TabsTrigger>
                  <TabsTrigger value="master">Master Admin</TabsTrigger>
                </TabsList>
                
                <TabsContent value="super">
                  <p className="text-sm text-gray-500 mb-4">
                    Les Super Admins ont accès à toutes les fonctionnalités administratives de base.
                  </p>
                </TabsContent>
                
                <TabsContent value="master">
                  <p className="text-sm text-gray-500 mb-4">
                    Les Master Admins ont accès à toutes les fonctionnalités, y compris les privilèges avancés et les configurations système.
                  </p>
                </TabsContent>
              </Tabs>

              <AdminRegistrationForm
                activeTab={activeTab}
                loading={loading}
                error={error}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
