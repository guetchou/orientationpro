
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Briefcase, PenTool, School, Users, Clock, ArrowUpRight, ArrowRight, FileText, Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { ChatBot } from "@/components/chat/ChatBot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Recrutement() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    motivation: "",
    experience: ""
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setFileError("Format de fichier non supporté. Veuillez télécharger un PDF ou un document Word.");
        setFile(null);
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("Le fichier est trop volumineux. Taille maximale: 5MB");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setFileError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let resumeUrl = null;
      
      // Upload CV if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        resumeUrl = filePath;
      }
      
      // Store candidate data
      const { error } = await supabase
        .from('candidates')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          motivation: formData.motivation,
          experience: formData.experience,
          resume_url: resumeUrl,
          status: 'new',
          rating: 0
        });
        
      if (error) throw error;
      
      toast.success("Votre candidature a bien été envoyée. Nous vous contacterons rapidement !");
      setSubmitSuccess(true);
      
      // Réinitialisation du formulaire
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        motivation: "",
        experience: ""
      });
      setFile(null);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la candidature:", error);
      toast.error("Une erreur s'est produite lors de l'envoi de votre candidature");
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    {
      title: "Conseiller d'orientation",
      department: "Orientation",
      type: "Temps plein",
      location: "Paris, France",
      description: "Accompagner les étudiants dans leur parcours d'orientation, réaliser des entretiens individuels et animer des ateliers collectifs."
    },
    {
      title: "Psychologue scolaire",
      department: "Support psychologique",
      type: "Temps partiel",
      location: "Lyon, France",
      description: "Évaluer les besoins psychologiques des étudiants, fournir un soutien thérapeutique et collaborer avec les conseillers d'orientation."
    },
    {
      title: "Chargé(e) de relations établissements",
      department: "Partenariats",
      type: "Temps plein",
      location: "Bordeaux, France",
      description: "Développer et maintenir des relations avec les écoles, universités et centres de formation professionnelle."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Rejoignez notre équipe</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participez à notre mission d'aider les étudiants à trouver leur voie et à réaliser leur plein potentiel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Pourquoi nous rejoindre ?
            </h2>
            
            <ul className="space-y-6">
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Impact social positif</h3>
                  <p className="text-muted-foreground">Contribuez directement à l'avenir des jeunes en les aidant à trouver leur voie professionnelle.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <School className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Développement professionnel</h3>
                  <p className="text-muted-foreground">Accédez à des formations continues et évoluez dans un environnement stimulant intellectuellement.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Équilibre vie pro/perso</h3>
                  <p className="text-muted-foreground">Bénéficiez d'horaires flexibles et d'un environnement de travail qui respecte votre vie personnelle.</p>
                </div>
              </motion.li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              Postes disponibles
            </h2>
            
            <div className="space-y-4">
              {positions.map((position, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/90 backdrop-blur p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{position.title}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{position.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span>{position.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{position.description}</p>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, position: position.title }));
                      window.scrollTo({ 
                        top: document.getElementById('application-form')?.offsetTop || 0,
                        behavior: 'smooth'
                      });
                    }}
                  >
                    Postuler <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {submitSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur rounded-xl p-8 max-w-2xl mx-auto text-center shadow-lg border border-gray-100"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Candidature envoyée avec succès !</h2>
            <p className="mb-6 text-gray-600">
              Merci pour votre intérêt à rejoindre notre équipe. Nous avons bien reçu votre candidature et 
              l'examinerons avec attention. Nous vous contacterons prochainement pour vous tenir informé(e) 
              de l'évolution de votre candidature.
            </p>
            <Button 
              onClick={() => setSubmitSuccess(false)}
              className="bg-primary hover:bg-primary/90"
            >
              Soumettre une nouvelle candidature
            </Button>
          </motion.div>
        ) : (
          <div id="application-form" className="bg-white/90 backdrop-blur rounded-xl p-6 md:p-8 shadow-lg border border-gray-100 mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Postuler maintenant</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean.dupont@exemple.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06 12 34 56 78"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Poste souhaité</Label>
                  <Input 
                    id="position" 
                    name="position" 
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Conseiller d'orientation"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience professionnelle</Label>
                <Textarea 
                  id="experience" 
                  name="experience" 
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Décrivez vos expériences professionnelles pertinentes"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motivation">Lettre de motivation</Label>
                <Textarea 
                  id="motivation" 
                  name="motivation" 
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Parlez-nous de votre motivation pour rejoindre notre équipe"
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resume">CV (PDF ou Word, 5MB max)</Label>
                <div className="flex items-center gap-4">
                  <label 
                    htmlFor="resume" 
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {file ? file.name : "Sélectionner un fichier"}
                  </label>
                  <input 
                    id="resume" 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx" 
                    className="hidden"
                  />
                  {file && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {fileError && (
                  <p className="text-red-500 text-sm mt-1">{fileError}</p>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={loading || !!fileError}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer ma candidature
                      <FileText className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground hidden md:block">
                  Nous répondons à toutes les candidatures dans un délai de 7 jours.
                </p>
              </div>
              
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertTitle>Protection des données</AlertTitle>
                <AlertDescription>
                  En soumettant ce formulaire, vous acceptez que vos données personnelles soient traitées 
                  conformément à notre politique de protection des données.
                </AlertDescription>
              </Alert>
            </form>
          </div>
        )}
        
        <div className="bg-primary/5 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Vous avez des questions ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Notre équipe RH est disponible pour répondre à toutes vos questions concernant nos opportunités d'emploi.
          </p>
          <Button variant="outline" className="gap-2">
            Contactez-nous
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </main>

      <ChatBot />
      <Footer />
    </div>
  );
}
