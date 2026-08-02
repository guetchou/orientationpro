import { usePageMeta } from '@/hooks/usePageMeta';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfessionalJobBoard } from '@/components/recruitment/ProfessionalJobBoard';

export default function ProfessionalJobsPage() {
  usePageMeta({ title: "Offres d’emploi", description: "Découvrez des offres d’emploi et des opportunités professionnelles au Congo.", path: "/jobs" });
  return (
    <div className="min-h-screen bg-stone-50">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero/emploi-entretien.webp"
            srcSet="/images/hero/emploi-entretien-sm.webp 768w, /images/hero/emploi-entretien.webp 1600w"
            sizes="100vw"
            alt="Entretien professionnel entre trois personnes dans une salle de réunion vitrée à Brazzaville."
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
              <BriefcaseBusiness className="h-4 w-4" />
              Emploi
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              L’emploi au Congo,
              <span className="block text-amber-200">avec méthode</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/90">
              Consulte des offres, compare les missions et prépare une candidature adaptée à chaque opportunité.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/parcours">Mieux définir mon projet</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/cv-optimizer">Préparer mon CV</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-emerald-50/70">
              <ShieldCheck className="h-4 w-4 text-amber-200" />
              Vérifie toujours l’identité de l’employeur avant de transmettre tes informations.
            </p>
          </motion.div>
        </div>
      </section>

      <ProfessionalJobBoard />
    </div>
  );
}
