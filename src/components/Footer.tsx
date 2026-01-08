import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-gray-300 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Section Notre Équipe */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Notre Équipe Passionnée
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Des experts dédiés à votre réussite et à votre épanouissement professionnel
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Image d'équipe */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative">
                  <div 
                    className="w-full h-64 md:h-80 rounded-2xl bg-cover bg-center shadow-2xl border-4 border-blue-500/20"
                    style={{
                      backgroundImage: `url('public/images/staff-ai-genere-entreprise.jpg')`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent rounded-2xl" />
                  
                  {/* Overlay avec texte */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">Équipe Orientation Pro Congo</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      Ensemble pour votre avenir professionnel
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Informations sur l'équipe */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-6 text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">15+ experts en orientation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 font-medium">5000+ étudiants accompagnés</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 font-medium">98% de satisfaction client</span>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  Notre équipe pluridisciplinaire combine expertise en psychologie, 
                  conseil en orientation et connaissance du marché du travail congolais 
                  pour vous offrir un accompagnement personnalisé et efficace.
                </p>
                
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-medium">Passionnés par votre réussite</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Contenu principal du footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Orientation Pro Congo</h3>
            <p className="text-sm leading-relaxed">
              Votre partenaire de confiance pour l'orientation scolaire et professionnelle au Congo. 
              Nous vous guidons vers votre avenir avec expertise et passion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liens Rapides */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tests" className="hover:text-blue-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Tests d'Orientation
                </Link>
              </li>
              <li>
                <Link to="/conseiller" className="hover:text-blue-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Nos Conseillers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Ressources
                </Link>
              </li>
              <li>
                <Link to="/guide-congo-2024" className="hover:text-blue-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Guide des Études Supérieures 2024
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">contact@orientationprocongo.com</span>
              </li>
              <li className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+242 00 000 000</span>
              </li>
              <li className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Brazzaville, République du Congo</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Newsletter</h3>
            <p className="text-sm">Restez informé de nos dernières actualités</p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition-all duration-200 font-medium">
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Orientation Pro Congo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
