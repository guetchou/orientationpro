import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmbeddedRiasecStep from './EmbeddedRiasecStep';
import LifeProjectWorkspace from './LifeProjectWorkspace';
import LifeProjectCompletionPanel from './LifeProjectCompletionPanel';
import type { AdvisorRiasecProfile } from './advisor-types';
import { guestCareerFamilies } from './guest-career-families';
import {
  riasecDimensionLabels,
  topRiasecDimensions,
} from './riasec-profile';

const journeySteps = [
  'Ce qui t’intéresse',
  'Ta situation',
  'Tes possibilités',
  'Les pistes à comparer',
  'Ta prochaine action',
];

const RiasecProfileSummary = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const leading = topRiasecDimensions(profile);
  return (
    <Card className="border-primary/20 print:hidden" data-testid="unified-riasec-summary">
      <CardHeader>
        <Badge className="w-fit">Tes centres d’intérêt</Badge>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-5 w-5" />Ce qui ressort de tes réponses
        </CardTitle>
        <CardDescription>
          Voici les activités et les environnements qui semblent le plus te correspondre aujourd’hui.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {leading.map((entry) => (
            <div key={entry.dimension} className="rounded-lg border bg-muted/30 p-4">
              <p className="font-semibold">{riasecDimensionLabels[entry.dimension]}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cette tendance aide à repérer les activités qui peuvent te donner envie de t’investir.
              </p>
            </div>
          ))}
        </div>
        <p className="flex gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Ce résultat décrit tes préférences actuelles. Il ne mesure ni ton intelligence ni tes capacités, et il ne décide pas à ta place.
        </p>
      </CardContent>
    </Card>
  );
};

const GuestPreview = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const primary = topRiasecDimensions(profile)[0];
  if (!primary) return null;

  return (
    <section className="space-y-5 print:hidden" data-testid="guest-life-project-soft-gate">
      <Card className="border-primary/20">
        <CardHeader>
          <Badge className="w-fit">Aperçu de ton résultat</Badge>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5" />Une première tendance se dégage
          </CardTitle>
          <CardDescription>
            Tes réponses montrent notamment un intérêt pour les activités liées à{' '}
            <strong className="text-foreground">{riasecDimensionLabels[primary.dimension]}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            C’est un premier indice, pas une conclusion. La suite prendra aussi en compte tes autres tendances, ta situation et tes contraintes.
          </p>
          <div className="grid gap-3 sm:grid-cols-3" aria-label="Contenu disponible après connexion">
            {[
              'Tes autres tendances',
              'Les familles de métiers à explorer',
              'Tes prochaines actions personnelles',
            ].map((label) => (
              <div key={label} className="flex min-h-24 items-center gap-3 rounded-lg border bg-muted/30 p-4">
                <LockKeyhole className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const FullCareerValue = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const families = useMemo(() => guestCareerFamilies(profile), [profile]);
  return (
    <section className="space-y-5 print:hidden" data-testid="authenticated-career-value">
      <Card className="border-emerald-200 bg-emerald-50/60">
        <CardHeader>
          <Badge className="w-fit">Des pistes pour avancer</Badge>
          <CardTitle>Des familles de métiers à explorer</CardTitle>
          <CardDescription>
            Ces pistes sont un point de départ. Ta situation, tes études, tes compétences et tes contraintes permettront de les préciser.
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
                  Explorer les métiers <ArrowRight className="ml-2 h-4 w-4" />
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
            Commence par 60 affirmations sur ce qui t’intéresse. Tu ajouteras ensuite quelques informations sur ta situation pour comparer des pistes adaptées.
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
            <div id="life-project-continuation" />
            {user ? (
              <>
                <section aria-labelledby="unified-profile-title">
                  <h2 id="unified-profile-title" className="sr-only">Tes centres d’intérêt</h2>
                  <RiasecProfileSummary profile={riasecProfile} />
                </section>
                <FullCareerValue profile={riasecProfile} />
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-950 print:hidden">
                  <CheckCircle2 className="mr-2 inline h-4 w-4" />
                  Ton résultat est enregistré. Complète maintenant ta situation en quatre petites étapes.
                </div>
                <section aria-label="Suite de ton parcours" className="print:hidden">
                  <LifeProjectWorkspace riasecProfile={riasecProfile} />
                </section>
                <LifeProjectCompletionPanel />
              </>
            ) : (
              <>
                <GuestPreview profile={riasecProfile} />
                <Card className="border-primary/30 print:hidden" data-testid="guest-registration-gate">
                  <CardHeader>
                    <Badge className="w-fit" variant="outline">Ton premier résultat est prêt</Badge>
                    <CardTitle>Enregistre ce résultat pour construire la suite</CardTitle>
                    <CardDescription>
                      Crée ton espace pour voir toutes tes tendances, explorer des familles de métiers et préparer un plan adapté à ta situation.
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
                  </CardContent>
                </Card>
              </>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
