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
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-emerald-700" />
          <p className="text-gray-600">Chargement du résultat d’orientation…</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16">
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost"><Link to="/orientation/results"><ArrowLeft className="mr-2 h-4 w-4" />Historique</Link></Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/careers"><BriefcaseBusiness className="mr-2 h-4 w-4" />Catalogue métiers</Link></Button>
            <Button asChild variant="outline"><Link to="/tests/riasec"><RefreshCcw className="mr-2 h-4 w-4" />Nouvelle passation</Link></Button>
          </div>
        </div>

        <Card className="overflow-hidden border-0 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600" />
          <CardHeader className="space-y-4 p-8">
            <div className="flex flex-wrap gap-2">
              <Badge>Résultat d’orientation</Badge>
              <Badge variant="outline">Instrument v{result.snapshot?.instrument?.version || 1}</Badge>
              <Badge variant="outline">Algorithme {result.algorithmVersion}</Badge>
            </div>
            <CardTitle className="text-4xl">Profil RIASEC : {code}</CardTitle>
            <CardDescription className="text-base">
              Généré le {formatDate(result.createdAt)}. Les scores décrivent des intérêts professionnels, pas un niveau d’intelligence ni une aptitude garantie.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 p-8 pt-0 md:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-5 md:col-span-2">
              <p className="text-sm font-medium text-emerald-800">Lecture du code</p>
              {result.ranking?.hasLeadingTie || !result.primaryCode ? (
                <p className="mt-2 leading-relaxed text-emerald-950">
                  Les premiers scores comportent une égalité. MAKOKI affiche donc <strong>{code}</strong> sans imposer artificiellement un code Holland à trois lettres.
                </p>
              ) : (
                <p className="mt-2 leading-relaxed text-emerald-950">
                  Le code principal <strong>{result.primaryCode}</strong> reprend les trois dimensions les mieux classées dans l’ordre observé.
                </p>
              )}
            </div>
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-800">Différenciation descriptive</p>
              <p className="mt-2 text-2xl font-bold text-blue-950">{result.differentiation.range} points</p>
              <p className="mt-1 text-sm text-blue-900">Écart entre le score le plus élevé et le plus faible.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Scores RIASEC</CardTitle>
            <CardDescription>Échelle descriptive normalisée de 0 à 100.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {orderedScores.map(({ dimension, score }, index) => {
              const description = dimensions[dimension];
              return (
                <div key={dimension} className="rounded-xl border p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={index < 3 ? 'default' : 'outline'}>{dimension}</Badge>
                        <h3 className="font-semibold">{description?.name || fallbackNames[dimension]}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {description?.summary || 'Description de la dimension indisponible.'}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{score}</div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <CareerRecommendations resultId={result.id} />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />Indicateurs descriptifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span>Complétion</span><strong>{result.responsePattern.completionRate}%</strong></div>
              <div className="flex justify-between border-b pb-2"><span>Réponse la plus répétée</span><strong>{result.responsePattern.sameAnswerRatio}%</strong></div>
              <div className="flex justify-between border-b pb-2"><span>Écart-type des réponses</span><strong>{result.responsePattern.responseStandardDeviation}</strong></div>
              <div className="flex justify-between"><span>Écart-type des scores</span><strong>{result.differentiation.standardDeviation}</strong></div>
              <p className="pt-2 text-xs leading-relaxed text-gray-500">
                Ces valeurs décrivent la passation. Elles ne constituent ni un score de confiance, ni une mesure de validité psychométrique.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Méthode et limites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-gray-700">
              <p>{result.snapshot?.instrument?.methodology}</p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
                {result.snapshot?.instrument?.disclaimer}
              </div>
              <p className="text-xs text-gray-500">
                Référence technique : {result.snapshot?.instrument?.contentHash || 'empreinte indisponible'}.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild><Link to="/tests/riasec"><RefreshCcw className="mr-2 h-4 w-4" />Refaire le test</Link></Button>
          <Button asChild variant="outline"><Link to="/orientation/results"><History className="mr-2 h-4 w-4" />Tous mes résultats</Link></Button>
        </div>
      </div>
    </main>
  );
}
