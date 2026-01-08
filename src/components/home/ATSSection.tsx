import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; 
import { Link } from "react-router-dom";
import { Briefcase, Award, Users, TrendingUp, Search } from "lucide-react";

export const ATSSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-primary/10 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Recrutement et Gestion des Talents
          </h2>
          <p className="text-lg text-gray-700">
            Notre système de suivi des candidats (ATS) vous aide à trouver les meilleurs talents et à gérer efficacement votre processus de recrutement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-2xl font-bold mb-4">Pour les Recruteurs</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Gestion des candidatures</h4>
                  <p className="text-gray-600">Centralisez et organisez toutes vos candidatures en un seul endroit</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Évaluation des compétences</h4>
                  <p className="text-gray-600">Identifiez les meilleurs candidats grâce à notre système d'évaluation</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Analyse et reporting</h4>
                  <p className="text-gray-600">Suivez vos KPIs de recrutement et optimisez votre processus</p>
                </div>
              </li>
            </ul>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link to="/recrutement">Découvrir notre ATS</Link>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-8"
          >
            <h3 className="text-2xl font-bold mb-4">Pour les Candidats</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Profil professionnel</h4>
                  <p className="text-gray-600">Créez votre profil et mettez en valeur vos compétences pour les recruteurs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Recherche d'emploi</h4>
                  <p className="text-gray-600">Trouvez des offres qui correspondent à vos compétences et aspirations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Mise en relation</h4>
                  <p className="text-gray-600">Soyez mis en relation avec des recruteurs à la recherche de votre profil</p>
                </div>
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
              <Link to="/recrutement">Créer mon profil candidat</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/recrutement">
              <Briefcase className="mr-2 h-5 w-5" />
              Explorer toutes nos solutions de recrutement
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
