
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Briefcase, GraduationCap, Users } from "lucide-react";

const OrientationGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Guide d'orientation professionnelle</h1>
        
        <Tabs defaultValue="secondary" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="secondary" className="flex flex-col items-center py-4">
              <Book className="h-5 w-5 mb-1" />
              <span>Lycée</span>
            </TabsTrigger>
            <TabsTrigger value="university" className="flex flex-col items-center py-4">
              <GraduationCap className="h-5 w-5 mb-1" />
              <span>Université</span>
            </TabsTrigger>
            <TabsTrigger value="career" className="flex flex-col items-center py-4">
              <Briefcase className="h-5 w-5 mb-1" />
              <span>Carrière</span>
            </TabsTrigger>
            <TabsTrigger value="counseling" className="flex flex-col items-center py-4">
              <Users className="h-5 w-5 mb-1" />
              <span>Conseils</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="secondary">
            <Card>
              <CardHeader>
                <CardTitle>Orientation au lycée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Le choix de filière au lycée est une étape importante qui influence votre parcours universitaire et professionnel.</p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Filières disponibles :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Série A : Littéraire</li>
                    <li>Série C : Scientifique (Mathématiques et Physique)</li>
                    <li>Série D : Scientifique (Sciences de la Vie et de la Terre)</li>
                    <li>Série G : Gestion</li>
                    <li>Série T : Technique</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Comment choisir :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Identifiez vos matières préférées et vos points forts</li>
                    <li>Réfléchissez à vos objectifs universitaires et professionnels</li>
                    <li>Consultez notre test RIASEC pour mieux comprendre vos intérêts</li>
                    <li>Échangez avec vos enseignants et conseillers d'orientation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="university">
            <Card>
              <CardHeader>
                <CardTitle>Études supérieures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>L'entrée dans l'enseignement supérieur demande une réflexion approfondie sur vos aspirations et compétences.</p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Types d'établissements :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Universités : formations générales, recherche, longue durée</li>
                    <li>Grandes écoles : formations spécialisées, sélection sur concours</li>
                    <li>Instituts techniques : formations professionnalisantes, courte durée</li>
                    <li>Formations en alternance : théorie et pratique professionnelle</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Domaines d'études populaires :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Sciences et technologies</li>
                    <li>Économie, gestion et commerce</li>
                    <li>Droit et sciences politiques</li>
                    <li>Lettres, langues et sciences humaines</li>
                    <li>Santé et sciences médicales</li>
                    <li>Arts et design</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="career">
            <Card>
              <CardHeader>
                <CardTitle>Orientation professionnelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Votre carrière professionnelle évoluera tout au long de votre vie. Notre guide vous aide à faire des choix éclairés.</p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Secteurs en croissance :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Technologies de l'information</li>
                    <li>Énergie et environnement</li>
                    <li>Santé et services sociaux</li>
                    <li>Finance et assurance</li>
                    <li>Agriculture moderne et agroalimentaire</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Compétences recherchées :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Adaptabilité et apprentissage continu</li>
                    <li>Communication et travail en équipe</li>
                    <li>Résolution de problèmes complexes</li>
                    <li>Maîtrise des outils numériques</li>
                    <li>Créativité et innovation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="counseling">
            <Card>
              <CardHeader>
                <CardTitle>Accompagnement personnalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Notre équipe de conseillers d'orientation est à votre disposition pour vous guider dans vos choix scolaires et professionnels.</p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Services proposés :</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Entretiens individuels d'orientation</li>
                    <li>Ateliers collectifs de découverte des métiers</li>
                    <li>Tests d'orientation approfondie</li>
                    <li>Aide à la rédaction de CV et lettre de motivation</li>
                    <li>Préparation aux entretiens d'admission et d'embauche</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Comment prendre rendez-vous :</h3>
                  <p>Vous pouvez réserver une consultation avec un conseiller directement sur notre plateforme, dans la section "Rendez-vous" après vous être connecté à votre compte.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrientationGuide;
