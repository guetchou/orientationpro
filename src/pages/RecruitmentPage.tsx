import { usePageMeta } from '@/hooks/usePageMeta';
import { ArrowRight, BriefcaseBusiness, Building2, FileSearch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const candidateFeatures = [
  'Consulter les offres réellement publiées par le service.',
  'Préparer et améliorer les informations de son CV.',
  'Conserver séparément ses résultats d’orientation et ses démarches d’emploi.',
];

const organizationFeatures = [
  'Structurer les offres et les critères nécessaires au poste.',
  'Suivre les candidatures dans un espace autorisé lorsque le module est activé.',
  'Évaluer les candidatures sur des critères professionnels explicites, sans déduire automatiquement une aptitude à partir d’un profil RIASEC.',
];

export default function RecruitmentPage() {
  usePageMeta({ title: "Recrutement", description: "Espace recrutement de MAKOKI : offres, candidatures et outils pour les recruteurs.", path: "/recruitment" });
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">Espace recrutement en construction progressive</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Mettre en relation les opportunités et les candidatures avec des règles claires
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            MAKOKI prépare un espace de recrutement pour publier des offres, organiser les candidatures et faciliter le suivi. Les fonctions réellement disponibles doivent rester distinguées des modules encore en phase pilote.
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
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <BriefcaseBusiness className="h-6 w-6" />
              </span>
              <CardTitle className="mt-3">Pour les candidats</CardTitle>
              <CardDescription>Des démarches d’emploi séparées des résultats d’orientation.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-7 text-slate-700">
                {candidateFeatures.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                <Building2 className="h-6 w-6" />
              </span>
              <CardTitle className="mt-3">Pour les organisations</CardTitle>
              <CardDescription>Un futur espace de gestion soumis aux permissions et à la validation des processus.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-7 text-slate-700">
                {organizationFeatures.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-amber-200 bg-amber-50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-950"><FileSearch className="h-5 w-5" />État actuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-amber-950">
              <p>La consultation des offres dépend des données disponibles dans l’API.</p>
              <p>La publication autonome, le pipeline avancé, les statistiques de recrutement et les candidatures complètes ne sont pas présentés comme opérationnels sans validation fonctionnelle.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-700" />Principe de séparation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-slate-700">
              Un score d’intérêts RIASEC ne doit pas être utilisé seul pour accepter ou refuser une candidature. Le recrutement doit reposer sur les compétences, l’expérience, les exigences du poste, des critères licites et une décision humaine responsable.
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
