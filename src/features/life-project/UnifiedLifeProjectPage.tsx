import { useCallback, useState } from 'react';
import { Brain, CheckCircle2, FileText, Route, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdvisorLifeProjectPage from './AdvisorLifeProjectPage';
import EmbeddedRiasecStep from './EmbeddedRiasecStep';
import type { AdvisorRiasecProfile } from './advisor-types';
import {
  readPersistedRiasecProfile,
  riasecDimensionLabels,
  topRiasecDimensions,
} from './riasec-profile';

const journeySteps = [
  'Profil d’intérêts RIASEC',
  'Situation, compétences et contraintes',
  'Scénarios recommandés',
  'Choix provisoire et première action',
  'Rapport unique',
];

const RiasecProfileSummary = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const leading = topRiasecDimensions(profile);
  return (
    <Card className="border-primary/20 print:break-inside-avoid" data-testid="unified-riasec-summary">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Profil RIASEC intégré</Badge>
          <Badge variant="outline">Code {profile.displayCode}</Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-xl"><Brain className="h-5 w-5" />Tes intérêts dominants</CardTitle>
        <CardDescription>
          Ce profil alimente directement le calcul des options du Projet de vie et sera inclus dans la même synthèse imprimée.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {leading.map((entry, index) => (
            <div key={entry.dimension} className="rounded-lg border bg-muted/30 p-4">
              <span className="text-xs font-medium uppercase text-muted-foreground">Dimension {index + 1}</span>
              <p className="mt-1 font-semibold">{riasecDimensionLabels[entry.dimension]} ({entry.dimension})</p>
              <p className="text-sm text-muted-foreground">Score descriptif : {Math.round(entry.score)}/100</p>
            </div>
          ))}
        </div>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Le RIASEC décrit des préférences d’activités et d’environnements. Il ne constitue ni une aptitude, ni un diagnostic, ni une décision définitive.
        </p>
        <p className="text-xs text-muted-foreground">
          Résultat {profile.resultId} · algorithme {profile.algorithmVersion} · calculé le {new Date(profile.completedAt).toLocaleString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  );
};

export default function UnifiedLifeProjectPage() {
  const [riasecProfile, setRiasecProfile] = useState<AdvisorRiasecProfile | null>(() => (
    readPersistedRiasecProfile()
  ));
  const handleRiasecComplete = useCallback((profile: AdvisorRiasecProfile) => {
    setRiasecProfile(profile);
    requestAnimationFrame(() => {
      document.getElementById('life-project-continuation')?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  return (
    <div className="min-h-screen bg-muted/20">
      <section className="border-b bg-background print:hidden">
        <div className="container max-w-7xl py-10">
          <Badge variant="outline">Parcours unique MAKOKI</Badge>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
            <Route className="h-8 w-8 text-primary" />Construis ton Projet de vie
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Un seul parcours, un seul calcul et un seul rapport : ton profil RIASEC est croisé avec ta situation réelle, tes compétences, tes contraintes et tes priorités.
          </p>
          <div className="mt-6 grid gap-2 md:grid-cols-5">
            {journeySteps.map((step, index) => (
              <div key={step} className="rounded-lg border bg-muted/30 p-3 text-sm">
                <span className="font-semibold text-primary">{index + 1}.</span> {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container max-w-7xl space-y-6 py-8">
        <EmbeddedRiasecStep onComplete={handleRiasecComplete} />

        {riasecProfile ? (
          <>
            <section aria-labelledby="unified-profile-title">
              <h2 id="unified-profile-title" className="sr-only">Profil RIASEC intégré</h2>
              <RiasecProfileSummary profile={riasecProfile} />
            </section>
            <div id="life-project-continuation" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-950 print:hidden">
              <CheckCircle2 className="mr-2 inline h-4 w-4" />
              Étape RIASEC terminée. Complète maintenant ta situation : ton profil sera enregistré avec ce dossier et utilisé dans les recommandations.
            </div>
            <section aria-label="Suite du parcours Projet de vie" className="-mx-4 sm:mx-0">
              <AdvisorLifeProjectPage />
            </section>
          </>
        ) : (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />La suite se débloque après le RIASEC</CardTitle>
              <CardDescription>
                Le formulaire de situation, les options et le rapport final appartiennent au même parcours. Aucun second test séparé n’est nécessaire.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
