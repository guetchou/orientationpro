
import { useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building, Search, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Recrutement() {
  const [activeTab, setActiveTab] = useState('recherche');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 -z-10 backdrop-blur-[80px]"></div>
      <div className="absolute inset-0 -z-10 bg-grid-white/10 bg-[size:20px_20px]"></div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold font-heading mb-4"
          >
            Système de Suivi des Candidats
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            Trouvez les talents idéaux pour votre entreprise ou découvrez des opportunités professionnelles alignées avec votre profil
          </motion.p>
        </div>

        <Tabs defaultValue="recherche" className="max-w-5xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="recherche" className="py-3">
              <Search className="mr-2 h-4 w-4" /> Recherche d'emploi
            </TabsTrigger>
            <TabsTrigger value="recrutement" className="py-3">
              <Users className="mr-2 h-4 w-4" /> Espace recruteurs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recherche">
            <Card>
              <CardHeader>
                <CardTitle>Trouvez votre prochain emploi</CardTitle>
                <CardDescription>
                  Créez votre profil professionnel et découvrez des opportunités adaptées à vos compétences et aspirations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col items-center p-6 bg-primary/5 rounded-lg text-center">
                    <Briefcase className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Profil candidat</h3>
                    <p className="text-gray-600 mb-4">Créez votre CV digital et soyez visible auprès des recruteurs</p>
                    <Button className="mt-auto">Créer mon profil</Button>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 bg-primary/5 rounded-lg text-center">
                    <Search className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Offres d'emploi</h3>
                    <p className="text-gray-600 mb-4">Explorez les opportunités correspondant à votre profil</p>
                    <Button className="mt-auto" variant="outline">Voir les offres</Button>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Cette fonctionnalité est en version bêta. N'hésitez pas à nous faire part de vos retours !
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recrutement">
            <Card>
              <CardHeader>
                <CardTitle>Recrutez efficacement</CardTitle>
                <CardDescription>
                  Publiez vos offres, gérez vos candidatures et trouvez les talents idéaux pour votre entreprise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col items-center p-6 bg-primary/5 rounded-lg text-center">
                    <Building className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Espace entreprise</h3>
                    <p className="text-gray-600 mb-4">Créez votre profil entreprise et gérez vos recrutements</p>
                    <Button asChild className="mt-auto">
                      <Link to="/login">Se connecter</Link>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center p-6 bg-primary/5 rounded-lg text-center">
                    <Users className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Gestion des candidatures</h3>
                    <p className="text-gray-600 mb-4">Suivez et évaluez les candidatures pour vos offres d'emploi</p>
                    <Button variant="outline" className="mt-auto" asChild>
                      <Link to="/admin/ats">Accéder au tableau de bord</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-8">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Besoin d'aide pour votre stratégie de recrutement ?</h4>
                      <p className="text-sm text-blue-700">
                        Nos conseillers sont disponibles pour vous accompagner dans l'optimisation de votre processus de recrutement.
                      </p>
                      <Button size="sm" variant="link" className="mt-2 p-0 h-auto text-blue-600" asChild>
                        <Link to="/contact">Nous contacter</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
