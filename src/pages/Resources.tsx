import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DownloadIcon, BookOpen, FileText, Video, Presentation, Users } from 'lucide-react';

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <h1 className="text-4xl font-bold mb-4">Ressources Utiles</h1>
              <p className="text-gray-600 text-lg">
                Découvrez une sélection de ressources pour vous accompagner dans votre orientation et votre développement professionnel.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <BookOpen className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Guides d'Orientation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Téléchargez nos guides complets pour vous aider à choisir la voie qui vous correspond.
                </p>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Télécharger le guide
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <FileText className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Articles de Blog</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Explorez nos articles de blog pour des conseils et des informations sur le monde du travail.
                </p>
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link to="/blog">
                    <BookOpen className="h-4 w-4" />
                    Lire les articles
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Video className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Vidéos de Conseils</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Regardez nos vidéos pour des astuces et des stratégies pour réussir votre carrière.
                </p>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Regarder les vidéos
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Presentation className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Webinaires</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Inscrivez-vous à nos webinaires pour interagir avec des experts et poser vos questions.
                </p>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  S'inscrire aux webinaires
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Users className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Forums de Discussion</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Participez à nos forums pour échanger avec d'autres personnes et obtenir des conseils personnalisés.
                </p>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Rejoindre les forums
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <FileText className="text-primary mr-3 h-6 w-6" />
                  <h3 className="text-xl font-semibold">Modèles de CV</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Téléchargez nos modèles de CV professionnels pour vous démarquer auprès des recruteurs.
                </p>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  Télécharger les modèles
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resources;
