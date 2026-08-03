import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Route, Users } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="relative bg-primary/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-xl md:flex-row"
        >
          <div className="md:w-2/3">
            <h2 className="mb-3 font-heading text-2xl font-bold text-primary md:text-3xl">Construis ton projet d’avenir maintenant</h2>
            <p className="mb-4 text-gray-600">Un seul parcours réunit tes centres d’intérêt, ta situation, les métiers à explorer et tes prochaines actions.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="gap-2 shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5">
                <Link to="/parcours">
                  <Route size={18} />
                  Commencer mon parcours
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 border-primary/20 transition-all duration-300 hover:bg-primary/10">
                <Link to="/conseiller">
                  <Users size={18} />
                  Demander un accompagnement
                </Link>
              </Button>
            </div>
          </div>
          <div className="group relative flex justify-center md:w-1/3">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <motion.div
              initial={{ scale: 0.9, rotate: -5 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative z-10 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-105 md:h-48 md:w-48"
            >
              <img
                src="/images/heureux-portrait-femme-affaires.jpg"
                alt="Jeune préparant son projet d’avenir"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
