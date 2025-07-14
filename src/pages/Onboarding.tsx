
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, UserCircle2, BookOpen, GraduationCap, Building2, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    interests: "",
    experience: "",
    education: "",
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà un profil
    const checkProfile = async () => {
      if (!user) return;

      try {
        const userId = typeof user.id === 'number' ? String(user.id) : user.id;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        // Si le profil a déjà un département (rôle) défini et un statut actif, rediriger
        if (data && data.department && data.status === 'active') {
          redirectBasedOnRole(data.department);
        } else if (data) {
          // Pré-remplir les données si l'utilisateur a déjà un profil mais pas complet
          setFormData({
            role: data.department || "",
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone || "",
            bio: data.bio || "",
            interests: data.interests || "",
            experience: data.experience || "",
            education: data.education || "",
          });
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du profil:", err);
      }
    };

    checkProfile();
  }, [user, navigate]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "conseiller":
        navigate("/conseiller/dashboard");
        break;
      case "etudiant":
      default:
        navigate("/dashboard");
        break;
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour compléter votre profil");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const userId = typeof user.id === 'number' ? String(user.id) : user.id;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          department: formData.role || 'etudiant',
          status: 'active',
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          bio: formData.bio,
          interests: formData.interests,
          experience: formData.experience,
          education: formData.education,
          updated_at: new Date().toISOString(),
          email: user.email,
        });

      if (updateError) {
        toast.error("Erreur lors de la mise à jour du profil");
        console.error(updateError);
        return;
      }

      toast.success("Profil complété avec succès !");
      redirectBasedOnRole(formData.role);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <UserCog className="h-8 w-8 text-purple-600" />;
      case "conseiller":
        return <BookOpen className="h-8 w-8 text-blue-600" />;
      case "etudiant":
        return <GraduationCap className="h-8 w-8 text-green-600" />;
      case "entreprise":
        return <Building2 className="h-8 w-8 text-orange-600" />;
      default:
        return <UserCircle2 className="h-8 w-8 text-gray-600" />;
    }
  };

  const steps = [
    {
      title: "Choix du profil",
      content: (
        <div className="space-y-6">
          <p className="text-center text-gray-600 mb-4">
            Veuillez sélectionner votre type de profil pour personnaliser votre expérience
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["etudiant", "conseiller", "admin", "entreprise"].map((role) => (
              <div 
                key={role}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.role === role 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => updateFormData("role", role)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-full">
                    {getRoleIcon(role)}
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{role}</h3>
                    <p className="text-sm text-gray-500">
                      {role === "etudiant" && "Accès aux tests et conseillers"}
                      {role === "conseiller" && "Accompagnement des étudiants"}
                      {role === "admin" && "Gestion de la plateforme"}
                      {role === "entreprise" && "Recrutement et partenariats"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {formData.role && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Vous avez choisi:</strong> <Badge>{formData.role}</Badge>
                <br />
                {formData.role === "etudiant" && "En tant qu'étudiant, vous pourrez passer des tests d'orientation, consulter des ressources et prendre rendez-vous avec des conseillers."}
                {formData.role === "conseiller" && "En tant que conseiller, vous pourrez accompagner les étudiants, gérer vos rendez-vous et vos disponibilités."}
                {formData.role === "admin" && "En tant qu'administrateur, vous aurez accès à toutes les fonctionnalités de gestion de la plateforme."}
                {formData.role === "entreprise" && "En tant qu'entreprise, vous pourrez publier des offres et entrer en contact avec des talents."}
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Informations personnelles",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="Votre prénom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Votre nom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              placeholder="Votre numéro de téléphone"
            />
          </div>
        </div>
      )
    },
    {
      title: "Profil détaillé",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateFormData("bio", e.target.value)}
              placeholder="Parlez-nous un peu de vous..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Centres d'intérêt</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => updateFormData("interests", e.target.value)}
              placeholder="Vos centres d'intérêt..."
            />
          </div>
        </div>
      )
    },
    {
      title: "Parcours",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="education">Formation</Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => updateFormData("education", e.target.value)}
              placeholder="Votre parcours de formation..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Expérience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => updateFormData("experience", e.target.value)}
              placeholder="Vos expériences professionnelles..."
            />
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.role;
      case 2:
        return !!formData.firstName && !!formData.lastName;
      case 3:
        return !!formData.bio;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="background-pattern"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b">
            <CardTitle className="text-2xl text-center">
              {steps[step - 1].title}
            </CardTitle>
            
            <div className="w-full flex justify-between items-center mt-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div 
                    className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${s === step 
                        ? 'bg-primary text-white' 
                        : s < step 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {s < step ? '✓' : s}
                  </div>
                  {s < 4 && (
                    <div 
                      className={`h-1 w-10 
                        ${s < step ? 'bg-primary/40' : 'bg-gray-200'}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {steps[step - 1].content}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(s => s - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
              )}
              <div className="flex-1" />
              {step < steps.length ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  {loading ? "Traitement..." : "Terminer"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
