
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const StepsSection = () => {
  const steps = [
    {
      title: "Passez nos tests d'orientation",
      description: "Découvrez vos aptitudes, votre personnalité et vos intérêts professionnels",
      link: "/tests"
    },
    {
      title: "Consultez nos conseillers",
      description: "Bénéficiez d'un accompagnement personnalisé avec nos experts en orientation",
      link: "/conseillers"
    },
    {
      title: "Explorez les formations",
      description: "Découvrez les établissements et formations qui correspondent à votre profil",
      link: "/establishments"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Notre approche en 3 étapes
          </h2>
          <p className="text-lg text-gray-600">
            Nous vous accompagnons tout au long de votre parcours d'orientation
            avec une méthodologie éprouvée
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-xl p-8 shadow-md relative"
            >
              <span className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-6">{step.description}</p>
              <Button asChild variant="ghost" className="group">
                <Link to={step.link} className="flex items-center">
                  <span>En savoir plus</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-8 max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">
            Réussite garantie
          </h3>
          <p className="text-gray-700 mb-6">
            Plus de 90% de nos utilisateurs trouvent leur voie grâce à notre approche personnalisée
            et notre suivi adapté à chaque profil.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/tests">
              Commencer mon parcours d'orientation
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
