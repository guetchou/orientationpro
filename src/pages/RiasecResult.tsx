import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  History,
  Loader2,
  RefreshCcw,
  Scale,
} from 'lucide-react';
import { ApiError } from '@/lib/apiClient';
import { getRiasecResult } from '@/services/riasecApi';
import type { RiasecDimensionCode, RiasecResult as RiasecResultModel } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CareerRecommendations } from '@/components/career/CareerRecommendations';
import { isPostBacEnabled } from '@/features/postbac/config';
import { AutomaticOrientationSummary } from '@/features/postbac/AutomaticOrientationSummary';

const ORDER: RiasecDimensionCode[] = ['R', 'I', 'A', 'S', 'E', 'C'];

const fallbackNames: Record<RiasecDimensionCode, string> = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'ORIENTATION_RESULT_NOT_FOUND') {
      return 'Ce résultat d’orientation est introuvable ou n’appartient pas à ton compte.';
    }
    return error.message;
  }
  return 'Le résultat n’a pas pu être chargé.';
};

const formatDate = (value?: string) => {
  if (!value) return 'Date indisponible';
  return new Intl.DateTimeFormat('fr-CG', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function RiasecResult() {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<RiasecResultModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!resultId) {
        setError('Identifiant de résultat manquant.');
        setLoading(false);
        return;
      }
      try {
        const loaded = await getRiasecResult(resultId);
        if (active) setResult(loaded);
      } catch (caught) {
        if (active) setError(errorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [resultId]);

  const orderedScores = useMemo(() => {
    if (!result) return [];
    return result.ranking?.ordered?.length
      ? result.ranking.ordered
      : ORDER.map((dimension) => ({
          dimension,
          score: result.scores[dimension]?.normalized || 0,
        })).sort((left, right) => right.score - left.score);
  }, [result]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-stone-50">
        <h1 className="sr-only">Résultat d’orientation</h1>
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-emerald-700" />
          <p className="text-stone-600">Chargement du résultat d’orientation…</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16">
        <h1 className="sr-only">Résultat d’orientation</h1>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" /> Résultat indisponible
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link to="/orientation/results">Voir mon historique</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const dimensions = result.snapshot?.dimensions || ({} as RiasecResultModel['snapshot']['dimensions']);
  const code = result.displayCode || result.primaryCode || 'Profil à égalités';

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:py-10">
      <h1 className="sr-only">Résultat d’orientation</h1>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="text-stone-600 hover:text-stone-900">
            <Link to="/orientation/results"><ArrowLeft className="mr-2 h-4 w-4" />Historique</Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/careers"><BriefcaseBusiness className="mr-2 h-4 w-4" />Catalogue métiers</Link>
            </Button>
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
              <Link to="/tests/riasec"><RefreshCcw className="mr-2 h-4 w-4" />Nouvelle passation</Link>
            </Button>
          </div>
        </div>

        {/* En-tête du profil */}
        <Card className="overflow-hidden border border-stone-200 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-700" />
          <CardHeader className="space-y-4 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-700 hover:bg-emerald-700">Résultat d’orientation</Badge>
              <Badge variant="outline">Instrument v{result.snapshot?.instrument?.version || 1}</Badge>
              <Badge variant="outline">Algorithme {result.algorithmVersion}</Badge>
            </div>
            <CardTitle className="font-heading text-3xl leading-tight sm:text-4xl">
              Profil RIASEC : <span className="text-emerald-700">{code}</span>
            </CardTitle>
            <CardDescription className="text-base text-stone-600">
              Généré le {formatDate(result.createdAt)}. Les scores décrivent des intérêts
              professionnels, pas un niveau d’intelligence ni une aptitude garantie.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 pt-0 sm:p-8 sm:pt-0 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 md:col-span-2">
              <p className="text-sm font-medium text-emerald-800">Lecture du code</p>
              {result.ranking?.hasLeadingTie || !result.primaryCode ? (
                <p className="mt-2 leading-relaxed text-emerald-950">
                  Les premiers scores comportent une égalité. MAKOKI affiche donc <strong>{code}</strong> sans
                  imposer artificiellement un code Holland à trois lettres.
                </p>
              ) : (
                <p className="mt-2 leading-relaxed text-emerald-950">
                  Le code principal <strong>{result.primaryCode}</strong> reprend les trois dimensions les
                  mieux classées, dans l’ordre observé.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-800">Différenciation descriptive</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{result.differentiation.range}<span className="ml-1 text-base font-medium text-amber-700">pts</span></p>
              <p className="mt-1 text-sm text-amber-800">Écart entre le score le plus élevé et le plus faible.</p>
            </div>
          </CardContent>
        </Card>

        {isPostBacEnabled() ? (
          <AutomaticOrientationSummary result={result} />
        ) : null}

        {/* Scores par dimension */}
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl">
              <BarChart3 className="h-5 w-5 text-emerald-700" />Scores RIASEC
            </CardTitle>
            <CardDescription className="text-stone-500">
              Échelle descriptive normalisée de 0 à 100. Les trois dimensions de tête composent ton code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderedScores.map(({ dimension, score }, index) => {
              const description = dimensions[dimension];
              const isTop = index < 3;
              const clamped = Math.max(0, Math.min(score, 100));
              return (
                <div
                  key={dimension}
                  className={`rounded-xl border p-4 sm:p-5 ${
                    isTop ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            isTop ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {dimension}
                        </span>
                        <h3 className="font-semibold text-stone-900">
                          {description?.name || fallbackNames[dimension]}
                        </h3>
                        {isTop && <Badge variant="outline" className="border-emerald-300 text-emerald-700">Top {index + 1}</Badge>}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">
                        {description?.summary || 'Description de la dimension indisponible.'}
                      </p>
                    </div>
                    <div className={`shrink-0 text-2xl font-bold ${isTop ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {score}
                    </div>
                  </div>
                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-stone-200"
                    role="progressbar"
                    aria-valuenow={clamped}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${description?.name || fallbackNames[dimension]} : ${score} sur 100`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${isTop ? 'bg-emerald-700' : 'bg-stone-400'}`}
                      style={{ width: `${clamped}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <CareerRecommendations resultId={result.id} />

        {/* Indicateurs et méthode */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="min-w-0 border border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Scale className="h-5 w-5 text-emerald-700" />Indicateurs descriptifs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-600">Complétion</span><strong className="text-stone-900">{result.responsePattern.completionRate}%</strong></div>
              <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-600">Réponse la plus répétée</span><strong className="text-stone-900">{result.responsePattern.sameAnswerRatio}%</strong></div>
              <div className="flex justify-between border-b border-stone-100 pb-2"><span className="text-stone-600">Écart-type des réponses</span><strong className="text-stone-900">{result.responsePattern.responseStandardDeviation}</strong></div>
              <div className="flex justify-between"><span className="text-stone-600">Écart-type des scores</span><strong className="text-stone-900">{result.differentiation.standardDeviation}</strong></div>
              <p className="pt-2 text-xs leading-relaxed text-stone-500">
                Ces valeurs décrivent la passation. Elles ne constituent ni un score de confiance, ni une
                mesure de validité psychométrique.
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0 border border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <BookOpen className="h-5 w-5 text-emerald-700" />Méthode et limites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-stone-700">
              <p>{result.snapshot?.instrument?.methodology}</p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                {result.snapshot?.instrument?.disclaimer}
              </div>
              <p className="break-all text-xs text-stone-400">
                Référence technique : {result.snapshot?.instrument?.contentHash || 'empreinte indisponible'}.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link to="/tests/riasec"><RefreshCcw className="mr-2 h-4 w-4" />Refaire le test</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/orientation/results"><History className="mr-2 h-4 w-4" />Tous mes résultats</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
