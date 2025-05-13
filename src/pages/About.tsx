import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/Footer'; // Correction de l'import

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-4">À Propos d'Orientation Pro Congo</h1>
            <p className="text-gray-600 leading-relaxed">
              Nous sommes une équipe passionnée dédiée à l'orientation scolaire et professionnelle des jeunes congolais.
              Notre mission est de vous aider à découvrir votre potentiel et à construire un avenir épanouissant.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Notre Histoire</h2>
            <p className="text-gray-700 leading-relaxed">
              Fondée en 2023, Orientation Pro Congo est née d'un constat simple : le manque d'informations et d'accompagnement
              pour les jeunes congolais face aux choix d'orientation. Nous avons donc décidé de créer une plateforme
              accessible et complète, offrant des tests d'orientation, des conseils personnalisés et des ressources utiles.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Notre Équipe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Membre 1 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">Jean-Pierre M.</h3>
                <p className="text-gray-500 mb-3">Fondateur & CEO</p>
                <p className="text-gray-700 leading-relaxed">
                  Passionné par l'éducation et l'avenir des jeunes, Jean-Pierre a créé Orientation Pro Congo pour
                  offrir une solution concrète aux défis de l'orientation.
                </p>
              </div>

              {/* Membre 2 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">Marie-Claire K.</h3>
                <p className="text-gray-500 mb-3">Conseillère d'Orientation</p>
                <p className="text-gray-700 leading-relaxed">
                  Forte de son expérience en tant que conseillère d'orientation, Marie-Claire accompagne les jeunes
                  dans leur réflexion et leur choix de carrière.
                </p>
              </div>

              {/* Membre 3 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">David L.</h3>
                <p className="text-gray-500 mb-3">Développeur Web</p>
                <p className="text-gray-700 leading-relaxed">
                  David est le cerveau derrière la plateforme Orientation Pro Congo. Il veille à ce que la plateforme
                  soit accessible, intuitive et performante.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Nos Valeurs</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>L'Accompagnement Personnalisé :</strong> Chaque jeune est unique, nous adaptons notre approche à vos besoins.</li>
              <li><strong>L'Expertise :</strong> Nos conseillers sont des professionnels qualifiés et expérimentés.</li>
              <li><strong>L'Accessibilité :</strong> Nous voulons rendre l'orientation accessible à tous, quel que soit votre origine ou votre situation.</li>
              <li><strong>L'Innovation :</strong> Nous utilisons les dernières technologies pour vous offrir une expérience d'orientation optimale.</li>
            </ul>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Prêt à découvrir votre potentiel ?</h2>
            <p className="text-gray-600 mb-6">
              Réalisez dès maintenant un test d'orientation et commencez à construire votre avenir !
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <a href="/tests" className="flex items-center gap-2">
                Faire un Test d'Orientation <ChevronRight />
              </a>
            </Button>
          </section>
        </motion.div>
      </div>
      <Separator />
      <Footer />
    </div>
  );
};

export default About;
