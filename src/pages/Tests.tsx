import { usePageMeta } from '@/hooks/usePageMeta';
import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Brain,
  BriefcaseBusiness,
  Clock,
  Heart,
  Lightbulb,
  LineChart,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChatBot } from "@/components/chat/ChatBot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.55, ease: "easeOut", delay }}
  >
    {children}
  </motion.div>
);

const explorationTests = [
  {
    title: "Intelligence émotionnelle",
    to: "/tests/emotional",
    icon: Heart,
    duration: "10-15 min",
    questions: "45 questions",
    description:
      "Comprends ta manière de gérer tes émotions et celles des autres dans les relations professionnelles.",
  },
  {
    title: "Styles d’apprentissage",
    to: "/tests/learning",
    icon: Lightbulb,
    duration: "10 min",
    questions: "30 questions",
    description:
      "Découvre ta façon préférée d’apprendre et de traiter l’information pour mieux étudier.",
  },
  {
    title: "Intelligences multiples",
    to: "/tests/multiple",
    icon: Brain,
    duration: "15 min",
    questions: "40 questions",
    description:
      "Explore tes formes de compétences, inspirées de la théorie des intelligences multiples de Gardner.",
  },
  {
    title: "Reconversion professionnelle",
    to: "/tests/career-transition",
    icon: RefreshCw,
    duration: "12-15 min",
    questions: "35 questions",
    description:
      "Fais le point sur ta préparation à une reconversion et les domaines qui te correspondent.",
  },
  {
    title: "Orientation sans diplôme",
    to: "/tests/no-diploma",
    icon: Award,
    duration: "10-12 min",
    questions: "30 questions",
    description:
      "Trouve des pistes de métiers à partir de tes compétences et préférences, sans condition de diplôme.",
  },
  {
    title: "Emploi senior",
    to: "/tests/senior-employment",
    icon: BriefcaseBusiness,
    duration: "8-10 min",
    questions: "20 questions",
    description:
      "Valorise ton expérience et tes préférences pour préparer une nouvelle étape professionnelle.",
  },
  {
    title: "Aptitude entrepreneuriale",
    to: "/tests/entrepreneurial",
    icon: LineChart,
    duration: "10-12 min",
    questions: "15 questions",
    description:
      "Situe-toi entre entrepreneuriat, salariat, commerce et artisanat selon tes préférences.",
  },
];

const heroStats = [
  { value: "8", label: "tests disponibles" },
  { value: "~10 min", label: "en moyenne" },
  { value: "RIASEC", label: "modèle de référence" },
];

export default function Tests() {
  usePageMeta({ title: 'Tests d’orientation', description: 'Passez le questionnaire d’intérêts RIASEC et d’autres outils de connaissance de soi pour découvrir les métiers qui vous correspondent.', path: '/tests' });
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ============================ HERO ============================ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero/orientation-etudiants.webp"
            srcSet="/images/hero/orientation-etudiants-sm.webp 768w, /images/hero/orientation-etudiants.webp 1600w"
            sizes="100vw"
            alt="Étudiants congolais consultant ensemble un test d’orientation sur un ordinateur portable."
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/85 to-emerald-950/60" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-emerald-900 px-4 py-1.5 text-sm font-medium text-amber-100">
              <Sparkles className="h-4 w-4" />
              Tests d’orientation
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Mieux se connaître pour mieux choisir
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
              Des outils de connaissance de soi, appuyés sur le modèle RIASEC reconnu à
              l’international, pour découvrir les métiers qui te correspondent.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/tests/riasec">
                  Commencer le test RIASEC <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#tous-les-tests">Voir tous les tests</a>
              </Button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-heading text-2xl font-bold text-amber-200">{stat.value}</dt>
                  <dd className="text-sm text-emerald-50/90">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>

      {/* ==================== TEST RIASEC (EN VEDETTE) ==================== */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
            <div className="grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:items-center md:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary hover:bg-primary">Recommandé</Badge>
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                    Le plus complet
                  </Badge>
                </div>
                <h2 className="mt-4 font-heading text-3xl font-bold text-stone-900">Test RIASEC</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    <Clock className="h-3.5 w-3.5" /> 10-15 min
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    <ListChecks className="h-3.5 w-3.5" /> 60 affirmations
                  </span>
                </div>
                <p className="mt-4 text-lg leading-8 text-stone-600">
                  Explore tes intérêts professionnels selon le modèle de John Holland. Le calcul est{" "}
                  <strong>versionné et réalisé côté serveur</strong> : les clés de notation ne sont
                  jamais exposées, et chaque résultat conserve sa méthode.
                </p>
                <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary-800">
                  <Link to="/tests/riasec">
                    Commencer le test RIASEC <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-6">
                <ul className="space-y-3 text-sm text-emerald-950">
                  {[
                    "Résultat d’intérêts en 6 dimensions (RIASEC)",
                    "Recommandations de métiers sourcées",
                    "Reprise possible sur ce navigateur",
                    "Limites et méthode affichées clairement",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================== AUTRES TESTS (EXPLORATION) ===================== */}
      <section id="tous-les-tests" className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal>
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-stone-900">Explorer d’autres dimensions</h2>
            <p className="mt-2 text-stone-600">
              Des outils complémentaires en mode exploration, pour élargir ta réflexion.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {explorationTests.map((test, index) => {
            const Icon = test.icon;
            return (
              <Reveal key={test.to} delay={(index % 3) * 0.08}>
                <Link
                  to={test.to}
                  className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary transition-colors group-hover:bg-emerald-100">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                      <Clock className="h-3.5 w-3.5" /> {test.duration}
                    </span>
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-stone-900">{test.title}</h3>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500">
                    <ListChecks className="h-3.5 w-3.5" /> {test.questions}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">{test.description}</p>
                  <span className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    Commencer le test <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
