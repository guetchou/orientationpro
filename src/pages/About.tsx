import { BookOpenCheck, Compass, Database, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pillars = [
  {
    title: 'Orientation explicable',
    description: 'Les résultats doivent pouvoir être reliés aux réponses, à une méthode versionnée et à des limites clairement affichées.',
    icon: Compass,
  },
  {
    title: 'Données traçables',
    description: 'Les sources métiers, leurs versions et leurs licences sont conservées afin d’éviter les recommandations opaques.',
    icon: Database,
  },
  {
    title: 'Décision humaine',
    description: 'MAKOKI organise des pistes à explorer. La décision finale reste personnelle et doit intégrer les compétences, les études et le contexte réel.',
    icon: ShieldCheck,
  },
  {
    title: 'Adaptation locale progressive',
    description: 'Les référentiels internationaux sont complétés progressivement par une revue du contexte congolais, sans inventer de données locales.',
    icon: BookOpenCheck,
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold text-emerald-700">À propos</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          MAKOKI aide à comprendre son profil, explorer les métiers et construire un projet réaliste.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          MAKOKI est une plateforme d’orientation, de compétences et d’emploi conçue pour rendre les parcours plus lisibles. Elle rassemble des questionnaires, des référentiels métiers, des ressources d’employabilité et des outils d’accompagnement.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-slate-200 shadow-sm">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <pillar.icon className="h-5 w-5" />
                </span>
                <CardTitle className="mt-3">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="leading-7 text-slate-700">{pillar.description}</CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Bon à savoir</h2>
          <p className="mt-3 leading-7">
            Un résultat MAKOKI éclaire ta réflexion et ouvre des pistes. Certains métiers réglementés exigent diplômes ou autorisations à vérifier séparément.
          </p>
        </section>
      </div>
    </main>
  );
}
