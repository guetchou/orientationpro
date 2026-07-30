import { usePageMeta } from '@/hooks/usePageMeta';
import { type ReactNode } from 'react';
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
import { CompassMarker, TrajectoryLine } from '@/components/home/PathMotifs';

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
  'Vous hésitez entre plusieurs études ou plusieurs métiers.',
  'Vous avez des compétences, mais vous ne savez pas comment les relier à un projet.',
  'Vous souhaitez changer de voie sans savoir par où commencer.',
];

const benefits = [
  {
    title: 'Faire le point sur vous',
    description:
      'Rassemblez votre parcours, vos centres d’intérêt, vos compétences et ce que vous recherchez aujourd’hui.',
    icon: Target,
    photo: 'accompagnement-conseiller',
    alt: 'Une personne échange avec un conseiller autour d’un dossier.',
  },
  {
    title: 'Découvrir plusieurs possibilités',
    description:
      'Explorez des métiers et comprenez pourquoi certaines pistes méritent votre attention.',
    icon: Compass,
    photo: 'employabilite-cv',
    alt: 'Une personne travaille sur son CV et ses compétences sur un ordinateur portable.',
  },
  {
    title: 'Avancer avec plus de clarté',
    description:
      'Comparez les options, complétez votre profil à votre rythme et choisissez vos prochaines étapes.',
    icon: BriefcaseBusiness,
    photo: 'emploi-entretien',
    alt: 'Une personne en entretien d’embauche face à un recruteur.',
  },
];

const steps = [
  {
    number: '1',
    title: 'Créez votre profil',
    description: 'Parlez de votre parcours, de votre situation et de ce que vous souhaitez changer ou construire.',
  },
  {
    number: '2',
    title: 'Répondez à quelques questions',
    description: 'Prenez le temps de préciser ce qui vous attire, ce que vous savez faire et ce qui compte pour vous.',
  },
  {
    number: '3',
    title: 'Découvrez des pistes',
    description: 'Consultez plusieurs métiers et les raisons pour lesquelles ils peuvent être intéressants à explorer.',
  },
  {
    number: '4',
    title: 'Affinez votre parcours',
    description: 'Revenez sur votre profil, ajoutez de nouvelles informations et faites évoluer vos choix.',
  },
];

const principles = [
  {
    title: 'Plusieurs pistes, pas une réponse unique',
    description: 'Makoki vous aide à ouvrir le champ des possibles sans choisir à votre place.',
  },
  {
    title: 'Des explications compréhensibles',
    description: 'Vous voyez les éléments de votre profil qui ont contribué aux pistes présentées.',
  },
  {
    title: 'Un profil qui peut évoluer',
    description: 'Votre parcours n’est pas figé. Vous pouvez le compléter et le réviser au fil du temps.',
  },
  {
    title: 'La décision vous appartient',
    description: 'Makoki soutient votre réflexion. Vos choix restent personnels et doivent tenir compte de votre réalité.',
  },
];

export default function Home() {
  usePageMeta({
    description:
      'Makoki vous aide à mieux comprendre votre profil, explorer des métiers et identifier des prochaines étapes qui ont du sens pour vous.',
    path: '/',
  });

  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 -z-10">
          <Photo
            name="hero-orientation-campus"
            alt="Groupe de jeunes réunis autour d’un ordinateur portable."
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-emerald-950/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-emerald-900/80 px-4 py-1.5 text-sm font-medium text-amber-100">
              <Sparkles className="h-4 w-4" />
              Orientation • Compétences • Emploi
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Trouvez une direction
              <span className="block text-amber-200">qui vous ressemble.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
              Makoki vous aide à mieux comprendre votre profil, à explorer des métiers et à identifier
              les prochaines étapes qui ont du sens pour vous.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/register">
                  Commencer mon parcours <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#comment-makoki-vous-aide">Découvrir comment Makoki peut m’aider</a>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="relative border-t border-white/10 bg-emerald-950/75 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl gap-px px-6 py-7 sm:grid-cols-3">
            {situations.map((situation) => (
              <p key={situation} className="border-white/10 px-4 py-2 text-sm leading-6 text-emerald-50 sm:border-l sm:first:border-l-0">
                {situation}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section id="comment-makoki-vous-aide" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-20 lg:py-28" aria-labelledby="benefices-title">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold text-primary">Ce que Makoki vous aide à faire</p>
            <h2 id="benefices-title" className="mt-2 font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Mettre de l’ordre dans vos questions et avancer étape par étape
            </h2>
            <p className="mt-4 text-lg leading-8 text-stone-600">
              Vous n’avez pas besoin d’avoir déjà toutes les réponses. Commencez par votre situation actuelle,
              puis explorez les possibilités qui s’ouvrent à vous.
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
                Un parcours simple, que vous pouvez reprendre à votre rythme
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
                Une boussole pour votre réflexion, pas une décision à votre place
              </h2>
              <p className="mt-5 text-lg leading-8 text-stone-700">
                Une orientation utile ne se résume pas à un résultat isolé. Makoki vous aide à relier
                plusieurs éléments de votre parcours et à comprendre les pistes proposées.
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
            <h2 className="mt-4 font-heading text-3xl font-bold text-stone-900">Makoki évolue avec votre parcours</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-700">
              Le service est en développement continu. De nouveaux outils viendront progressivement enrichir
              votre réflexion, organiser vos prochaines étapes et vous aider à suivre votre progression.
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
              Créez votre profil et commencez à explorer des pistes adaptées à votre situation actuelle.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/register">
                  Commencer mon parcours <ArrowRight className="ml-2 h-5 w-5" />
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
