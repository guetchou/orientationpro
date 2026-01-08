import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  X,
  GraduationCap,
  Lightbulb,
  UserCheck,
  BarChart3,
  Clock,
  ShieldCheck,
  Users2,
  BookOpenCheck,
  HandHeart
} from 'lucide-react';

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

export default function Home() {
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Données inspirées de Mental'O et des meilleurs ATS
  const services = [
    {
      title: "Bilans d'Orientation Personnalisés",
      description: "Des bilans d'orientation menés par des conseillers spécialisés pour révéler vos potentiels et singularités.",
      icon: Brain,
      features: ["Conseillers certifiés", "Tests personnalisés", "Accompagnement individuel", "Suivi personnalisé"],
      link: "/tests",
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      image: "/images/carousel/orientation-3.png"
    },
    {
      title: "Tests d'Orientation Scientifiques",
      description: "Nos propres tests conçus récemment en français, adaptés à notre culture et au langage de notre époque.",
      icon: BookOpenCheck,
      features: ["Tests RIASEC", "Intelligence émotionnelle", "Aptitudes professionnelles", "Styles d'apprentissage"],
      link: "/tests",
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      image: "/images/carousel/orientation-4.png"
    },
    {
      title: "Réseau de Conseillers Experts",
      description: "Premier réseau d'orientation scolaire et professionnelle avec des conseillers partout en France et à l'international.",
      icon: Users2,
      features: ["50+ conseillers certifiés", "Accompagnement en visio", "Présentiel disponible", "Expertise reconnue"],
      link: "/book-appointment",
      color: "from-purple-600 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      image: "/images/heureux-portrait-femme-affaires.jpg"
    },
    {
      title: "Job Board & ATS Intelligent",
      description: "Plateforme de recrutement moderne avec matching IA et gestion automatisée des candidatures.",
      icon: Briefcase,
      features: ["500+ offres actives", "Matching IA avancé", "Pipeline de recrutement", "Communication automatisée"],
      link: "/recruitment",
      color: "from-orange-600 to-red-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      image: "/images/staff-ai-genere-entreprise.jpg"
    }
  ];

  const testimonials = [
    {
      name: "Chloé M.",
      role: "Élève de Terminale",
      location: "Brazzaville",
      quote: "Je suis admise à l'Université Marien Ngouabi, certainement en grande partie grâce à vous ! Tous mes remerciements.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      background: "/images/carousel/orientation-5.png"
    },
    {
      name: "Clément L.",
      role: "Élève de 1ère",
      location: "Pointe-Noire",
      quote: "Ma présentation s'est très bien passée, j'ai fait les modifications dont on avait parlé, cela a beaucoup plu. Merci beaucoup pour votre aide !",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      background: "/images/carousel/orientation-6.png"
    },
    {
      name: "Céline D.",
      role: "Reconversion réussie",
      location: "Dolisie",
      quote: "Grâce au bilan que j'ai effectué avec vous, j'ai pu identifier différents secteurs professionnels liés à mon profil. Mission accomplie !",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      background: "/images/heureux-portrait-femme-affaires.jpg"
    }
  ];

  const stats = [
    { icon: Users, value: 15000, label: "Personnes accompagnées", suffix: "+" },
    { icon: Award, value: 95, label: "Taux de satisfaction", suffix: "%" },
    { icon: Briefcase, value: 500, label: "Offres d'emploi", suffix: "+" },
    { icon: MapPin, value: 150, label: "Connexions partenaires", suffix: "+" }
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OrientationPro Congo</h2>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      {/* Barre de progression */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 z-40 origin-left"
        style={{ scaleX }}
      />

      <main className="relative pt-16 lg:pt-20">
        {/* Hero Section - Style Mental'O */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
          {/* Image de fond avec overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/carousel/orientation-1.png"
              alt="Orientation professionnelle"
              className="w-full h-full object-cover opacity-15"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/85 via-white/95 to-purple-50/85" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Contenu texte */}
              <div className="text-left lg:text-center lg:col-span-1">
                {/* Badge de confiance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Méthode reconnue et récompensée
                  </Badge>
                </motion.div>

                {/* Titre principal */}
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Conseil en{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Orientation
                  </span>
                  <br />
                  Scolaire et Professionnelle
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                  className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Des bilans d'orientation personnalisés pour transformer votre avenir. 
                  Révélez vos potentiels et trouvez votre voie avec nos conseillers spécialisés.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                    <Link to="/tests" className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Commencer mon bilan
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg">
                    <Link to="/book-appointment" className="flex items-center">
                      <Users2 className="w-5 h-5 mr-2" />
                      Trouver un conseiller
                    </Link>
                  </Button>
                </motion.div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    >
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        <OptimizedCounter end={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Image Hero */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative"
                >
                  <img
                    src="/images/carousel/orientation-2.png"
                    alt="Étudiants en orientation"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                  {/* Overlay avec statistiques */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-xs text-gray-600">Satisfaction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">15k+</div>
                        <div className="text-xs text-gray-600">Personnes accompagnées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">50+</div>
                        <div className="text-xs text-gray-600">Conseillers experts</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Services - Style Mental'O */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Nos Services
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Une méthode unique alliant le meilleur de l'<span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Humain</span> et de la <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Technologie</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Nos bilans d'orientation sont réalisés à partir d'entretiens individuels et de tests inédits, 
                  conçus récemment en français et adaptés à notre culture.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Image en haut de la carte */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className={`absolute top-4 left-4 w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <service.icon className={`w-6 h-6 ${service.iconColor}`} />
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                        {service.title}
                      </CardTitle>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-gray-700">
                            <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white border-0`}>
                        <Link to={service.link} className="flex items-center justify-center">
                          Découvrir
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Carousel d'Images */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                  <Eye className="w-4 h-4 mr-2" />
                  Notre Impact
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Des Résultats Concrets
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Découvrez comment nous transformons les parcours professionnels au Congo
                </p>
              </motion.div>
            </div>

            {/* Carousel d'images */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { src: "/images/blog/orientation-scolaire.png", title: "Orientation Scolaire", description: "Accompagnement personnalisé" },
                { src: "/images/blog/emploi-congo-2025.png", title: "Emploi Congo 2025", description: "Marché du travail dynamique" },
                { src: "/images/blog/baccalaureat-2025-thumb.png", title: "Baccalauréat 2025", description: "Préparation aux examens" },
                { src: "/images/carousel/orientation-3.png", title: "Tests d'Orientation", description: "Évaluation scientifique" },
                { src: "/images/carousel/orientation-4.png", title: "Conseillers Experts", description: "Accompagnement professionnel" },
                { src: "/images/carousel/orientation-5.png", title: "Succès Garantis", description: "Résultats mesurables" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        <p className="text-sm opacity-90">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
                  <Quote className="w-4 h-4 mr-2" />
                  Témoignages
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Ils ont essayé (la méthode) <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">OrientationPro</span>... et l'ont adorée
                </h2>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Image de fond */}
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={testimonial.background}
                        alt="Background"
                        className="w-full h-full object-cover object-center"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4 -mt-8 relative z-10">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full mr-4 border-4 border-white shadow-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                          <p className="text-sm text-gray-500">{testimonial.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-700 italic leading-relaxed text-sm">
                        "{testimonial.quote}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Nos Réalisations */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                  <Award className="w-4 h-4 mr-2" />
                  Nos Réalisations
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Des Chiffres qui Parlent
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Des statistiques qui témoignent de notre impact et de notre engagement 
                  envers la réussite de chaque personne accompagnée.
                </p>
              </motion.div>
            </div>

            {/* Grille des réalisations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Users,
                  value: "15,000+",
                  label: "Personnes accompagnées",
                  description: "Depuis notre création",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: Award,
                  value: "95%",
                  label: "Taux de satisfaction",
                  description: "Clients satisfaits",
                  color: "from-emerald-500 to-emerald-600"
                },
                {
                  icon: Briefcase,
                  value: "500+",
                  label: "Offres d'emploi",
                  description: "Actuellement actives",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  icon: Globe,
                  value: "150+",
                  label: "Partenaires",
                  description: "Entreprises partenaires",
                  color: "from-orange-500 to-orange-600"
                }
              ].map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 text-center p-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <achievement.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {achievement.value}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {achievement.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section supplémentaire avec témoignages de réussite */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Notre Impact au Congo
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Nous transformons des vies à travers tout le Congo, de Brazzaville à Pointe-Noire, 
                  en passant par Dolisie et toutes les régions.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Étudiants Orientés</h4>
                  <p className="text-gray-600 text-sm">
                    Plus de 8,000 étudiants ont trouvé leur voie grâce à nos conseils personnalisés.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Emplois Trouvés</h4>
                  <p className="text-gray-600 text-sm">
                    Plus de 3,000 personnes ont décroché leur emploi idéal via notre plateforme.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Reconversions Réussies</h4>
                  <p className="text-gray-600 text-sm">
                    Plus de 1,500 professionnels ont réussi leur reconversion professionnelle.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section CTA Principal - Message Clé */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              
              {/* Titre Principal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-6 py-3 text-sm font-medium">
                  <Award className="w-4 h-4 mr-2" />
                  La Référence au Congo
                </Badge>
                
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  La <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Première Plateforme</span>
                  <br />
                  d'Orientation
                </h2>
                <h3 className="text-2xl md:text-3xl lg:text-4xl text-blue-200 font-semibold mb-8">
                  Scolaire et Professionnelle du Congo
                </h3>
              </motion.div>

              {/* Message Clé */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
                  Nous connectons talents et opportunités avec l'<span className="text-blue-400 font-semibold">intelligence artificielle</span>. 
                  Transformez votre avenir avec nos conseils personnalisés et notre réseau d'experts.
                </p>
              </motion.div>

              {/* Badges de Conformité */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-wrap justify-center gap-6 mb-12"
              >
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-8 py-4 text-base font-medium shadow-lg">
                  <Shield className="w-5 h-5 mr-2" />
                  RGPD
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-8 py-4 text-base font-medium shadow-lg">
                  <Award className="w-5 h-5 mr-2" />
                  ISO 27001
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-8 py-4 text-base font-medium shadow-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  WCAG 2.1
                </Badge>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
              >
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <Link to="/tests" className="flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    Commencer Mon Bilan
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-5 text-xl font-semibold backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                  <Link to="/contact" className="flex items-center">
                    <Users className="w-6 h-6 mr-3" />
                    Nous Contacter
                  </Link>
                </Button>
              </motion.div>

              {/* Texte de Confiance */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto"
              >
                <p className="text-lg text-gray-300 mb-4">
                  Rejoignez plus de <span className="text-blue-400 font-bold text-xl">15,000 personnes</span> qui nous font confiance 
                  pour leur orientation et leur carrière au Congo.
                </p>
                <div className="flex justify-center items-center space-x-8 text-gray-400">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-2" />
                    <span>95% de satisfaction</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-blue-400 mr-2" />
                    <span>150+ partenaires</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-purple-400 mr-2" />
                    <span>500+ offres actives</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section CTA finale */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 text-white">
          <div className="container mx-auto px-6 text-center">
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
              
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                Transformez Votre Avenir
              </h2>
              
              <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
                Plus de 15 000 personnes nous font déjà confiance. 
                Rejoignez-nous et découvrez votre potentiel illimité.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  <Link to="/tests" className="flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    Commencer maintenant
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  <Link to="/contact" className="flex items-center">
                    <MessageSquare className="w-6 h-6 mr-3" />
                    Nous contacter
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
