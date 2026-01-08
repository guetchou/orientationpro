import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AnimatedBackground,
  RevealText,
  FloatingCard,
  MagneticButton,
  AnimatedCounter,
  StaggeredGrid,
  ParallaxSection,
  TypewriterText,
  PremiumLoader
} from '@/components/home/PremiumAnimations';
import {
  PremiumCard,
  AnimatedTestimonial,
  InteractiveModule,
  AnimatedStat,
  PremiumModal
} from '@/components/home/PremiumComponents';
import { 
  ArrowRight, 
  Star, 
  Users, 
  Brain, 
  Briefcase, 
  Target,
  Heart,
  Zap,
  Shield,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  Sparkles,
  Globe,
  Eye,
  ChevronDown,
  Quote,
  BookOpen,
  MessageSquare,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  Lock,
  Unlock
} from 'lucide-react';

export default function PremiumHome() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Effet de chargement initial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Données pour les modules
  const modules = [
    {
      title: "Tests d'Orientation",
      description: "Découvrez votre profil professionnel avec nos tests psychométriques de pointe.",
      icon: Brain,
      features: ["RIASEC Professionnel", "Intelligence Émotionnelle", "Styles d'Apprentissage", "Aptitudes Entrepreneuriales"],
      link: "/tests",
      stats: "8 tests disponibles",
      color: "blue"
    },
    {
      title: "Job Board & Recrutement",
      description: "Accédez à des milliers d'offres d'emploi et postulez en un clic.",
      icon: Briefcase,
      features: ["500+ offres actives", "Matching IA avancé", "Pipeline de recrutement", "Communication automatisée"],
      link: "/recruitment",
      stats: "500+ offres",
      color: "green"
    },
    {
      title: "CV Optimizer & ATS",
      description: "Optimisez votre CV pour les systèmes de suivi des candidatures avec l'IA.",
      icon: Target,
      features: ["Analyse IA du CV", "Suggestions personnalisées", "Score ATS en temps réel", "Mots-clés optimisés"],
      link: "/cv-optimizer",
      stats: "Score moyen 85%",
      color: "purple"
    },
    {
      title: "Conseillers Professionnels",
      description: "Bénéficiez d'un accompagnement personnalisé avec nos experts certifiés.",
      icon: Users,
      features: ["50+ conseillers certifiés", "Rendez-vous en ligne", "Messagerie sécurisée", "Suivi personnalisé"],
      link: "/book-appointment",
      stats: "50+ experts",
      color: "orange"
    }
  ];

  // Témoignages
  const testimonials = [
    {
      name: "Jean-Baptiste M.",
      role: "Développeur Full Stack",
      company: "Startup Tech Brazzaville",
      quote: "Les tests RIASEC m'ont aidé à choisir ma spécialisation en Intelligence Artificielle. Aujourd'hui, je travaille dans une startup tech innovante !",
      avatar: "https://randomuser.me/api/portraits/men/70.jpg",
      rating: 5
    },
    {
      name: "Fatou K.",
      role: "Marketing Manager",
      company: "Orange Congo",
      quote: "Le CV Optimizer m'a permis d'obtenir 3 entretiens en une semaine ! J'ai décroché mon poste de rêve chez Orange Congo.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    },
    {
      name: "Dr. Mireille N.",
      role: "Conseillère en Orientation",
      company: "Indépendante",
      quote: "J'accompagne chaque personne avec passion vers son épanouissement professionnel. Voir mes clients réussir est ma plus grande satisfaction.",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
      rating: 5
    }
  ];

  // Statistiques
  const stats = [
    { icon: Users, value: 15000, label: "Utilisateurs Actifs", suffix: "+", color: "from-blue-500 to-cyan-500" },
    { icon: Target, value: 95, label: "Taux de Réussite", suffix: "%", color: "from-green-500 to-emerald-500" },
    { icon: TrendingUp, value: 500, label: "Offres d'Emploi", suffix: "+", color: "from-purple-500 to-pink-500" },
    { icon: Award, value: 150, label: "Entreprises Partenaires", suffix: "+", color: "from-orange-500 to-red-500" }
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <PremiumLoader className="text-white" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Arrière-plan animé */}
      <AnimatedBackground />
      
      {/* Barre de progression de scroll */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 z-40 origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10">
        {/* Hero Section Premium */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            {/* Badge animé */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                #1 Plateforme d'Orientation au Congo
              </Badge>
            </motion.div>

            {/* Titre principal avec effet typewriter */}
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <TypewriterText 
                text="Votre Avenir Commence Ici" 
                speed={100}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              />
            </motion.h1>

            {/* Sous-titre avec révélation */}
            <RevealText delay={0.6} className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Découvrez votre potentiel, trouvez votre voie et construisez une carrière épanouissante au Congo avec notre plateforme d'orientation professionnelle de nouvelle génération.
            </RevealText>

            {/* Boutons CTA avec effet magnétique */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <MagneticButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/tests" className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Commencer les tests
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </MagneticButton>
              
              <MagneticButton className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/recruitment" className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Voir les offres
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Statistiques animées */}
            <StaggeredGrid className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto" staggerDelay={0.1}>
              {stats.map((stat, index) => (
                <AnimatedStat
                  key={index}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  color={stat.color}
                  delay={index * 0.1}
                />
              ))}
            </StaggeredGrid>

            {/* Indicateur de scroll */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-8 h-8 text-gray-400" />
            </motion.div>
          </div>
        </section>

        {/* Section Modules avec animations avancées */}
        <section className="py-24 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <RevealText delay={0.2} className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <Zap className="w-4 h-4 mr-2" />
                Modules Clés
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Nos Solutions
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Innovantes
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Une suite complète d'outils conçus pour transformer votre parcours professionnel
              </p>
            </RevealText>

            <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
              {modules.map((module, index) => (
                <InteractiveModule
                  key={index}
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  features={module.features}
                  link={module.link}
                  stats={module.stats}
                  color={module.color}
                  delay={index * 0.1}
                />
              ))}
            </StaggeredGrid>
          </div>
        </section>

        {/* Section Vidéo avec parallaxe */}
        <ParallaxSection offset={100} className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Découvrez notre histoire
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Transformons ensemble
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    l'avenir professionnel
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Découvrez comment OrientationPro révolutionne l'orientation professionnelle au Congo avec des technologies de pointe et une approche humaine.
                </p>
                <MagneticButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Button onClick={() => setShowVideoModal(true)} className="bg-transparent border-0 p-0 h-auto">
                    <Play className="w-5 h-5 mr-2" />
                    Voir la vidéo
                  </Button>
                </MagneticButton>
              </motion.div>

              <FloatingCard delay={0.2}>
                <div className="relative">
                  <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
                    <motion.div
                      className="text-center text-white"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="w-12 h-12 text-white ml-2" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">OrientationPro en action</h3>
                      <p className="text-lg opacity-90 mb-4">Découvrez notre plateforme</p>
                      <motion.div
                        className="flex items-center justify-center space-x-4 text-sm opacity-75"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.75 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2" />
                          <span>Tests d'orientation</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2" />
                          <span>Job matching IA</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2" />
                          <span>Conseillers experts</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                </div>
              </FloatingCard>
            </div>
          </div>
        </ParallaxSection>

        {/* Section Témoignages avec animations */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-6">
            <RevealText delay={0.2} className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <Heart className="w-4 h-4 mr-2" />
                Ils nous font confiance
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Des témoignages
                <br />
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  authentiques
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez comment OrientationPro a transformé la vie professionnelle de milliers de Congolais
              </p>
            </RevealText>

            <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.2}>
              {testimonials.map((testimonial, index) => (
                <AnimatedTestimonial
                  key={index}
                  name={testimonial.name}
                  role={testimonial.role}
                  company={testimonial.company}
                  quote={testimonial.quote}
                  avatar={testimonial.avatar}
                  rating={testimonial.rating}
                  delay={index * 0.1}
                />
              ))}
            </StaggeredGrid>
          </div>
        </section>

        {/* Section CTA finale avec effets visuels */}
        <section className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          {/* Effets de particules */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Prêt à transformer votre avenir ?
              </Badge>
              
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                Rejoignez la révolution
                <br />
                de l'orientation professionnelle
              </h2>
              
              <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
                Plus de 15 000 personnes nous font déjà confiance. 
                Rejoignez-nous et découvrez votre potentiel illimité.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <MagneticButton className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/tests" className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </MagneticButton>
                
                <MagneticButton className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link to="/contact" className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Nous contacter
                  </Link>
                </MagneticButton>
              </div>

              {/* Statistiques finales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-3xl font-bold mb-2">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>


      {/* Modal d'information */}
      <PremiumModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="OrientationPro - Notre Mission"
      >
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-16 h-16 text-white ml-2" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Découvrez OrientationPro</h3>
          <p className="text-gray-600 mb-6">
            Notre plateforme révolutionne l'orientation professionnelle au Congo avec des technologies de pointe et une approche humaine.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Tests IA</h4>
              <p className="text-sm text-blue-700">Analyse psychométrique avancée</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Job Matching</h4>
              <p className="text-sm text-green-700">Matching intelligent candidat-poste</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Conseillers</h4>
              <p className="text-sm text-purple-700">Accompagnement personnalisé</p>
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Link to="/tests">Commencer maintenant</Link>
          </Button>
        </div>
      </PremiumModal>
    </div>
  );
}
