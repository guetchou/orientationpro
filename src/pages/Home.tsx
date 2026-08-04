import { usePageMeta } from '@/hooks/usePageMeta';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/motion/Reveal';
import { CompassMarker, TrajectoryLine } from '@/components/home/PathMotifs';

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

const situations = [
  'Les métiers qui te correspondent.',
  'Les formations ou les écoles à choisir.',
  'Les prochaines étapes pour avancer.',
];

const benefits = [
  {
    title: 'Faire le point sur toi',
    description:
      'Rassemble ton parcours, tes centres d’intérêt, tes compétences et ce que tu recherches aujourd’hui.',
    icon: Target,
    photo: 'accompagnement-conseiller',
    alt: 'Une personne échange avec un conseiller autour d’un dossier.',
  },
  {
    title: 'Découvrir plusieurs possibilités',
    description:
      'Explore des métiers et comprends pourquoi certaines pistes méritent ton attention.',
    icon: Compass,
    photo: 'employabilite-cv',
    alt: 'Une personne travaille sur son CV et ses compétences sur un ordinateur portable.',
  },
  {
    title: 'Avancer avec plus de clarté',
    description:
      'Compare les options, complète ton profil à ton rythme et choisis tes prochaines étapes.',
    icon: BriefcaseBusiness,
    photo: 'emploi-entretien',
    alt: 'Une personne en entretien d’embauche face à un recruteur.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Découvre tes intérêts',
    description: 'Réponds à des affirmations simples pour identifier les activités et environnements qui t’attirent.',
  },
  {
    number: '2',
    title: 'Précise ta situation',
    description: 'Ajoute ton parcours, tes compétences, tes contraintes et ce que tu souhaites construire.',
  },
  {
    number: '3',
    title: 'Découvre des pistes',
    description: 'Consulte plusieurs métiers et comprends pourquoi ils peuvent être intéressants à explorer.',
  },
  {
    number: '4',
    title: 'Choisis tes prochaines étapes',
    description: 'Compare les possibilités et transforme ta réflexion en premières actions concrètes.',
  },
];

const principles = [
  {
    title: 'Plusieurs pistes, pas une réponse unique',
    description: 'Makoki t’aide à ouvrir le champ des possibles sans choisir à ta place.',
  },
  {
    title: 'Des explications compréhensibles',
    description: 'Tu vois les éléments de ton profil qui ont contribué aux pistes présentées.',
  },
  {
    title: 'Un profil qui peut évoluer',
    description: 'Ton parcours n’est pas figé. Tu peux le compléter et le réviser au fil du temps.',
  },
  {
    title: 'La décision t’appartient',
    description: 'Makoki soutient ta réflexion. Tes choix restent personnels et doivent tenir compte de ta réalité.',
  },
];

export default function Home() {
  usePageMeta({
    description:
      'Makoki t’aide à mieux comprendre ton profil, explorer des métiers et identifier des prochaines étapes qui ont du sens pour toi.',
    path: '/',
  });
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-16">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.65, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Orientation • Compétences • Emploi
            </span>
            <h1 className="mt-6 max-w-[680px] font-heading text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.6rem]">
              Découvre les métiers qui te correspondent,
              <span className="block text-emerald-700">en 15 minutes.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Makoki t’aide à comprendre tes intérêts, explorer des métiers et identifier les prochaines étapes pour avancer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/parcours">
                  Commencer mon projet <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <a href="#comment-makoki-vous-aide">Voir comment ça marche</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut', delay: 0.08 }}
            className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-emerald-50 lg:min-h-[500px]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_30%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_26%_76%,rgba(245,158,11,0.10),transparent_28%)]" />
            <img
              src="/images/hero/makoki-hero-youth-transparent.png"
              alt="Deux jeunes consultent ensemble un ordinateur portable."
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-x-0 bottom-0 h-[108%] w-full object-contain object-bottom"
            />
          </motion.div>
        </div>

        <div className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-px px-6 py-6 sm:grid-cols-3">
            {situations.map((situation) => (
              <p key={situation} className="border-slate-200 px-4 py-2 text-sm leading-6 text-slate-700 sm:border-l sm:first:border-l-0">
                {situation}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="comment-makoki-vous-aide" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 lg:py-28" aria-labelledby="benefices-title">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-primary">Ce que Makoki t’aide à faire</p>
            <h2 id="benefices-title" className="mt-2 font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Mettre de l’ordre dans tes questions et avancer étape par étape
            </h2>
            <p className="mt-4 text-lg leading-8 text-stone-600">
              Tu n’as pas besoin d’avoir déjà toutes les réponses. Commence par ta situation actuelle,
              puis explore les possibilités qui s’ouvrent à toi.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title}>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <div
                  className={cn(
                    'overflow-hidden rounded-3xl shadow-lg',
                    index % 2 === 1 && 'lg:order-2',
                  )}
                >
                  <Photo
                    name={benefit.photo}
                    alt={benefit.alt}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="h-72 w-full object-cover lg:h-96"
                  />
                </div>
                <div className={cn(index % 2 === 1 && 'lg:order-1')}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <benefit.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold text-stone-900">{benefit.title}</h3>
                  <p className="mt-3 text-lg leading-7 text-stone-600">{benefit.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-stone-50" aria-labelledby="parcours-title">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <Reveal>
            <div className="max-w-3xl">
              <p className="font-semibold text-primary">Comment cela se passe</p>
              <h2 id="parcours-title" className="mt-2 font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
                Un parcours simple, que tu peux reprendre à ton rythme
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-16 pt-6 lg:mt-20">
            <TrajectoryLine />
            <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li
                  key={step.number}
                  className="relative h-full rounded-2xl border border-stone-200 bg-white p-6 pt-9 shadow-sm"
                >
                  <Reveal delay={index * 0.06}>
                    <div className="absolute -top-6 left-6">
                      <CompassMarker number={step.number} />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{step.description}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28" aria-labelledby="difference-title">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div>
              <p className="font-semibold text-primary">Pourquoi Makoki</p>
              <h2 id="difference-title" className="mt-2 font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
                Une boussole pour ta réflexion, pas une décision à ta place
              </h2>
              <p className="mt-5 text-lg leading-8 text-stone-700">
                Une orientation utile ne se résume pas à un résultat isolé. Makoki t’aide à relier
                plusieurs éléments de ton parcours et à comprendre les pistes proposées.
              </p>
              <Button asChild variant="outline" className="mt-7">
                <Link to="/about">
                  <FileText className="mr-2 h-4 w-4" /> Découvrir notre méthode
                </Link>
              </Button>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 0.05}>
                <article className="h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold text-stone-900">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{principle.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100 bg-emerald-50/60">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <Reveal>
            <Compass className="mx-auto h-9 w-9 text-primary" />
            <h2 className="mt-4 font-heading text-3xl font-bold text-stone-900">Ton projet évolue, Makoki t’accompagne</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Reviens compléter ton profil, explorer de nouvelles pistes et ajuster tes prochaines étapes au fil de ton parcours.
            </p>
          </Reveal>
        </div>
      </section>

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
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Prêt à faire le point ?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-50/90">
              Découvre tes intérêts et commence à explorer des pistes adaptées à ta situation actuelle.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/parcours">
                  Commencer mon projet <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/careers">Explorer les métiers</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
