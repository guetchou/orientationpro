import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle2, FileText, Loader2, Route, ShieldCheck } from 'lucide-react';
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
  'Ce qui t’intéresse',
  'Tes compétences et ta situation',
  'Les métiers à explorer',
  'Ton choix et tes prochaines actions',
  'Ton plan personnel',
];

const RiasecProfileSummary = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const leading = topRiasecDimensions(profile);
  return (
    <Card className="border-primary/20 print:hidden" data-testid="unified-riasec-summary">
      <CardHeader>
        <Badge className="w-fit">Tes centres d’intérêt</Badge>
        <CardTitle className="flex items-center gap-2 text-xl"><Brain className="h-5 w-5" />Ce qui ressort de tes réponses</CardTitle>
        <CardDescription>
          Voici les types d’activités et d’environnements qui semblent le plus te correspondre aujourd’hui.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {leading.map((entry) => (
            <div key={entry.dimension} className="rounded-lg border bg-muted/30 p-4">
              <p className="font-semibold">{riasecDimensionLabels[entry.dimension]}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Une piste utile pour mieux comprendre les activités qui peuvent te motiver.
              </p>
            </div>
          ))}
        </div>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Ce résultat décrit tes préférences actuelles. Il ne décide pas à ta place et ne mesure ni ton intelligence ni tes capacités.
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
          <Badge className="w-fit">Des pistes pour avancer</Badge>
          <CardTitle>Des métiers à explorer</CardTitle>
          <CardDescription>
            Voici quelques familles de métiers qui correspondent à tes réponses. Elles constituent un point de départ. Tes compétences, ton niveau d’études, ta situation et tes contraintes permettront ensuite d’affiner ton projet.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {families.map((family) => (
            <div key={family.dimension} className="rounded-lg border bg-background p-4">
              <Badge variant="outline">Piste à explorer</Badge>
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
  const { user, loading: authLoading } = useAuth();
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
          <Badge variant="outline">Mon parcours</Badge>
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight md:text-4xl">
            <Route className="h-8 w-8 text-primary" />Construis ton projet d’avenir
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Réponds à quelques questions pour mieux comprendre ce qui t’intéresse, découvrir des métiers et avancer vers un projet adapté à ta situation.
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
        {authLoading ? (
          <Card className="print:hidden">
            <CardContent className="flex min-h-44 items-center justify-center p-8" role="status">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
              Préparation de ton parcours…
            </CardContent>
          </Card>
        ) : (
          <EmbeddedRiasecStep onComplete={handleRiasecComplete} />
        )}

        {!authLoading && riasecProfile ? (
          <>
            <section aria-labelledby="unified-profile-title">
              <h2 id="unified-profile-title" className="sr-only">Tes centres d’intérêt</h2>
              <RiasecProfileSummary profile={riasecProfile} />
            </section>
            <GuestValue profile={riasecProfile} />
            <div id="life-project-continuation" />
            {user ? (
              <>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-950 print:hidden">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Ton résultat est enregistré. Tu peux maintenant compléter ta situation et poursuivre ton projet.
                </div>
                <section aria-label="Suite de ton parcours">
                  <LifeProjectWorkspace riasecProfile={riasecProfile} />
                </section>
              </>
            ) : (
              <Card className="border-primary/30 print:hidden">
                <CardHeader>
                  <Badge className="w-fit" variant="outline">Poursuis ton projet</Badge>
                  <CardTitle>Crée ton espace pour aller plus loin</CardTitle>
                  <CardDescription>
                    En créant ton espace, tu peux conserver ton résultat, préciser ta situation, comparer plusieurs pistes et construire un plan d’action personnel.
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
                    <Link to="/careers">Explorer les métiers</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : !authLoading ? (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />Commence ton parcours</CardTitle>
              <CardDescription>
                Réponds aux affirmations pour mieux comprendre tes centres d’intérêt et découvrir tes premières pistes de métiers.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
