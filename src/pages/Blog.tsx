import { usePageMeta } from '@/hooks/usePageMeta';
import { ArrowRight, BookOpenCheck, BriefcaseBusiness, Compass, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resources = [
  {
    title: 'Mieux comprendre tes centres d’intérêt',
    description: 'Identifie les activités qui t’attirent et utilise ces repères pour explorer plusieurs possibilités d’études et de métiers.',
    icon: Compass,
    path: '/parcours',
    action: 'Commencer mon projet',
  },
  {
    title: 'Explorer les métiers avec méthode',
    description: 'Compare les activités, les compétences, les formations et les conditions d’exercice avant de choisir une piste.',
    icon: BriefcaseBusiness,
    path: '/careers',
    action: 'Explorer les métiers',
  },
  {
    title: 'Préparer un CV lisible',
    description: 'Présente clairement ton parcours, tes expériences et tes compétences pour faciliter la lecture de ta candidature.',
    icon: FileText,
    path: '/cv-optimizer',
    action: 'Préparer mon CV',
  },
];

export default function Blog() {
  usePageMeta({ title: 'Ressources', description: 'Guides et ressources pour avancer dans ton orientation, tes études et ta recherche d’emploi.', path: '/blog' });
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Ressources MAKOKI</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Des repères pour construire ton parcours
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Retrouve des outils pratiques pour mieux te connaître, explorer les métiers et préparer tes prochaines étapes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="flex h-full flex-col border-slate-200 shadow-sm">
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><resource.icon className="h-6 w-6" /></span>
                <CardTitle className="mt-3">{resource.title}</CardTitle>
                <CardDescription className="text-base leading-7">{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full" asChild><Link to={resource.path}>{resource.action}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-950">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><BookOpenCheck className="h-5 w-5" />Bien utiliser ces ressources</h2>
          <p className="mt-3 leading-7">
            Utilise ces informations comme des repères, compare plusieurs possibilités et vérifie les conditions d’admission ou d’exercice auprès des établissements et organismes concernés.
          </p>
        </section>
      </div>
    </main>
  );
}
