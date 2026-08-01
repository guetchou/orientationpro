import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle2, FileText, Route, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmbeddedRiasecStep from './EmbeddedRiasecStep';
import LifeProjectWorkspace from './LifeProjectWorkspace';
import type { AdvisorRiasecProfile } from './advisor-types';
import { guestCareerFamilies } from './guest-career-families';
import {
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
    <Card className="border-primary/20 print:hidden" data-testid="unified-riasec-summary">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Profil RIASEC intégré</Badge>
          <Badge variant="outline">Code {profile.displayCode}</Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-xl"><Brain className="h-5 w-5" />Tes intérêts dominants</CardTitle>
        <CardDescription>
          Cette première restitution est visible sans compte. Elle décrit tes préférences actuelles et sert de point de départ à l’exploration.
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

const GuestValue = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const families = useMemo(() => guestCareerFamilies(profile), [profile]);
  return (
    <section className="space-y-5 print:hidden" data-testid="guest-life-project-soft-gate">
      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardHeader>
          <Badge className="w-fit">Première valeur obtenue</Badge>
          <CardTitle>Des familles de métiers à explorer maintenant</CardTitle>
          <CardDescription>
            Ces pistes découlent uniquement de tes intérêts dominants. Elles ne tiennent pas encore compte de ton niveau, de tes compétences, de ta ville, de ton budget ou de tes contraintes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {families.map((family) => (
            <div key={family.dimension} className="rounded-lg border bg-background p-4">
              <Badge variant="outline">{family.dimension}</Badge>
              <h3 className="mt-3 font-semibold">{family.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Exemples : {family.examples.join(', ')}.</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to={`/careers?q=${encodeURIComponent(family.searchQuery)}`}>
                  Explorer ces métiers <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default function UnifiedLifeProjectPage() {
  const [riasecProfile, setRiasecProfile] = useState<AdvisorRiasecProfile | null>(null);
  const { user } = useAuth();
  const location = useLocation();
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
            Commence sans compte. Découvre d’abord ton profil d’intérêts et des familles de métiers, puis crée ton espace uniquement pour sauvegarder, personnaliser et obtenir le rapport complet.
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
            <GuestValue profile={riasecProfile} />
            <div id="life-project-continuation" />
            {user ? (
              <>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-950 print:hidden">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Ton profil est rattaché à ton espace. Complète maintenant ta situation : il sera enregistré avec ce dossier et utilisé dans les recommandations.
                </div>
                <section aria-label="Suite du parcours Projet de vie">
                  <LifeProjectWorkspace riasecProfile={riasecProfile} />
                </section>
              </>
            ) : (
              <Card className="border-primary/30 print:hidden">
                <CardHeader>
                  <Badge className="w-fit" variant="outline">Ton résultat reste visible</Badge>
                  <CardTitle>Crée ton espace pour aller plus loin</CardTitle>
                  <CardDescription>
                    Le compte permet de ne pas perdre ce travail, d’ajouter ta situation réelle, de comparer des scénarios, de retenir une piste, de construire une première action et d’obtenir le rapport Projet de vie complet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/register" state={{ from: location }}>
                      Créer mon espace <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login" state={{ from: location }}>J’ai déjà un compte</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/careers">Continuer à explorer sans compte</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />Commence sans inscription</CardTitle>
              <CardDescription>
                Termine le RIASEC pour voir ton profil et tes premières familles de métiers. Le formulaire détaillé et le rapport complet seront proposés ensuite, lorsque leur valeur sera claire.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}