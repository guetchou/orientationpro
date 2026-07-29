import { usePageMeta } from '@/hooks/usePageMeta';
import { BookOpenCheck, Compass, Database, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const methodPillars = [
  {
    title: 'Comprendre vos centres d’intérêt',
    description:
      'Makoki utilise un questionnaire inspiré du modèle RIASEC pour organiser les activités et les environnements professionnels qui attirent votre attention. Ce résultat ouvre des pistes : il ne définit pas votre avenir.',
    icon: Compass,
  },
  {
    title: 'Relier votre profil aux métiers',
    description:
      'Les métiers et les compétences sont décrits à partir de sources reconnues, notamment ESCO et O*NET. Elles nous aident à présenter les métiers, leurs activités et les compétences associées de manière structurée.',
    icon: Database,
  },
  {
    title: 'Expliquer les pistes proposées',
    description:
      'Makoki distingue vos réponses, les informations que vous confirmez et les données métiers. Vous pouvez ainsi comprendre pourquoi une piste apparaît et décider si elle mérite d’être explorée.',
    icon: ShieldCheck,
  },
  {
    title: 'Améliorer le service progressivement',
    description:
      'La plateforme est en développement continu. Les outils sont ajoutés et renforcés par étapes, avec des tests, des limites explicites et une attention particulière à la compréhension du public.',
    icon: BookOpenCheck,
  },
];

const limits = [
  'Makoki ne pose aucun diagnostic psychologique ou médical.',
  'Une piste métier ne garantit ni emploi, ni salaire, ni admission en formation.',
  'Certains métiers exigent des diplômes, des autorisations ou des conditions à vérifier séparément.',
  'Les résultats soutiennent votre réflexion, mais ne remplacent pas votre décision ni un accompagnement professionnel lorsque vous en avez besoin.',
];

export default function About() {
  usePageMeta({
    title: 'À propos',
    description:
      'Découvrez la mission de Makoki, les sources utilisées pour explorer les métiers et les limites de ses recommandations.',
    path: '/about',
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold text-emerald-700">À propos de Makoki</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Vous aider à mieux vous connaître et à explorer vos possibilités avec plus de clarté.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          Makoki est une plateforme d’orientation, de compétences et d’emploi. Elle rassemble progressivement
          les informations de votre parcours, vos centres d’intérêt et des données sur les métiers afin de vous
          aider à identifier plusieurs pistes et à préparer vos prochaines étapes.
        </p>

        <section className="mt-14" aria-labelledby="methode-title">
          <p className="font-semibold text-emerald-700">Notre méthode</p>
          <h2 id="methode-title" className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-slate-950">
            Des outils expliqués, des sources identifiées et une décision qui reste la vôtre
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-700">
            Cette page présente les bases utilisées par Makoki. Les termes techniques sont expliqués ici pour
            préserver une communication simple dans le reste du service.
          </p>

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
          <h2 id="sources-title" className="text-2xl font-semibold text-slate-950">Les principales sources métiers</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">ESCO</h3>
              <p className="mt-2 leading-7 text-slate-700">
                ESCO est une classification européenne des métiers et des compétences. Makoki l’utilise notamment
                pour afficher des intitulés en français et relier les métiers aux compétences qui leur sont associées.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">O*NET</h3>
              <p className="mt-2 leading-7 text-slate-700">
                O*NET décrit de nombreux métiers, leurs activités et leurs caractéristiques. Makoki utilise certaines
                de ces informations pour enrichir l’exploration professionnelle, sans les présenter comme une vérité
                universelle ou comme une description de chaque situation locale.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950" aria-labelledby="limites-title">
          <h2 id="limites-title" className="text-xl font-semibold">Ce que les résultats ne peuvent pas décider</h2>
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
