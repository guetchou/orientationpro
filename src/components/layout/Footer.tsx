import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  Users,
  Globe,
  Shield,
  CheckCircle,
  Heart,
  MessageSquare,
  Calendar,
  BookOpen,
  TrendingUp,
  Zap,
  Sparkles,
  Info,
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Footer moderne 2025 - Design épuré et fonctionnel
 * Structure optimisée selon les meilleures pratiques :
 * - Hiérarchie claire et logique
 * - Design moderne avec glassmorphism
 * - Contenu organisé par catégories
 * - Call-to-actions stratégiques
 * - Conformité et crédibilité
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Données structurées pour le footer
  const footerSections = [
    {
      title: "Orientation",
      links: [
        { name: "Tests d'Orientation", path: "/tests", icon: Brain },
        { name: "Bilans Personnalisés", path: "/orientation", icon: Award },
        { name: "Conseillers Experts", path: "/conseillers", icon: Users },
        { name: "Guides & Ressources", path: "/guides", icon: BookOpen }
      ]
    },
    {
      title: "Recrutement",
      links: [
        { name: "Job Board", path: "/recruitment", icon: Briefcase },
        { name: "CV Optimizer", path: "/cv-optimizer", icon: TrendingUp },
        { name: "Matching IA", path: "/matching", icon: Zap },
        { name: "Entreprises", path: "/entreprises", icon: Globe }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Centre d'Aide", path: "/help", icon: MessageSquare },
        { name: "Contact", path: "/contact", icon: Mail },
        { name: "À Propos", path: "/about", icon: Info },
        { name: "Blog", path: "/blog", icon: BookOpen }
      ]
    },
    {
      title: "Légal",
      links: [
        { name: "Confidentialité", path: "/privacy", icon: Shield },
        { name: "Conditions", path: "/terms", icon: FileText },
        { name: "Cookies", path: "/cookies", icon: Settings },
        { name: "Accessibilité", path: "/accessibility", icon: CheckCircle }
      ]
    }
  ];



  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        
        {/* Section Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Colonne 1: Brand & Description */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-white font-bold text-xl">OP</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">OrientationPro</h3>
                  <p className="text-blue-200 text-sm">Congo</p>
                </div>
              </Link>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">
                Plateforme leader d'orientation professionnelle au Congo. 
                Découvrez votre voie grâce à nos tests RIASEC, optimisez votre CV 
                et trouvez l'emploi de vos rêves avec l'aide de nos conseillers experts.
              </p>
            </motion.div>
          </div>

          {/* Colonnes 2-5: Navigation */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 group"
                    >
                      <link.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>



        {/* Section Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Nous Contacter</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Brazzaville, République du Congo</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">+242 06 123 45 67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">contact@orientationpro.cg</span>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Horaires</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Lun - Ven</span>
                <span>8h00 - 18h00</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Samedi</span>
                <span>9h00 - 15h00</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Dimanche</span>
                <span>Fermé</span>
              </div>
            </div>
          </div>

          {/* Réseaux Sociaux */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com/orientationprocongo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://instagram.com/orientationprocongo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-300 hover:text-pink-600 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Barre de Séparation */}
        <div className="border-t border-white/20 mb-8"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-gray-400 text-sm">
              © {currentYear} OrientationPro Congo. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Conditions
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Fait avec</span>
            <Heart className="w-4 h-4 text-red-400 fill-current" />
            <span>au Congo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
