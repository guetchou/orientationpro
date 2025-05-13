
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Compass, Users, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function OrientationServices() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Demander une Orientation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 text-center">
            Découvrez nos services personnalisés d'orientation professionnelle pour vous guider vers le succès
          </p>
          
          <Tabs defaultValue="services" className="w-full mb-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Nos Services</TabsTrigger>
              <TabsTrigger value="process">Notre Processus</TabsTrigger>
              <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Compass className="mr-2 h-5 w-5" /> Consultation Individuelle
                    </CardTitle>
                    <CardDescription>
                      Séances personnalisées avec nos conseillers d'orientation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Évaluation complète de votre profil
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Plan de développement personnalisé
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Suivi continu de votre progression
                      </li>
                    </ul>
                    <Button asChild className="w-full mt-4">
                      <Link to="/appointment">Prendre rendez-vous</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" /> Ateliers de Groupe
                    </CardTitle>
                    <CardDescription>
                      Sessions collectives pour développer vos compétences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Techniques de recherche d'emploi
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Préparation aux entretiens
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Développement du réseau professionnel
                      </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link to="/contact">En savoir plus</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" /> Orientation Académique
                    </CardTitle>
                    <CardDescription>
                      Conseil pour vos choix d'études et de formation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Exploration des filières adaptées
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Information sur les établissements
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Conseil sur les bourses disponibles
                      </li>
                    </ul>
                    <Button asChild className="w-full mt-4">
                      <Link to="/establishments">Explorer les établissements</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardHeader className="bg-primary/5 rounded-t-lg">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" /> Ressources Professionnelles
                    </CardTitle>
                    <CardDescription>
                      Outils et documentation pour votre développement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Bibliothèque de ressources spécialisées
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Modèles de CV et lettres de motivation
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        Guides des métiers et secteurs d'activité
                      </li>
                    </ul>
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link to="/resources">Accéder aux ressources</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="process">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <span className="flex items-center justify-center w-6 h-6 text-primary font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Évaluation Initiale</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Nos conseillers commencent par une analyse approfondie de votre parcours, vos compétences, 
                          vos intérêts et vos aspirations professionnelles à travers des tests et des entretiens.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <span className="flex items-center justify-center w-6 h-6 text-primary font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Élaboration du Plan</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Sur base des résultats de l'évaluation, nous développons ensemble un plan d'action 
                          personnalisé qui définit clairement les étapes à suivre pour atteindre vos objectifs professionnels.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <span className="flex items-center justify-center w-6 h-6 text-primary font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Mise en Œuvre et Accompagnement</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Nous vous accompagnons dans la mise en œuvre de votre plan, avec des conseils pratiques, 
                          des ressources adaptées et un soutien continu pour surmonter les obstacles.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <span className="flex items-center justify-center w-6 h-6 text-primary font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Suivi et Évaluation</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Des sessions régulières de suivi permettent d'évaluer votre progression, d'ajuster 
                          le plan si nécessaire et de célébrer les succès obtenus tout au long de votre parcours.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="testimonials">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <p className="italic mb-4">
                      "Grâce à l'accompagnement d'Orientation Pro Congo, j'ai pu identifier mes véritables passions 
                      et trouver une formation qui correspond parfaitement à mes aspirations."
                    </p>
                    <div className="flex items-center">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-bold">JM</span>
                      </div>
                      <div>
                        <p className="font-medium">Jean Mutombo</p>
                        <p className="text-sm text-gray-600">Étudiant en informatique</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <p className="italic mb-4">
                      "Les ateliers de groupe m'ont donné des outils précieux pour ma recherche d'emploi. 
                      J'ai décroché un poste dans mon domaine de prédilection en moins de deux mois!"
                    </p>
                    <div className="flex items-center">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-bold">SL</span>
                      </div>
                      <div>
                        <p className="font-medium">Sophie Lukusa</p>
                        <p className="text-sm text-gray-600">Chargée de communication</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center mt-8">
                <Button asChild size="lg">
                  <Link to="/appointment">Commencer Mon Parcours</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-primary/5 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center">
              <Calendar className="h-12 w-12 text-primary mb-4 md:mb-0 md:mr-6" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Envie de démarrer votre orientation?</h3>
                <p className="mb-4">
                  Prenez rendez-vous avec l'un de nos conseillers pour une consultation personnalisée.
                </p>
                <Button asChild>
                  <Link to="/appointment">Réserver une consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
