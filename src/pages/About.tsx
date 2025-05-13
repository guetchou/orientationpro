
import React from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Briefcase, Award, Star } from 'lucide-react';

export default function About() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">À Propos de Nous</h1>
          
          <Card className="mb-12 border-0 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2 h-6 w-6 text-primary" /> Notre Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Chez Orientation Pro Congo, notre mission est d'accompagner chaque personne dans son 
                parcours d'orientation professionnelle et de développement de carrière. Nous visons à 
                créer des ponts entre les talents et les opportunités, à travers des services 
                personnalisés et des outils innovants qui répondent aux besoins du marché du travail congolais.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Nous croyons fermement que chaque individu possède un potentiel unique qui, 
                lorsqu'il est correctement identifié et développé, peut contribuer significativement 
                à l'économie nationale et à l'épanouissement personnel.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" /> Notre Équipe
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Notre équipe est composée de professionnels passionnés par l'orientation et le 
                  développement professionnel. Conseillers en orientation, psychologues, experts 
                  en ressources humaines et développeurs travaillent main dans la main pour offrir 
                  des services de qualité.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Briefcase className="mr-2 h-5 w-5 text-primary" /> Nos Services
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Nous proposons des tests d'orientation scientifiquement validés, des consultations 
                  personnalisées avec des conseillers expérimentés, des ressources pédagogiques 
                  adaptées et une plateforme de mise en relation avec des établissements de formation 
                  et des employeurs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
              <Award className="mr-2 h-6 w-6 text-primary" /> Nos Valeurs
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Star className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Excellence</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous visons l'excellence dans tous nos services et outils
                </p>
              </div>
              <div className="text-center">
                <Star className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Intégrité</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous agissons avec honnêteté et transparence
                </p>
              </div>
              <div className="text-center">
                <Star className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Innovation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous développons constamment de nouvelles solutions
                </p>
              </div>
              <div className="text-center sm:col-span-2 md:col-span-3">
                <Star className="mx-auto h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium mb-1">Engagement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nous nous engageons pleinement dans l'accompagnement de chaque utilisateur
                </p>
              </div>
            </div>
          </div>
          
          <Card className="mb-8 border-0 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Notre Vision</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Devenir la référence en matière d'orientation professionnelle et de développement 
                de carrière en République Démocratique du Congo, en offrant des services accessibles, 
                innovants et adaptés aux réalités locales.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
