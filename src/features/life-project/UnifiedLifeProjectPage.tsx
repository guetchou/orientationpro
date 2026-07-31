import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  LogIn,
  Route,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
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
          <Badge>Première restitution obtenue</Badge>
          <Badge variant="outline">Code {profile.displayCode}</Badge>
        </div>
        <CardTitle className="flex items-center gap-2 text-xl"><Brain className="h-5 w-5" />Tes intérêts dominants</CardTitle>
        <CardDescription>
          Ce résultat est visible sans inscription. Il décrit les activités et environnements qui t’attirent actuellement.
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

const GuestValuePanel = ({ profile }: { profile: AdvisorRiasecProfile }) => {
  const families = guestCareerFamilies(profile);
  return (
    <div className="space-y-6" data-testid="guest-life-project-soft-gate">
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">Explorer sans compte</Badge>
          <CardTitle>Des familles de métiers à découvrir maintenant</CardTitle>
          <CardDescription>
            Ces pistes découlent uniquement de tes intérêts. Elles servent à ouvrir l’exploration, pas à choisir à ta place.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {families.map((family) => (
            <div key={family.dimension} className="flex flex-col rounded-lg border bg-muted/20 p-4">
              <Badge variant="secondary" className="w-fit">{family.dimension}</Badge>
              <h3 className="mt-3 font-semibold">{family.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Exemples : {family.examples.join(', ')}.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to={`/careers?q=${encodeURIComponent(family.searchQuery)}`}>
                  <Search className="mr-2 h-4 w-4" />Explorer ces métiers
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <Badge className="w-fit">Quand le compte devient utile</Badge>
          <CardTitle>Garde ton travail et transforme-le en Projet de vie</CardTitle>
          <CardDescription className="text-base">
            Ton résultat invité est conservé temporairement sur cet appareil. Crée ton espace pour le sauvegarder durablement, ajouter ta situation réelle, obtenir des scénarios personnalisés, comparer tes options et produire ton rapport complet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Reprendre sur un autre appareil',
              'Croiser intérêts, compétences et contraintes',
              'Comparer des scénarios adaptés à ta situation',
              'Conserver ton choix et ton plan d’action',
              'Imprimer ou enregistrer le rapport unique',
              'Partager volontairement avec un conseiller',
            ].map((benefit) => (
              <p key={benefit} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{benefit}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register" state={{ from: { pathname: '/parcours' } }}>
                <UserPlus className="mr-2 h-5 w-5" />Créer mon espace
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login" state={{ from: { pathname: '/parcours' } }}>
                <LogIn className="mr-2 h-5 w-5" />J’ai déjà un compte
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/careers">Continuer à explorer sans compte<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Aucune adresse e-mail n’est nécessaire pour cette première restitution. Sans création de compte, le dossier temporaire expire automatiquement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function UnifiedLifeProjectPage() {
  const [riasecProfile, setRiasecProfile] = useState<AdvisorRiasecProfile | null>(null);
  const { user, loading: authLoading } = useAuth();
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
            Commence sans compte. Découvre d’abord ton profil RIASEC, puis crée ton espace seulement lorsque tu veux sauvegarder, personnaliser et produire ton rapport complet.
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
            <div id="life-project-continuation">
              {!authLoading && user ? (
                <>
                  <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-950 print:hidden">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    Ton profil est rattaché à ton compte. Complète maintenant ta situation pour calculer les scénarios et le rapport unique.
                  </div>
                  <section aria-label="Suite du parcours Projet de vie">
                    <LifeProjectWorkspace riasecProfile={riasecProfile} />
                  </section>
                </>
              ) : (
                <GuestValuePanel profile={riasecProfile} />
              )}
            </div>
          </>
        ) : (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5" />La suite commence par une première valeur</CardTitle>
              <CardDescription>
                Termine le profil RIASEC pour voir tes intérêts dominants et des familles de métiers. L’inscription n’est pas demandée avant cette restitution.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
