import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-600 border-blue-200">
              <Award className="w-4 h-4 mr-2" />
              À Propos d'OrientationPro
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              La <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Première Plateforme</span> d'Orientation au Congo
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Nous connectons talents et opportunités avec l'intelligence artificielle. 
              Notre mission est d'accompagner chaque Congolais dans ses choix d'orientation scolaire et professionnelle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Rejoindre notre mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Notre histoire
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Révolutionner l'orientation scolaire et professionnelle au Congo en utilisant 
                l'intelligence artificielle pour connecter chaque talent aux meilleures opportunités.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Orientation personnalisée avec IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Accès aux meilleures opportunités</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Accompagnement expert</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                <Target className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Impact au Congo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold">15,000+</div>
                    <div className="text-blue-100">Utilisateurs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-blue-100">Offres actives</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">150+</div>
                    <div className="text-blue-100">Partenaires</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-blue-100">Satisfaction</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident notre action et façonnent notre vision de l'orientation professionnelle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Empathie",
                description: "Nous comprenons les défis de l'orientation et accompagnons avec bienveillance chaque utilisateur."
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Excellence",
                description: "Nous visons l'excellence dans tous nos services pour offrir la meilleure expérience possible."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Inclusion",
                description: "L'orientation doit être accessible à tous, quel que soit le niveau d'études ou le milieu social."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Innovation",
                description: "Nous utilisons les dernières technologies pour révolutionner l'orientation professionnelle."
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Qualité",
                description: "Chaque conseil et chaque recommandation sont soigneusement élaborés par nos experts."
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Ambition",
                description: "Nous croyons en le potentiel de chaque Congolais et l'aidons à le révéler."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Rejoignez-nous dans cette mission
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Ensemble, transformons l'avenir professionnel du Congo et donnons à chaque talent les moyens de réussir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Commencer mon parcours
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Nous contacter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}