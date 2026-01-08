import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Brain, 
  BarChart3, 
  Users, 
  Building2,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Plus,
  Settings,
  FileText,
  MessageSquare,
  Calendar,
  Star,
  Shield,
  CheckCircle,
  Globe,
  Award
} from 'lucide-react';

import { ProfessionalJobBoard } from '@/components/recruitment/ProfessionalJobBoard';
import { JobMatchingDashboard } from '@/components/recruitment/JobMatchingDashboard';
import { JobApplicationModal } from '@/components/recruitment/JobApplicationModal';
import { RecruitmentPipeline } from '@/components/recruitment/RecruitmentPipeline';

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('job-board');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleJobApply = (job: any) => {
    setSelectedJob(job);
    setIsApplicationModalOpen(true);
  };

  const handleCloseApplicationModal = () => {
    setIsApplicationModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <>
      {/* Métadonnées SEO */}
      <head>
        <title>Plateforme de Recrutement IA - OrientationPro Congo</title>
        <meta name="description" content="Découvrez notre plateforme de recrutement intelligente au Congo. Matching IA, pipeline automatisé, et gestion complète des candidatures pour les entreprises." />
        <meta name="keywords" content="recrutement Congo, emploi Brazzaville, matching IA, ATS, recrutement intelligent" />
        <meta property="og:title" content="Plateforme de Recrutement IA - OrientationPro Congo" />
        <meta property="og:description" content="La première plateforme de recrutement intelligente du Congo avec IA pour un matching parfait candidat-emploi." />
      </head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto py-8 px-4">
          
          {/* Hero Section avec structure HTML sémantique */}
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge de crédibilité */}
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                <Shield className="w-4 h-4 mr-2" />
                Plateforme Certifiée & Sécurisée
              </Badge>

              {/* Titre principal H1 pour SEO */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Plateforme de{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Recrutement IA
                </span>
                <br />
                <span className="text-2xl md:text-3xl text-gray-600">Congo</span>
              </h1>

              {/* Sous-titre descriptif */}
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                La première plateforme de recrutement intelligente du Congo. 
                <strong> Matching IA avancé</strong>, <strong>pipeline automatisé</strong> et 
                <strong> gestion complète</strong> pour transformer votre processus de recrutement.
              </p>

              {/* Statistiques de crédibilité */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Offres Actives</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">15k+</div>
                  <div className="text-sm text-gray-600">Candidats Inscrits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">200+</div>
                  <div className="text-sm text-gray-600">Entreprises Partenaires</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
                  <div className="text-sm text-gray-600">Taux de Satisfaction</div>
                </div>
              </div>

              {/* CTA Principal */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Explorer les Offres
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4">
                  <Building2 className="w-5 h-5 mr-2" />
                  Publier une Offre
                </Button>
              </div>
            </motion.div>
          </header>

          {/* Section Valeurs et Différenciation */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Pourquoi Choisir Notre Plateforme ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">IA Avancée</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Notre algorithme d'IA analyse les compétences, l'expérience et la compatibilité culturelle 
                      pour un matching précis entre candidats et emplois.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">Pipeline Automatisé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Automatisez votre processus de recrutement : tri, évaluation, communication 
                      et suivi des candidatures en temps réel.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-8 h-8 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">Focus Congo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Conçu spécifiquement pour le marché congolais : entreprises locales, 
                      candidats qualifiés et opportunités adaptées à notre contexte.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Navigation par onglets améliorée */}
          <section className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-4xl grid-cols-2 lg:grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200/50">
                  <TabsTrigger value="job-board" className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Job Board</span>
                  </TabsTrigger>
                  <TabsTrigger value="matching" className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline">Matching IA</span>
                  </TabsTrigger>
                  <TabsTrigger value="pipeline" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Pipeline</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenu des onglets */}
              <TabsContent value="job-board" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Offres d'Emploi Actives
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Découvrez les meilleures opportunités professionnelles au Congo, 
                    filtrées et triées par notre IA pour correspondre à vos compétences.
                  </p>
                </div>
                <ProfessionalJobBoard />
              </TabsContent>

              <TabsContent value="matching" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Matching Intelligent IA
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Notre algorithme d'IA analyse vos compétences et trouve les emplois 
                    qui correspondent parfaitement à votre profil.
                  </p>
                </div>
                <JobMatchingDashboard />
              </TabsContent>

              <TabsContent value="pipeline" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Pipeline de Recrutement
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Suivez vos candidatures en temps réel avec notre pipeline automatisé 
                    et optimisez votre processus de recrutement.
                  </p>
                </div>
                <RecruitmentPipeline />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Analytics & Insights
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Analysez les performances de vos recrutements avec des données 
                    détaillées et des insights actionables.
                  </p>
                </div>
                <JobMatchingDashboard />
              </TabsContent>
            </Tabs>
          </section>

          {/* Section Témoignages pour la crédibilité */}
          <section className="py-16 bg-white/50 rounded-2xl mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Ils Nous Font Confiance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">MTN Congo</h3>
                        <p className="text-sm text-gray-600">Télécommunications</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 italic">
                      "OrientationPro a révolutionné notre recrutement. 
                      Le matching IA nous fait gagner 60% de temps."
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Banque Commerciale du Congo</h3>
                        <p className="text-sm text-gray-600">Services Financiers</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 italic">
                      "Plateforme exceptionnelle pour trouver les meilleurs talents. 
                      Interface intuitive et résultats impressionnants."
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Ministère de l'Éducation</h3>
                        <p className="text-sm text-gray-600">Secteur Public</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 italic">
                      "Solution parfaite pour nos recrutements d'enseignants. 
                      Qualité des candidats et efficacité remarquables."
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Prêt à Transformer Votre Recrutement ?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Rejoignez les entreprises qui révolutionnent leur processus de recrutement 
                avec notre plateforme IA.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Commencer Maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Demander une Démo
                </Button>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Modal d'application */}
        <JobApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={handleCloseApplicationModal}
          job={selectedJob}
        />
      </div>
    </>
  );
}