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
  Morphing3DCard,
  LiquidText,
  InteractiveParticles,
  HexagonalGrid,
  CustomCursor,
  VortexLoader,
  GlitchText
} from '@/components/home/AdvancedAnimations';
import {
  NeonCard,
  HolographicButton,
  PulsingStat,
  TeleportModal,
  FluidCascadeGrid,
  MatrixText,
  AdvancedGlassCard
} from '@/components/home/UltraUI';
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
  Unlock,
  Maximize,
  Minimize,
  RotateCw,
  Settings,
  Download,
  Share2,
  ExternalLink,
  Filter,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';

export default function UltraHomepage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showInnovationModal, setShowInnovationModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  // Effet de chargement initial avec vortex
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Données pour les modules avec effets 3D
  const modules = [
    {
      title: "Tests d'Orientation",
      description: "Découvrez votre profil professionnel avec nos tests psychométriques de pointe.",
      icon: Brain,
      features: ["RIASEC Professionnel", "Intelligence Émotionnelle", "Styles d'Apprentissage", "Aptitudes Entrepreneuriales"],
      link: "/tests",
      stats: "8 tests disponibles",
      color: "blue",
      morphTargets: [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      ]
    },
    {
      title: "Job Board & Recrutement",
      description: "Accédez à des milliers d'offres d'emploi et postulez en un clic.",
      icon: Briefcase,
      features: ["500+ offres actives", "Matching IA avancé", "Pipeline de recrutement", "Communication automatisée"],
      link: "/recruitment",
      stats: "500+ offres",
      color: "green",
      morphTargets: [
        "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)",
        "linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)",
      ]
    },
    {
      title: "CV Optimizer & ATS",
      description: "Optimisez votre CV pour les systèmes de suivi des candidatures avec l'IA.",
      icon: Target,
      features: ["Analyse IA du CV", "Suggestions personnalisées", "Score ATS en temps réel", "Mots-clés optimisés"],
      link: "/cv-optimizer",
      stats: "Score moyen 85%",
      color: "purple",
      morphTargets: [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
      ]
    },
    {
      title: "Conseillers Professionnels",
      description: "Bénéficiez d'un accompagnement personnalisé avec nos experts certifiés.",
      icon: Users,
      features: ["50+ conseillers certifiés", "Rendez-vous en ligne", "Messagerie sécurisée", "Suivi personnalisé"],
      link: "/book-appointment",
      stats: "50+ experts",
      color: "orange",
      morphTargets: [
        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      ]
    }
  ];

  // Témoignages avec effets avancés
  const testimonials = [
    {
      name: "Jean-Baptiste M.",
      role: "Développeur Full Stack",
      company: "Startup Tech Brazzaville",
      quote: "Les tests RIASEC m'ont aidé à choisir ma spécialisation en Intelligence Artificielle. Aujourd'hui, je travaille dans une startup tech innovante !",
      avatar: "https://randomuser.me/api/portraits/men/70.jpg",
      rating: 5,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Fatou K.",
      role: "Marketing Manager",
      company: "Orange Congo",
      quote: "Le CV Optimizer m'a permis d'obtenir 3 entretiens en une semaine ! J'ai décroché mon poste de rêve chez Orange Congo.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Dr. Mireille N.",
      role: "Conseillère en Orientation",
      company: "Indépendante",
      quote: "J'accompagne chaque personne avec passion vers son épanouissement professionnel. Voir mes clients réussir est ma plus grande satisfaction.",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
      rating: 5,
      color: "from-purple-500 to-pink-500"
    }
  ];

  // Statistiques avec effets de pulsation
  const stats = [
    { icon: Users, value: 15000, label: "Utilisateurs Actifs", suffix: "+", color: "from-blue-500 to-cyan-500" },
    { icon: Target, value: 95, label: "Taux de Réussite", suffix: "%", color: "from-green-500 to-emerald-500" },
    { icon: TrendingUp, value: 500, label: "Offres d'Emploi", suffix: "+", color: "from-purple-500 to-pink-500" },
    { icon: Award, value: 150, label: "Entreprises Partenaires", suffix: "+", color: "from-orange-500 to-red-500" }
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <VortexLoader className="text-white mb-8" />
          <MatrixText 
            text="OrientationPro Congo" 
            className="text-3xl font-bold text-white mb-4"
            speed={150}
          />
          <p className="text-blue-200">Initialisation des systèmes...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Curseur personnalisé */}
      <CustomCursor />
      
      {/* Arrière-plan avec particules interactives */}
      <AnimatedBackground />
      <InteractiveParticles count={150} className="opacity-30" />
      
      {/* Barre de progression de scroll avec effet néon */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 z-40 origin-left shadow-lg shadow-cyan-500/50"
        style={{ scaleX }}
      />

      <main className="relative z-10">
        {/* Hero Section Ultra-Innovante */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            {/* Badge avec effet de glitch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlitchText
                text="#1 Plateforme d'Orientation au Congo"
                className="text-lg font-bold mb-8"
                glitchIntensity={0.05}
              >
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-6 py-2 text-sm shadow-lg shadow-cyan-500/50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  #1 Plateforme d'Orientation au Congo
                </Badge>
              </GlitchText>
            </motion.div>

            {/* Titre principal avec effet liquide */}
            <motion.h1
              className="text-6xl md:text-8xl font-extrabold text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <LiquidText 
                text="Votre Avenir Commence Ici" 
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                delay={0.6}
              />
            </motion.h1>

            {/* Sous-titre avec effet matrix */}
            <RevealText delay={1.2} className="text-xl md:text-2xl text-blue-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              <MatrixText 
                text="Découvrez votre potentiel, trouvez votre voie et construisez une carrière épanouissante au Congo avec notre plateforme d'orientation professionnelle de nouvelle génération."
                speed={30}
                className="text-blue-200"
              />
            </RevealText>

            {/* Boutons CTA avec effet holographique */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <HolographicButton
                onClick={() => {}}
                variant="primary"
                className="text-lg px-10 py-5"
              >
                <Link to="/tests" className="flex items-center">
                  <Brain className="w-6 h-6 mr-3" />
                  Commencer les tests
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </HolographicButton>
              
              <HolographicButton
                onClick={() => {}}
                variant="secondary"
                className="text-lg px-10 py-5"
              >
                <Link to="/recruitment" className="flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Voir les offres
                </Link>
              </HolographicButton>
            </motion.div>

            {/* Statistiques avec effets de pulsation */}
            <FluidCascadeGrid className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto" staggerDelay={0.15}>
              {stats.map((stat, index) => (
                <PulsingStat
                  key={index}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  color={`bg-gradient-to-br ${stat.color}`}
                  delay={index * 0.1}
                  isAnimated={true}
                />
              ))}
            </FluidCascadeGrid>

            {/* Indicateur de scroll avec effet de néon */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <ChevronDown className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Modules avec effets 3D morphing */}
        <section className="py-24 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <RevealText delay={0.2} className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/50">
                <Zap className="w-4 h-4 mr-2" />
                Modules Clés
              </Badge>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
                <LiquidText 
                  text="Nos Solutions Innovantes"
                  className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent"
                  delay={0.4}
                />
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Une suite complète d'outils conçus pour transformer votre parcours professionnel
              </p>
            </RevealText>

            <HexagonalGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((module, index) => (
                <Morphing3DCard
                  key={index}
                  morphTargets={module.morphTargets}
                  className="h-full"
                >
                  <AdvancedGlassCard className="h-full p-8">
                    <div className="text-center">
                      {/* Icône avec effet de néon */}
                      <motion.div
                        className={`w-20 h-20 bg-gradient-to-br ${module.color.includes('blue') ? 'from-blue-500 to-cyan-500' : 
                          module.color.includes('green') ? 'from-green-500 to-emerald-500' :
                          module.color.includes('purple') ? 'from-purple-500 to-pink-500' :
                          'from-orange-500 to-red-500'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                        animate={{
                          boxShadow: [
                            `0 0 20px ${module.color.includes('blue') ? 'rgba(59, 130, 246, 0.5)' : 
                              module.color.includes('green') ? 'rgba(34, 197, 94, 0.5)' :
                              module.color.includes('purple') ? 'rgba(168, 85, 247, 0.5)' :
                              'rgba(249, 115, 22, 0.5)'}`,
                            `0 0 40px ${module.color.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : 
                              module.color.includes('green') ? 'rgba(34, 197, 94, 0.3)' :
                              module.color.includes('purple') ? 'rgba(168, 85, 247, 0.3)' :
                              'rgba(249, 115, 22, 0.3)'}`,
                            `0 0 20px ${module.color.includes('blue') ? 'rgba(59, 130, 246, 0.5)' : 
                              module.color.includes('green') ? 'rgba(34, 197, 94, 0.5)' :
                              module.color.includes('purple') ? 'rgba(168, 85, 247, 0.5)' :
                              'rgba(249, 115, 22, 0.5)'}`,
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <module.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">
                        <LiquidText text={module.title} delay={0.2} />
                      </h3>
                      
                      <p className="text-blue-200 mb-6 leading-relaxed">
                        {module.description}
                      </p>
                      
                      {/* Fonctionnalités avec effet de révélation */}
                      <div className="space-y-3 mb-6">
                        {module.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center text-blue-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Badge avec effet de pulsation */}
                      <motion.div
                        className="mb-6"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                          {module.stats}
                        </Badge>
                      </motion.div>
                      
                      {/* Bouton CTA avec effet holographique */}
                      <HolographicButton
                        onClick={() => {}}
                        variant="primary"
                        className="w-full"
                      >
                        <Link to={module.link} className="flex items-center justify-center">
                          Découvrir
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </HolographicButton>
                    </div>
                  </AdvancedGlassCard>
                </Morphing3DCard>
              ))}
            </HexagonalGrid>
          </div>
        </section>

        {/* Section Innovation avec effet de téléportation */}
        <ParallaxSection offset={100} className="py-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50">
                  <Play className="w-4 h-4 mr-2" />
                  Innovation Technologique
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  <LiquidText 
                    text="Révolution Technologique"
                    className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    delay={0.2}
                  />
                </h2>
                <p className="text-xl text-blue-200 mb-8 leading-relaxed">
                  Découvrez comment OrientationPro révolutionne l'orientation professionnelle au Congo avec des technologies de pointe et une approche humaine.
                </p>
                <HolographicButton
                  onClick={() => setShowInnovationModal(true)}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Découvrir l'innovation
                </HolographicButton>
              </motion.div>

              <NeonCard glowColor="purple" intensity={2}>
                <AdvancedGlassCard className="h-80 p-8 flex items-center justify-center">
                  <div className="text-center text-white">
                    <motion.div
                      className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      }}
                    >
                      <Brain className="w-16 h-16 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">IA Avancée</h3>
                    <p className="text-blue-200 mb-6">Algorithmes de pointe pour une analyse précise</p>
                    <div className="flex justify-center space-x-4">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                </AdvancedGlassCard>
              </NeonCard>
            </div>
          </div>
        </ParallaxSection>

        {/* Section CTA finale avec effets visuels avancés */}
        <section className="relative py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 text-white overflow-hidden">
          {/* Effets de particules avancées */}
          <InteractiveParticles count={200} className="opacity-40" />
          
          {/* Effets de néon en arrière-plan */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
              animate={{
                scale: [1.5, 1, 1.5],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Rejoignez la révolution
              </Badge>
              
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6">
                <GlitchText 
                  text="Transformez Votre Avenir"
                  className="text-white"
                  glitchIntensity={0.02}
                />
              </h2>
              
              <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
                Plus de 15 000 personnes nous font déjà confiance. 
                Rejoignez-nous et découvrez votre potentiel illimité.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <HolographicButton
                  onClick={() => {}}
                  variant="primary"
                  className="text-lg px-10 py-5"
                >
                  <Link to="/tests" className="flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    Commencer maintenant
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </HolographicButton>
                
                <HolographicButton
                  onClick={() => {}}
                  variant="secondary"
                  className="text-lg px-10 py-5"
                >
                  <Link to="/contact" className="flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Nous contacter
                  </Link>
                </HolographicButton>
              </div>

              {/* Statistiques finales avec effets de pulsation */}
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
                    <div className="text-4xl font-bold mb-2">
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

      {/* Modal d'innovation avec effet de téléportation */}
      <TeleportModal
        isOpen={showInnovationModal}
        onClose={() => setShowInnovationModal(false)}
        title="Innovation Technologique"
      >
        <div className="text-center">
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Technologies de Pointe</h3>
          <p className="text-gray-600 mb-6">
            Notre plateforme utilise les dernières avancées en intelligence artificielle, 
            analyse de données et psychométrie pour vous offrir une expérience d'orientation unique.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-cyan-50 rounded-lg">
              <Brain className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
              <h4 className="font-semibold text-cyan-900">IA Avancée</h4>
              <p className="text-sm text-cyan-700">Algorithmes de machine learning</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Matching IA</h4>
              <p className="text-sm text-purple-700">Correspondance intelligente</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Experts</h4>
              <p className="text-sm text-green-700">Conseillers certifiés</p>
            </div>
          </div>
          
          <HolographicButton
            onClick={() => setShowInnovationModal(false)}
            variant="primary"
            className="w-full"
          >
            Découvrir maintenant
          </HolographicButton>
        </div>
      </TeleportModal>
    </div>
  );
}
