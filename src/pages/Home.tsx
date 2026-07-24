import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Compass, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const journeys = [
  {
    title: 'Comprendre votre profil',
    description: 'Passez un questionnaire RIASEC versionné pour identifier les familles d’intérêts qui ressortent de vos réponses.',
    icon: Target,
    link: '/tests',
    action: 'Découvrir les tests',
  },
  {
    title: 'Explorer les métiers',
    description: 'Comparez votre profil à un catalogue professionnel sourcé. Les scores servent à classer des pistes, pas à décider à votre place.',
    icon: Compass,
    link: '/careers',
    action: 'Explorer le catalogue',
  },
  {
    title: 'Préparer votre avenir',
    description: 'Consultez les opportunités, travaillez votre CV et approfondissez votre projet avec les ressources disponibles.',
    icon: BriefcaseBusiness,
    link: '/jobs',
    action: 'Voir les opportunités',
  },
];

const principles = [
  'Calcul déterministe : aucune IA générative ne produit le score RIASEC.',
  'Sources et versions conservées pour expliquer d’où viennent les données métiers.',
  'Limites affichées clairement : un score ne garantit ni emploi, ni salaire, ni aptitude réglementaire.',
  'Adaptation au Congo réalisée progressivement, avec revue humaine et traçabilité.',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white pt-16 lg:pt-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/10">
              Orientation • Compétences • Emploi
            </Badge>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Révélez votre potentiel. Construisez votre avenir.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
              MAKOKI vous aide à comprendre vos intérêts, explorer des métiers et structurer un projet d’études ou d’emploi à partir de données explicables.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-white text-emerald-950 hover:bg-emerald-50">
                <Link to="/tests">Commencer mon orientation<ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link to="/careers">Explorer les métiers</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/15 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="h-6 w-6 text-emerald-300" /> Une orientation transparente
              </CardTitle>
              <CardDescription className="text-base leading-7 text-emerald-50/80">
                MAKOKI distingue les résultats d’intérêts, les données métiers et la réalité locale. Chaque couche doit rester explicable et sourcée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {principles.map((principle) => (
                <div key={principle} className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-emerald-50">
                  <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <span>{principle}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="journeys-title">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Votre parcours</p>
          <h2 id="journeys-title" className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Trois étapes pour avancer avec méthode
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Commencez par vos intérêts, confrontez-les aux métiers, puis enrichissez votre décision avec les études, les compétences, les contraintes du métier et le contexte local.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {journeys.map((journey) => (
            <Card key={journey.title} className="flex h-full flex-col border-slate-200 shadow-sm">
              <CardHeader>
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <journey.icon className="h-6 w-6" />
                </span>
                <CardTitle>{journey.title}</CardTitle>
                <CardDescription className="text-base leading-7">{journey.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={journey.link}>{journey.action}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold text-emerald-700">Contexte congolais</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Une adaptation locale progressive, sans promesses artificielles</h2>
            <p className="mt-5 text-base leading-8 text-slate-700">
              Les référentiels internationaux apportent une base structurée, mais ne suffisent pas à décrire seuls les formations, les débouchés et les métiers exercés au Congo. MAKOKI signale ce qui est déjà sourcé et ce qui reste à examiner localement.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-950"><Compass className="h-5 w-5 text-emerald-700" />Ce que le résultat doit permettre</h3>
            <ul className="mt-5 space-y-3 text-slate-700">
              <li>• identifier des familles de métiers à explorer ;</li>
              <li>• comparer plusieurs pistes sans imposer une seule réponse ;</li>
              <li>• préparer les questions à poser à un conseiller, une école ou un employeur ;</li>
              <li>• conserver la source et la méthode derrière chaque recommandation.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Prêt à découvrir vos premières pistes ?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Créez votre compte, passez le questionnaire disponible et consultez des recommandations expliquées étape par étape.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/register">Créer mon compte<ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </section>
    </main>
  );
}
