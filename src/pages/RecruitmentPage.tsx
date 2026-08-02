import { usePageMeta } from '@/hooks/usePageMeta';
import { ArrowRight, BriefcaseBusiness, Building2, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const candidateFeatures = [
  'Consulter les offres publiées sur MAKOKI.',
  'Préparer un CV clair et adapté au poste recherché.',
  'Retrouver ses démarches d’emploi dans un espace personnel.',
];

const organizationFeatures = [
  'Présenter clairement le poste, les missions et les critères attendus.',
  'Organiser le suivi des candidatures au sein de votre équipe.',
  'Évaluer les candidats à partir de leurs compétences, de leur expérience et des exigences du poste.',
];

export default function RecruitmentPage() {
  usePageMeta({
    title: 'Recrutement',
    description: 'Découvrez les services MAKOKI pour rechercher un emploi, préparer une candidature ou mieux organiser un recrutement.',
    path: '/recruitment',
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">Emploi et recrutement</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Mieux préparer les candidatures et les recrutements
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            MAKOKI aide les candidats à découvrir des opportunités et à mieux présenter leur parcours. Les organisations peuvent également structurer leurs offres et leurs critères de sélection de manière plus claire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/jobs">Consulter les offres<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/cv-optimizer">Préparer mon CV</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><BriefcaseBusiness className="h-6 w-6" /></span>
              <CardTitle className="mt-3">Pour les candidats</CardTitle>
              <CardDescription>Des outils pour avancer de l’offre à la candidature.</CardDescription>
            </CardHeader>
            <CardContent><ul className="space-y-3 text-sm leading-7 text-slate-700">{candidateFeatures.map((feature) => <li key={feature}>• {feature}</li>)}</ul></CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><Building2 className="h-6 w-6" /></span>
              <CardTitle className="mt-3">Pour les organisations</CardTitle>
              <CardDescription>Des recrutements mieux structurés et plus lisibles.</CardDescription>
            </CardHeader>
            <CardContent><ul className="space-y-3 text-sm leading-7 text-slate-700">{organizationFeatures.map((feature) => <li key={feature}>• {feature}</li>)}</ul></CardContent>
          </Card>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-700" />Une candidature mieux préparée</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-slate-700">Une offre claire, un CV précis et des informations vérifiables facilitent la compréhension du parcours et la comparaison avec les besoins du poste.</CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" />Une décision professionnelle responsable</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-slate-700">La sélection doit reposer sur des critères professionnels, licites et liés au poste. La décision finale appartient toujours aux personnes responsables du recrutement.</CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
