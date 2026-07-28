import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Compass, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resources = [
  {
    title: 'Comprendre le modèle RIASEC',
    description: 'Découvrez comment les six familles d’intérêts peuvent soutenir une réflexion d’orientation, ainsi que les limites à conserver lors de l’interprétation.',
    icon: Compass,
    path: '/tests',
    action: 'Voir les outils',
  },
  {
    title: 'Explorer les métiers avec méthode',
    description: 'Comparez les pistes professionnelles sans confondre proximité d’intérêts, compétences acquises, débouchés réels et conditions d’exercice.',
    icon: BriefcaseBusiness,
    path: '/careers',
    action: 'Explorer les métiers',
  },
  {
    title: 'Préparer un CV lisible',
    description: 'Organisez les informations utiles à un recruteur et vérifiez toujours les affirmations, dates, compétences et coordonnées présentes dans le document.',
    icon: FileText,
    path: '/cv-optimizer',
    action: 'Préparer mon CV',
  },
];

export default function Blog() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Ressources MAKOKI</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Des repères pour construire votre parcours
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            La bibliothèque éditoriale complète est en préparation. Cette page présente uniquement les ressources et parcours déjà disponibles dans MAKOKI, sans faux articles, chiffres d’audience ou coordonnées provisoires.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="flex h-full flex-col border-slate-200 shadow-sm">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <resource.icon className="h-6 w-6" />
                </span>
                <CardTitle className="mt-3">{resource.title}</CardTitle>
                <CardDescription className="text-base leading-7">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={resource.path}>{resource.action}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-950">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><BookOpenCheck className="h-5 w-5" />Notre engagement</h2>
          <p className="mt-3 leading-7">
            Nos contenus s’appuient sur des sources vérifiées et distinguent clairement les faits des conseils généraux. Nous ne présentons jamais une information non vérifiée comme officielle.
          </p>
        </section>
      </div>
    </main>
  );
}
