import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  MessageCircle, 
  Clock, 
  Star, 
  ArrowRight,
  Users,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const ConseillerSection = () => {
  const benefits = [
    "Analyse personnalisée de votre profil",
    "Plan de carrière sur-mesure",
    "Accompagnement jusqu'à l'emploi",
    "Suivi régulier et ajustements"
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Étudiante en Marketing",
      content: "Mon conseiller m'a aidée à identifier mes forces et à choisir la bonne formation.",
      rating: 5
    },
    {
      name: "David K.",
      role: "Ingénieur",
      content: "Grâce à l'accompagnement, j'ai trouvé un poste qui correspond parfaitement à mes compétences.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Côté gauche - Contenu principal */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-4 py-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 mr-2" />
                Accompagnement personnalisé
              </Badge>
            </motion.div>

            {/* Titre */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Besoin d'un parcours{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                  sur-mesure ?
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                💬 <strong>Discutez avec un conseiller certifié</strong> – 1ère session gratuite !
              </p>
            </motion.div>

            {/* Avantages */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Ce que vous obtenez :</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA principal */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Link to="/conseiller">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Réserver maintenant
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Session de 45 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 satisfaction</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Côté droit - Carte conseiller */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Photo du conseiller */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="absolute -top-8 -left-8 z-20"
            >
              <div className="relative">
                <div 
                  className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-yellow-400 shadow-xl"
                  style={{
                    backgroundImage: `url('/images/carousel/orientation-2.png')`
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </motion.div>

            {/* Carte principale */}
            <motion.div
              initial={{ rotate: -2, scale: 0.9 }}
              whileInView={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              {/* En-tête de la carte */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Conseiller Pro</h3>
                    <p className="text-sm text-gray-500">Orientation Pro Congo</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Disponible</Badge>
              </div>

              {/* Informations du conseiller */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Expérience</span>
                  <span className="text-sm text-gray-600">8+ années</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Étudiants accompagnés</span>
                  <span className="text-sm text-gray-600">500+</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Note moyenne</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">4.9</span>
                  </div>
                </div>
              </div>

              {/* Disponibilités */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Prochaines disponibilités :</h4>
                <div className="space-y-2">
                  {['Aujourd\'hui 14h', 'Demain 10h', 'Demain 16h'].map((time, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{time}</span>
                      <Badge variant="outline" className="text-xs">Libre</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton de réservation */}
              <Link to="/conseiller">
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white">
                  Réserver ma session
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Témoignages flottants avec photo */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              viewport={{ once: true }}
              className="absolute -bottom-8 -right-8 bg-white rounded-lg shadow-lg p-4 border border-gray-100 max-w-xs"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-yellow-400"
                  style={{
                    backgroundImage: `url('/images/carousel/orientation-3.png')`
                  }}
                />
                <div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Sarah M., Brazzaville</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "Mon conseiller m'a guidée vers la formation parfaite !"
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 