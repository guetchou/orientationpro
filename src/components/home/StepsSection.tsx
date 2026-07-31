import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const StepsSection = () => {
  const steps = [
    {
      title: 'Découvre tes intérêts',
      description: 'Le RIASEC est la première étape du même Projet de vie, pas un test séparé.',
    },
    {
      title: 'Ajoute ta situation réelle',
      description: 'Ton niveau, tes compétences, ton budget, ta mobilité et tes priorités rendent les options réalistes.',
    },
    {
      title: 'Reçois un rapport unique',
      description: 'Compare tes scénarios, retiens une piste provisoire et repars avec une première action concrète.',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Un seul parcours, du RIASEC au plan d’action</h2>
          <p className="text-lg text-gray-600">Tu avances sans changer de test, de dossier ou de rapport.</p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative rounded-xl bg-white p-8 shadow-md"
            >
              <span className="absolute -left-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mb-4 text-xl font-bold">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
        >
          <div className="mb-4 flex justify-center"><CheckCircle2 className="h-12 w-12 text-primary" /></div>
          <h3 className="mb-2 text-2xl font-bold">Ton choix reste provisoire et vérifiable</h3>
          <p className="mb-6 text-gray-700">MAKOKI explique les raisons, les limites et les informations à confirmer. Il ne promet ni admission, ni emploi, ni réussite automatique.</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/parcours">Commencer mon Projet de vie<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
