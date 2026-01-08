import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-12 bg-primary/5 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500"
        >
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 font-heading text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Besoin d'accompagnement personnalisé ?</h2>
            <p className="text-gray-600 mb-4">Nos conseillers d'orientation sont disponibles pour vous guider à chaque étape de votre parcours.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:translate-y-[-2px]">
                <Link to="/conseiller">
                <Users size={18} />
                Voir nos conseillers
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 transition-all duration-300">
                <Link to="/tests">
                <BookOpen size={18} />
                Ressources gratuites
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
            <motion.div 
              initial={{ scale: 0.9, rotate: -5 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-300"
            >
              <img 
                src="public/images/heureux-portrait-femme-affaires.jpg" 
                alt="Conseiller d'orientation" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
