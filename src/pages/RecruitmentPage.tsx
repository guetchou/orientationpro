import { usePageMeta } from '@/hooks/usePageMeta';
import { ArrowRight, BriefcaseBusiness, Building2, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceRequestCard } from '@/components/services/ServiceRequestCard';

const candidateFeatures = [
  'Consulter les offres réellement publiées sur MAKOKI.',
  'Préparer un CV clair et adapté au poste recherché.',
  'Demander une recherche d’opportunités ciblée.',
];

const organizationFeatures = [
  'Présenter clairement le poste, les missions et les critères attendus.',
  'Déposer un besoin de recrutement directement auprès de MAKOKI.',
  'Définir le périmètre, le délai et les conditions avant toute prestation.',
];

export default function RecruitmentPage() {
  usePageMeta({
    title: 'Recrutement',
    description: 'Déposez un besoin de recrutement ou préparez une candidature avec MAKOKI.',
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
            MAKOKI aide les candidats à mieux présenter leur parcours. Les organisations peuvent déposer un besoin concret de recrutement afin d’être recontactées pour préciser le poste, le délai et le niveau d’accompagnement attendu.
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

        <section className="mt-12">
          <ServiceRequestCard
            service="recrutement"
            title="Déposer un besoin de recrutement"
            description="Présente le poste, le lieu, le contrat, les compétences indispensables et la date souhaitée. L’équipe MAKOKI te recontacte pour valider le besoin et proposer un accompagnement réaliste."
            submitLabel="Déposer le besoin"
          />
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><BriefcaseBusiness className="h-6 w-6" /></span>
              <CardTitle className="mt-3">Pour les candidats</CardTitle>
              <CardDescription>Des services utilisables dès maintenant.</CardDescription>
            </CardHeader>
            <CardContent><ul className="space-y-3 text-sm leading-7 text-slate-700">{candidateFeatures.map((feature) => <li key={feature}>• {feature}</li>)}</ul></CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><Building2 className="h-6 w-6" /></span>
              <CardTitle className="mt-3">Pour les organisations</CardTitle>
              <CardDescription>Un point d’entrée concret avant toute mission.</CardDescription>
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
