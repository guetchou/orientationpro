import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Heart,
  ArrowRight,
  Star,
  Award,
  Target,
  Brain,
  Briefcase,
  MessageSquare,
  Calendar,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Play,
  Download,
  Share2,
  HelpCircle,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Footer conforme aux normes ISO 9241
 * - ISO 9241-11: Utilisabilité (clarté et efficacité)
 * - ISO 9241-12: Organisation et présentation de l'information
 * - ISO 9241-13: Guidage de l'utilisateur
 * - WCAG 2.1 AA: Accessibilité
 */
export const ISOCompliantFooter = () => {
  const currentYear = new Date().getFullYear();

  // Organisation logique selon ISO 9241-12
  const footerSections = [
    {
      title: 'Orientation Professionnelle',
      description: 'Tests et conseils personnalisés',
      links: [
        { name: 'Tests RIASEC', path: '/tests', description: 'Découvrez votre profil professionnel' },
        { name: 'Intelligence Émotionnelle', path: '/tests/emotional', description: 'Évaluez vos compétences relationnelles' },
        { name: 'Styles d\'Apprentissage', path: '/tests/learning', description: 'Identifiez votre méthode d\'apprentissage' },
        { name: 'Aptitudes Entrepreneuriales', path: '/tests/entrepreneurial', description: 'Testez votre potentiel entrepreneurial' },
        { name: 'Guide Congo 2024', path: '/guide-congo-2024', description: 'Guide complet des études au Congo' }
      ]
    },
    {
      title: 'Recrutement & Emploi',
      description: 'Opportunités et outils de recherche',
      links: [
        { name: 'Job Board', path: '/recruitment', description: 'Consultez les offres d\'emploi' },
        { name: 'CV Optimizer', path: '/cv-optimizer', description: 'Optimisez votre CV avec l\'IA' },
        { name: 'Matching IA', path: '/recruitment#matching', description: 'Trouvez l\'emploi qui vous correspond' },
        { name: 'Pipeline Recrutement', path: '/recruitment#pipeline', description: 'Suivez vos candidatures' },
        { name: 'Entreprises Partenaires', path: '/recruitment#companies', description: 'Découvrez nos partenaires' }
      ]
    },
    {
      title: 'Conseil & Accompagnement',
      description: 'Support personnalisé et professionnel',
      links: [
        { name: 'Conseillers Pro', path: '/book-appointment', description: 'Prenez rendez-vous avec un expert' },
        { name: 'Rendez-vous', path: '/book-appointment', description: 'Planifiez votre consultation' },
        { name: 'Messagerie', path: '/book-appointment#messaging', description: 'Échangez avec votre conseiller' },
        { name: 'Suivi Personnalisé', path: '/book-appointment#follow-up', description: 'Accompagnement continu' },
        { name: 'Plans de Carrière', path: '/book-appointment#career-plans', description: 'Stratégies de développement' }
      ]
    },
    {
      title: 'Support & Information',
      description: 'Aide et ressources utiles',
      links: [
        { name: 'Centre d\'Aide', path: '/help', description: 'FAQ et guides d\'utilisation' },
        { name: 'Contact', path: '/contact', description: 'Nous contacter directement' },
        { name: 'Blog', path: '/blog', description: 'Actualités et conseils' },
        { name: 'Actualités', path: '/actualites', description: 'Nouvelles de la plateforme' },
        { name: 'Politique de Confidentialité', path: '/privacy', description: 'Protection de vos données' }
      ]
    }
  ];

  // Statistiques avec contexte selon ISO 9241-12
  const keyMetrics = [
    { 
      icon: Users, 
      value: '15,000+', 
      label: 'Utilisateurs actifs', 
      description: 'Membres inscrits sur la plateforme',
      color: 'text-blue-600' 
    },
    { 
      icon: Target, 
      value: '95%', 
      label: 'Taux de satisfaction', 
      description: 'Utilisateurs satisfaits de nos services',
      color: 'text-green-600' 
    },
    { 
      icon: TrendingUp, 
      value: '500+', 
      label: 'Offres d\'emploi', 
      description: 'Opportunités disponibles actuellement',
      color: 'text-purple-600' 
    },
    { 
      icon: Award, 
      value: '150+', 
      label: 'Entreprises partenaires', 
      description: 'Organisations qui nous font confiance',
      color: 'text-orange-600' 
    }
  ];

  // Informations de contact structurées
  const contactInfo = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+242 05 123 456',
      description: 'Du lundi au vendredi, 8h-18h',
      href: 'tel:+24205123456'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@orientationpro.cg',
      description: 'Réponse sous 24h',
      href: 'mailto:contact@orientationpro.cg'
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Brazzaville, Congo',
      description: 'Centre-ville, Avenue des Armées',
      href: '#'
    }
  ];

  // Certifications et conformités
  const certifications = [
    {
      icon: Shield,
      name: 'RGPD Compliant',
      description: 'Protection des données personnelles'
    },
    {
      icon: Award,
      name: 'ISO 27001',
      description: 'Sécurité de l\'information'
    },
    {
      icon: Globe,
      name: 'Accessibilité WCAG 2.1',
      description: 'Interface accessible à tous'
    }
  ];

  return (
    <footer 
      className="bg-gray-900 text-white"
      role="contentinfo"
      aria-label="Pied de page"
    >
      {/* Section principale avec informations organisées */}
      <section className="py-16 border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Logo et description */}
            <div className="lg:col-span-1">
              <Link 
                to="/" 
                className="flex items-center space-x-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg p-2"
                aria-label="Orientation Pro Congo - Retour à l'accueil"
              >
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-bold text-xl text-white">
                    Orientation Pro
                  </span>
                  <p className="text-sm text-gray-400">Congo</p>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                La plateforme de référence pour l'orientation professionnelle au Congo. 
                Nous accompagnons chaque personne dans la construction de son avenir professionnel.
              </p>

              {/* Statistiques clés */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Nos réalisations
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {keyMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <div key={index} className="text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Icon className={`w-6 h-6 ${metric.color}`} aria-hidden="true" />
                        </div>
                        <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                        <div className="text-xs text-gray-400">{metric.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sections de navigation organisées */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {section.description}
                </p>
                <nav aria-label={`Navigation ${section.title}`}>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          to={link.path}
                          className="flex items-start space-x-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded p-1"
                          aria-label={link.description}
                        >
                          <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm">{link.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section contact et informations pratiques */}
      <section className="py-12 border-b border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contact direct */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Nous contacter
              </h3>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-white">{contact.label}</p>
                        <a 
                          href={contact.href}
                          className="text-sm text-gray-300 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                          aria-label={`${contact.label}: ${contact.value}`}
                        >
                          {contact.value}
                        </a>
                        <p className="text-xs text-gray-400 mt-1">{contact.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Newsletter avec accessibilité */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Newsletter
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Recevez nos dernières actualités et conseils professionnels.
              </p>
              <form className="space-y-3" aria-label="Inscription à la newsletter">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Adresse email pour la newsletter
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Votre adresse email"
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-describedby="newsletter-description"
                    required
                  />
                  <p id="newsletter-description" className="text-xs text-gray-400 mt-1">
                    Nous respectons votre vie privée. Désabonnement possible à tout moment.
                  </p>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  aria-label="S'abonner à la newsletter"
                >
                  <ArrowRight className="h-4 w-4 mr-2" aria-hidden="true" />
                  S'abonner
                </Button>
              </form>
            </div>

            {/* Réseaux sociaux avec accessibilité */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Suivez-nous
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Restez connecté avec notre communauté.
              </p>
              <div className="flex space-x-3">
                {[
                  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-400' },
                  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-cyan-400' },
                  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
                  { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-400' }
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 transition-colors ${social.color} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                      aria-label={`Suivre sur ${social.label}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Certifications et conformité */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Conformité & Sécurité
              </h3>
              <div className="space-y-3">
                {certifications.map((cert, index) => {
                  const Icon = cert.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-white">{cert.name}</p>
                        <p className="text-xs text-gray-400">{cert.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer bottom avec informations légales */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Orientation Pro Congo. Tous droits réservés.
            </div>
            <nav 
              className="flex flex-wrap justify-center gap-6 text-sm"
              aria-label="Liens légaux"
            >
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                aria-label="Politique de confidentialité"
              >
                Confidentialité
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                aria-label="Conditions d'utilisation"
              >
                Conditions
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                aria-label="Politique des cookies"
              >
                Cookies
              </Link>
              <Link 
                to="/accessibility" 
                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                aria-label="Déclaration d'accessibilité"
              >
                Accessibilité
              </Link>
            </nav>
          </div>
        </div>
      </section>

      {/* Indicateur de conformité */}
      <div className="bg-gray-800 py-2">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span>WCAG 2.1 AA Conforme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-400" aria-hidden="true" />
              <span>RGPD Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-400" aria-hidden="true" />
              <span>ISO 9241 Conforme</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
