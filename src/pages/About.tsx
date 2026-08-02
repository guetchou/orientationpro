import { usePageMeta } from '@/hooks/usePageMeta';
import { BookOpenCheck, Compass, Database, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const methodPillars = [
  {
    title: 'Comprendre tes centres d’intérêt',
    description:
      'Makoki organise les activités et les environnements professionnels qui attirent ton attention afin de faire apparaître plusieurs pistes à explorer.',
    icon: Compass,
  },
  {
    title: 'Relier ton profil aux métiers',
    description:
      'Les fiches métiers s’appuient sur des sources reconnues pour présenter les activités, les compétences et les différentes appellations de chaque métier.',
    icon: Database,
  },
  {
    title: 'Expliquer les pistes proposées',
    description:
      'Tu peux comprendre quels éléments de ton profil ont contribué aux suggestions et décider toi-même des pistes qui méritent d’être approfondies.',
    icon: ShieldCheck,
  },
  {
    title: 'Faire évoluer ton projet',
    description:
      'Ton projet n’est pas figé. Tu peux compléter tes informations, comparer de nouvelles possibilités et ajuster tes prochaines étapes au fil du temps.',
    icon: BookOpenCheck,
  },
];

const limits = [
  'Makoki ne pose aucun diagnostic psychologique ou médical.',
  'Une piste métier ne garantit ni emploi, ni salaire, ni admission en formation.',
  'Certains métiers exigent des diplômes, des autorisations ou des conditions à vérifier auprès des organismes compétents.',
  'Les résultats soutiennent ta réflexion, mais la décision finale t’appartient.',
];

export default function About() {
  usePageMeta({
    title: 'À propos',
    description:
      'Découvre la mission de Makoki, sa manière de présenter les métiers et les limites de ses recommandations.',
    path: '/about',
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold text-emerald-700">À propos de Makoki</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Mieux te connaître, explorer tes possibilités et avancer avec plus de clarté.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          Makoki est une plateforme d’orientation, de compétences et d’emploi. Elle t’aide à relier
          ton parcours, tes centres d’intérêt et les informations sur les métiers pour construire
          plusieurs pistes et préparer tes prochaines étapes.
        </p>

        <section className="mt-14" aria-labelledby="methode-title">
          <p className="font-semibold text-emerald-700">Notre approche</p>
          <h2 id="methode-title" className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-slate-950">
            Des pistes compréhensibles et une décision qui reste la tienne
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {methodPillars.map((pillar) => (
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
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="sources-title">
          <h2 id="sources-title" className="text-2xl font-semibold text-slate-950">D’où viennent les informations métiers ?</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">
            Makoki utilise des référentiels métiers reconnus pour structurer les descriptions, les compétences et les appellations. Ces informations sont ensuite présentées simplement dans les fiches métiers. Les détails méthodologiques et les licences restent disponibles lorsque cela est nécessaire.
          </p>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950" aria-labelledby="limites-title">
          <h2 id="limites-title" className="text-xl font-semibold">Ce que Makoki ne peut pas décider à ta place</h2>
          <ul className="mt-4 space-y-3">
            {limits.map((limit) => (
              <li key={limit} className="flex gap-3 leading-7">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
