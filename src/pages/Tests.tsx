import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Brain,
  BriefcaseBusiness,
  Heart,
  Lightbulb,
  LineChart,
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
    title: "Test d’Intelligence Émotionnelle",
    to: "/tests/emotional",
    icon: Heart,
    meta: "10-15 min • 45 questions",
    description:
      "Explorez votre manière de comprendre et gérer vos émotions et celles des autres dans les relations professionnelles.",
  },
  {
    title: "Test de Styles d’Apprentissage",
    to: "/tests/learning",
    icon: Lightbulb,
    meta: "10 min • 30 questions",
    description:
      "Explorez votre façon préférée d’apprendre et de traiter l’information pour préparer votre développement.",
  },
  {
    title: "Test des Intelligences Multiples",
    to: "/tests/multiple",
    icon: Brain,
    meta: "15 min • 40 questions",
    description:
      "Explorez différentes formes de compétences inspirées de la théorie des intelligences multiples de Gardner.",
  },
  {
    title: "Test de Reconversion Professionnelle",
    to: "/tests/career-transition",
    icon: RefreshCw,
    meta: "12-15 min • 35 questions",
    description:
      "Explorez votre préparation à une reconversion et les domaines susceptibles de correspondre à vos compétences.",
  },
  {
    title: "Test d’Orientation Sans Diplôme",
    to: "/tests/no-diploma",
    icon: Award,
    meta: "10-12 min • 30 questions",
    description:
      "Explorez des pistes professionnelles à partir de vos compétences et préférences, indépendamment d’un diplôme.",
  },
  {
    title: "Test d’Emploi Senior",
    to: "/tests/senior-employment",
    icon: BriefcaseBusiness,
    meta: "8-10 min • 20 questions",
    description:
      "Explorez vos atouts, expériences et préférences pour préparer une nouvelle étape professionnelle en tant que senior.",
  },
  {
    title: "Test d’Aptitude Entrepreneuriale",
    to: "/tests/entrepreneurial",
    icon: LineChart,
    meta: "10-12 min • 15 questions",
    description:
      "Explorez vos préférences entre entrepreneuriat, salariat, commerce, artisanat et autres modes d’activité.",
  },
];

export default function Tests() {
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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Tests d’orientation
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Mieux se connaître pour mieux choisir
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/90">
              Plusieurs outils de connaissance de soi. Ils servent d’appui à la réflexion et ne
              remplacent ni un diagnostic psychologique, ni un accompagnement professionnel.
            </p>
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
                    Version pilote
                  </Badge>
                </div>
                <h2 className="mt-4 font-heading text-3xl font-bold text-stone-900">Test RIASEC</h2>
                <p className="mt-1 text-sm text-stone-500">10-15 min • 60 affirmations</p>
                <p className="mt-4 text-lg leading-8 text-stone-600">
                  Explorez vos intérêts professionnels selon le modèle de John Holland. Le calcul
                  est <strong>versionné et réalisé côté serveur</strong> : les clés de notation ne
                  sont jamais exposées, et chaque résultat conserve sa méthode.
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
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal>
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-stone-900">Explorer d’autres dimensions</h2>
            <p className="mt-2 text-stone-600">
              Des outils complémentaires en mode exploration, pour élargir votre réflexion.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {explorationTests.map((test, index) => (
            <Reveal key={test.to} delay={(index % 3) * 0.08}>
              <div className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                    <test.icon className="h-6 w-6" />
                  </span>
                  <Badge variant="outline" className="text-stone-500">Exploration</Badge>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-stone-900">{test.title}</h3>
                <p className="mt-1 text-sm text-stone-500">{test.meta}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">{test.description}</p>
                <Link
                  to={test.to}
                  className="mt-5 inline-flex items-center font-medium text-primary transition-transform hover:translate-x-1"
                >
                  Commencer le test <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ChatBot />
    </div>
  );
}
