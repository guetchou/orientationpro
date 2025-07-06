import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { CheckCircle, Users, Briefcase, FileCheck, BarChart, Target, Zap, Shield, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import CandidatureForm from '@/components/recrutement/CandidatureForm';

const Recrutement = () => {
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                    <Target className="w-3 h-3 mr-1" />
                    Système ATS Professionnel
                  </Badge>
                  <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Recrutement Intelligent
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Optimisez vos recrutements avec notre plateforme ATS moderne. 
                    Gérez les candidatures, automatisez le tri et collaborez efficacement 
                    pour sélectionner les meilleurs talents.
                  </p>
                </motion.div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Automatisation Intelligente</h3>
                        <p className="text-gray-600">IA pour l'analyse de CV et le tri automatique</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Collaboration d'Équipe</h3>
                        <p className="text-gray-600">Partagez et évaluez les candidatures ensemble</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Sécurité & Conformité</h3>
                        <p className="text-gray-600">Protection des données et respect RGPD</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Demander une démo
                    </Button>
                    <Button variant="outline" size="lg">
                      <BarChart className="mr-2 h-5 w-5" />
                      Voir nos tarifs
                    </Button>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative"
                >
                  <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500/20">
                    <AspectRatio ratio={4/3}>
                      <img 
                        src="/images/carousel/orientation-1.png" 
                        alt="Plateforme ATS moderne" 
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">En ligne</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités principales */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Fonctionnalités Avancées</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Une suite complète d'outils pour optimiser chaque étape de votre processus de recrutement
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <FileCheck className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Gestion des Candidatures</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Centralisez toutes vos candidatures dans une interface intuitive. 
                    Organisez par poste, statut et suivez la progression en temps réel.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Import automatique</span>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                    <BarChart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Analyse IA des CV</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Notre intelligence artificielle analyse les CV pour identifier 
                    les compétences clés et évaluer l'adéquation avec vos offres.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Scoring automatique</span>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Collaboration d'Équipe</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Partagez les profils avec votre équipe, attribuez des évaluations 
                    et commentez pour des décisions collectives éclairées.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Workflow collaboratif</span>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Planification d'Entretiens</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Programmez facilement des entretiens en synchronisant les disponibilités 
                    avec des rappels automatiques et notifications.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Calendrier intégré</span>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                    <Mail className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Communication Automatisée</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Envoyez des emails personnalisés à chaque étape du processus, 
                    depuis l'accusé de réception jusqu'aux réponses finales.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Templates personnalisables</span>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <div className="h-16 w-16 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Sécurité & Conformité</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Protection des données personnelles, chiffrement SSL et 
                    conformité RGPD pour une gestion éthique des candidatures.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-500">Certification RGPD</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Processus en 4 étapes */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Processus Simplifié</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Un workflow en 4 étapes pour optimiser votre recrutement de A à Z
              </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto">
              <div className="space-y-16">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row gap-12 items-center"
                >
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                      <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mb-6">1</div>
                      <h3 className="text-2xl font-bold mb-4">Publiez vos Offres</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Créez vos annonces dans notre système et diffusez-les sur votre site carrière 
                        et les principaux job boards en un clic. Personnalisez vos formulaires de candidature.
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Diffusion multi-canal</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="/images/carousel/orientation-2.png" 
                        alt="Publication d'offres" 
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row-reverse gap-12 items-center"
                >
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                      <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-2xl mb-6">2</div>
                      <h3 className="text-2xl font-bold mb-4">Recevez & Triez</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Les candidatures sont automatiquement importées dans le système. 
                        Notre IA analyse les CV et les classe selon leur pertinence pour vos postes.
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Tri intelligent</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="/images/carousel/orientation-3.png" 
                        alt="Tri des candidatures" 
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row gap-12 items-center"
                >
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                      <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-6">3</div>
                      <h3 className="text-2xl font-bold mb-4">Collaborez & Évaluez</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Partagez les profils avec votre équipe, évaluez les candidats ensemble 
                        et avancez dans le processus de sélection de manière collaborative.
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Évaluation d'équipe</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="/images/carousel/orientation-4.png" 
                        alt="Collaboration d'équipe" 
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col lg:flex-row-reverse gap-12 items-center"
                >
                  <div className="lg:w-1/2">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                      <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-2xl mb-6">4</div>
                      <h3 className="text-2xl font-bold mb-4">Recrutez & Intégrez</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Finalisez vos recrutements avec des outils d'onboarding intégrés. 
                        Suivez l'intégration et mesurez le succès de vos embauches.
                      </p>
                      <div className="mt-6 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-600">Onboarding intégré</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="/images/carousel/orientation-5.png" 
                        alt="Intégration des nouveaux" 
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Prêt à révolutionner votre recrutement ?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Rejoignez les entreprises qui font confiance à notre plateforme ATS 
                  pour optimiser leurs processus de recrutement et attirer les meilleurs talents.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Demander une démo gratuite
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Phone className="mr-2 h-5 w-5" />
                    Nous contacter
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold mb-6">Contactez notre Équipe</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Notre équipe d'experts est là pour vous accompagner dans la mise en place 
                  de votre solution de recrutement personnalisée.
                </p>
              </motion.div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-6">Informations de Contact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Email</p>
                          <p className="text-gray-600">contact@orientationprocongo.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Téléphone</p>
                          <p className="text-gray-600">+242 00 000 000</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Adresse</p>
                          <p className="text-gray-600">Brazzaville, République du Congo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <CandidatureForm />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Recrutement;
