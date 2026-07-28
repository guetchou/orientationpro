import { usePageMeta } from '@/hooks/usePageMeta';
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Compass,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Apparition douce à l'entrée dans le viewport, jouée une seule fois. */
const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};

/** <img> responsive WebP : version mobile légère (768w) + desktop (1600w). */
const Photo = ({
  name,
  alt,
  className,
  sizes,
}: {
  name: string;
  alt: string;
  className?: string;
  sizes: string;
}) => (
  <img
    src={`/images/hero/${name}.webp`}
    srcSet={`/images/hero/${name}-sm.webp 768w, /images/hero/${name}.webp 1600w`}
    sizes={sizes}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={className}
  />
);

const stats = [
  { value: '8', label: 'tests d’orientation' },
  { value: '100%', label: 'calcul côté serveur' },
  { value: 'RIASEC', label: 'modèle de John Holland' },
  { value: 'Congo', label: 'métiers et contexte locaux' },
];

const pillars = [
  {
    eyebrow: 'S’orienter',
    title: 'Comprendre vos intérêts, pas deviner votre avenir',
    description:
      'Passez le questionnaire RIASEC versionné et découvrez les familles d’intérêts qui ressortent de vos réponses. Un calcul déterministe, jamais une IA qui décide à votre place.',
    image: 'orientation-etudiants',
    alt: 'Étudiants congolais travaillant ensemble sur un ordinateur portable devant leur campus.',
    to: '/tests',
    cta: 'Passer un test',
    icon: Target,
  },
  {
    eyebrow: 'Être accompagné',
    title: 'Des conseillers et coachs autorisés, à vos côtés',
    description:
      'Échangez avec un professionnel vérifié pour transformer un résultat en projet concret : choix de filière, préparation d’entretien, prochaines étapes.',
    image: 'accompagnement-conseiller',
    alt: 'Un conseiller d’orientation échange avec un jeune couple autour d’un bureau à Brazzaville.',
    to: '/conseiller',
    cta: 'Voir les conseillers',
    icon: Users,
  },
  {
    eyebrow: 'Employabilité',
    title: 'Un CV lisible par les recruteurs',
    description:
      'Analysez votre CV, mesurez sa compatibilité avec les offres et renforcez les points qui comptent avant de postuler.',
    image: 'employabilite-cv',
    alt: 'Un professionnel relit un CV imprimé devant son ordinateur dans un bureau lumineux.',
    to: '/cv-optimizer',
    cta: 'Optimiser mon CV',
    icon: FileText,
  },
  {
    eyebrow: 'Emploi',
    title: 'Des opportunités au Congo, pas ailleurs',
    description:
      'Explorez les postes ouverts et rapprochez-vous des recruteurs. Votre profil d’intérêts éclaire les pistes à considérer en priorité.',
    image: 'emploi-entretien',
    alt: 'Entretien professionnel entre trois personnes dans une salle de réunion vitrée.',
    to: '/jobs',
    cta: 'Voir les offres',
    icon: BriefcaseBusiness,
  },
];

const principles = [
  'Calcul déterministe : aucune IA générative ne produit le score RIASEC.',
  'Sources et versions conservées pour expliquer d’où viennent les données métiers.',
  'Limites affichées : un score ne garantit ni emploi, ni salaire, ni aptitude réglementaire.',
  'Adaptation au Congo progressive, avec revue humaine et traçabilité.',
];

export default function Home() {
  usePageMeta({ description: 'MAKOKI aide chaque jeune du Congo à comprendre ses intérêts, explorer des métiers réels et bâtir un projet d’études ou d’emploi à partir de données explicables.', path: '/' });
  return (
    <main className="bg-white">
      {/* ============================ HERO ============================ */}
      <section className="relative isolate overflow-hidden">
        {/* Photographie plein cadre + dégradé pour la lisibilité du texte. */}
        <div className="absolute inset-0 -z-10">
          <Photo
            name="hero-orientation-campus"
            alt="Groupe d’étudiants congolais réunis autour d’un ordinateur portable sur un campus de Brazzaville."
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-emerald-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-emerald-900 px-4 py-1.5 text-sm font-medium text-amber-100">
              <Sparkles className="h-4 w-4" />
              Orientation • Compétences • Emploi
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Révélez votre potentiel.
              <span className="block text-amber-200">Construisez votre avenir.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
              MAKOKI aide chaque jeune du Congo à comprendre ses intérêts, explorer des métiers
              réels et bâtir un projet d’études ou d’emploi à partir de données explicables.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/tests">
                  Découvrir les métiers qui pourraient me correspondre <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/conseiller">
                  <CalendarCheck className="mr-2 h-5 w-5" /> Être accompagné
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bande de chiffres-clés en pied de hero, en verre dépoli. */}
        <div className="relative border-t border-white/10 bg-emerald-950/70 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-6 py-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 text-center sm:text-left">
                <dt className="font-heading text-3xl font-bold text-amber-200">{stat.value}</dt>
                <dd className="mt-1 text-sm text-emerald-100">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ======================= PILIERS MÉTIER ======================= */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28" aria-labelledby="piliers-title">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-primary">Votre parcours</p>
            <h2
              id="piliers-title"
              className="mt-2 font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl"
            >
              De vos intérêts jusqu’à l’emploi, une étape à la fois
            </h2>
            <p className="mt-4 text-lg leading-8 text-stone-600">
              Commencez par vous, confrontez vos intérêts aux métiers réels, puis avancez avec un
              accompagnement humain et des opportunités concrètes.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {pillars.map((pillar, index) => {
            const reversed = index % 2 === 1;
            return (
              <Reveal key={pillar.eyebrow}>
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  {/* Image */}
                  <div className={reversed ? 'lg:order-2' : ''}>
                    <div className="group relative overflow-hidden rounded-3xl shadow-lg">
                      <Photo
                        name={pillar.image}
                        alt={pillar.alt}
                        sizes="(min-width: 1024px) 40rem, 100vw"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-stone-900/5" />
                    </div>
                  </div>

                  {/* Texte */}
                  <div className={reversed ? 'lg:order-1' : ''}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-primary">
                      <pillar.icon className="h-4 w-4" />
                      {pillar.eyebrow}
                    </span>
                    <h3 className="mt-4 font-heading text-2xl font-bold text-stone-900 sm:text-3xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-lg leading-8 text-stone-600">{pillar.description}</p>
                    <Button asChild className="mt-6 bg-primary hover:bg-primary-800">
                      <Link to={pillar.to}>
                        {pillar.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===================== TRANSPARENCE / ÉTHIQUE ===================== */}
      <section className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <p className="font-semibold text-primary">Une orientation transparente</p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
                Des recommandations expliquées, jamais des promesses artificielles
              </h2>
              <p className="mt-5 text-lg leading-8 text-stone-700">
                MAKOKI distingue vos résultats d’intérêts, les données métiers et la réalité locale.
                Chaque couche reste explicable et sourcée — vous gardez la décision.
              </p>
              <Button asChild variant="outline" className="mt-7">
                <Link to="/about">
                  <Compass className="mr-2 h-4 w-4" /> Notre méthode
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="space-y-3">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-700 shadow-sm"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* =========================== CTA FINAL =========================== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Photo
            name="orientation-etudiants"
            alt=""
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary-900/90" />
        </div>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-white lg:py-24">
          <Reveal>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Prêt à découvrir vos premières pistes ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-50/90">
              Créez votre compte, passez le questionnaire disponible et consultez des
              recommandations expliquées, étape par étape.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/register">
                  Créer mon compte <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/tests">Commencer un test</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
