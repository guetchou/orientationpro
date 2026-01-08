import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Lazy loading des composants simples
const SimpleBackground = lazy(() => import('@/components/home/SimpleBackground').then(module => ({ default: module.SimpleBackground })));
const SimpleParticles = lazy(() => import('@/components/home/SimpleBackground').then(module => ({ default: module.SimpleParticles })));

// Composant de chargement simple
const SimpleLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold text-white mb-2">OrientationPro Congo</h2>
      <p className="text-blue-200">Chargement...</p>
    </div>
  </div>
);

// Composant de compteur optimisé
const OptimizedCounter: React.FC<{
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}> = ({ end, duration = 2, suffix = '', prefix = '', className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        
        // Easing function pour un effet plus naturel
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(end * easeOutQuart));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className={className}>
      <span>{prefix}{count}{suffix}</span>
    </div>
  );
};

// Composant de carte simplifié
const SimpleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative z-10 p-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

// Composant de bouton optimisé
const OptimizedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700',
  };

  return (
    <motion.button
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white shadow-lg ${variants[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};

export default function OptimizedHome() {
  const [isLoaded, setIsLoaded] = useState(false);
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

  // Chargement initial optimisé
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Données simplifiées pour les modules
  const modules = [
    {
      title: "Tests d'Orientation",
      description: "Découvrez votre profil professionnel avec nos tests psychométriques.",
      icon: Brain,
      features: ["RIASEC Professionnel", "Intelligence Émotionnelle", "Styles d'Apprentissage"],
      link: "/tests",
      stats: "8 tests disponibles",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Job Board & Recrutement",
      description: "Accédez à des milliers d'offres d'emploi et postulez en un clic.",
      icon: Briefcase,
      features: ["500+ offres actives", "Matching IA avancé", "Pipeline de recrutement"],
      link: "/recruitment",
      stats: "500+ offres",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "CV Optimizer & ATS",
      description: "Optimisez votre CV pour les systèmes de suivi des candidatures.",
      icon: Target,
      features: ["Analyse IA du CV", "Suggestions personnalisées", "Score ATS en temps réel"],
      link: "/cv-optimizer",
      stats: "Score moyen 85%",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Conseillers Professionnels",
      description: "Bénéficiez d'un accompagnement personnalisé avec nos experts.",
      icon: Users,
      features: ["50+ conseillers certifiés", "Rendez-vous en ligne", "Messagerie sécurisée"],
      link: "/book-appointment",
      stats: "50+ experts",
      color: "from-orange-500 to-red-500"
    }
  ];

  // Statistiques simplifiées
  const stats = [
    { icon: Users, value: 15000, label: "Utilisateurs Actifs", suffix: "+" },
    { icon: Target, value: 95, label: "Taux de Réussite", suffix: "%" },
    { icon: TrendingUp, value: 500, label: "Offres d'Emploi", suffix: "+" },
    { icon: Award, value: 150, label: "Entreprises Partenaires", suffix: "+" }
  ];

  if (!isLoaded) {
    return <SimpleLoader />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Barre de progression de scroll simplifiée */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 z-40 origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10">
        {/* Hero Section Optimisée */}
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-6 text-center relative z-10">
            {/* Badge simplifié */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 px-6 py-2 text-sm shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                #1 Plateforme d'Orientation au Congo
              </Badge>
            </motion.div>

            {/* Titre principal simplifié */}
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Votre Avenir Commence Ici
              </span>
            </motion.h1>

            {/* Sous-titre simplifié */}
            <motion.p
              className="text-xl md:text-2xl text-blue-200 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Découvrez votre potentiel, trouvez votre voie et construisez une carrière épanouissante au Congo avec notre plateforme d'orientation professionnelle de nouvelle génération.
            </motion.p>

            {/* Boutons CTA optimisés */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <OptimizedButton
                onClick={() => {}}
                variant="primary"
                className="text-lg px-8 py-4"
              >
                <Link to="/tests" className="flex items-center">
                  <Brain className="w-6 h-6 mr-3" />
                  Commencer les tests
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </OptimizedButton>
              
              <OptimizedButton
                onClick={() => {}}
                variant="secondary"
                className="text-lg px-8 py-4"
              >
                <Link to="/recruitment" className="flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Voir les offres
                </Link>
              </OptimizedButton>
            </motion.div>

            {/* Statistiques optimisées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="text-4xl font-bold text-white mb-2">
                    <OptimizedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Indicateur de scroll simplifié */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <ChevronDown className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Modules Optimisée */}
        <section className="py-24 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                Modules Clés
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  Nos Solutions Innovantes
                </span>
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Une suite complète d'outils conçus pour transformer votre parcours professionnel
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((module, index) => (
                <SimpleCard key={index} delay={index * 0.1}>
                  <div className="text-center h-full flex flex-col">
                    {/* Icône simplifiée */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <module.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-3">
                      {module.title}
                    </h3>
                    
                    <p className="text-blue-200 mb-4 leading-relaxed flex-grow">
                      {module.description}
                    </p>
                    
                    {/* Fonctionnalités simplifiées */}
                    <div className="space-y-2 mb-4">
                      {module.features.slice(0, 3).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-blue-200 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Badge simplifié */}
                    <div className="mb-4">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 text-xs">
                        {module.stats}
                      </Badge>
                    </div>
                    
                    {/* Bouton CTA simplifié */}
                    <OptimizedButton
                      onClick={() => {}}
                      variant="primary"
                      className="w-full text-sm py-2"
                    >
                      <Link to={module.link} className="flex items-center justify-center">
                        Découvrir
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </OptimizedButton>
                  </div>
                </SimpleCard>
              ))}
            </div>
          </div>
        </section>

        {/* Section CTA finale optimisée */}
        <section className="relative py-24 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600 text-white overflow-hidden">
          {/* Arrière-plan simple avec lazy loading */}
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-600" />}>
            <SimpleBackground />
          </Suspense>
          
          {/* Particules simples avec lazy loading */}
          <Suspense fallback={<div />}>
            <SimpleParticles count={15} className="opacity-20" />
          </Suspense>

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
              
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
                Transformez Votre Avenir
              </h2>
              
              <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
                Plus de 15 000 personnes nous font déjà confiance. 
                Rejoignez-nous et découvrez votre potentiel illimité.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                <OptimizedButton
                  onClick={() => {}}
                  variant="primary"
                  className="text-lg px-8 py-4"
                >
                  <Link to="/tests" className="flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    Commencer maintenant
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </OptimizedButton>
                
                <OptimizedButton
                  onClick={() => {}}
                  variant="secondary"
                  className="text-lg px-8 py-4"
                >
                  <Link to="/contact" className="flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Nous contacter
                  </Link>
                </OptimizedButton>
              </div>

              {/* Statistiques finales simplifiées */}
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
                      <OptimizedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
