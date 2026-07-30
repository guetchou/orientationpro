import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, BriefcaseBusiness, CheckCircle2, Loader2, Save, Search, UserRoundCog } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { dominantDimensions } from '@/lib/careerPresentation';
import { createCareerRecommendationSnapshot, getProfileCareerRecommendations } from '@/services/careerApi';
import type { CareerProfileRecommendationResponse, CareerRecommendationSnapshotMeta } from '@/types/career';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CareerMatchCard } from '@/components/career/CareerMatchCard';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Le classement des métiers n’a pas pu être chargé.';

const signalLabel: Record<string, string> = {
  riasec: 'Intérêts RIASEC',
  confirmed_esco_skills: 'Compétences ESCO confirmées',
  education: 'Niveau d’études',
  primary_goal: 'Objectif principal',
};

const sourceKindLabel = (kind: string) => kind.toLowerCase() === 'onet' ? 'O*NET' : kind.toUpperCase();

export default function CareerMatches() {
  const { resultId } = useParams<{ resultId: string }>();
  const [data, setData] = useState<CareerProfileRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CareerRecommendationSnapshotMeta | null>(null);
  const [snapshotBusy, setSnapshotBusy] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!resultId) { setError('Identifiant de résultat manquant.'); setLoading(false); return; }
      try {
        const response = await getProfileCareerRecommendations(resultId, { locale: 'fr', limit: 50 });
        if (active) setData(response);
      } catch (caught) {
        if (active) setError(errorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [resultId]);

  const freezeRanking = async () => {
    if (!resultId || snapshotBusy) return;
    setSnapshotBusy(true);
    setSnapshotError(null);
    try {
      const response = await createCareerRecommendationSnapshot(resultId, { locale: 'fr', limit: 50 });
      setSnapshot(response.snapshot);
    } catch (caught) {
      setSnapshotError(errorMessage(caught));
    } finally {
      setSnapshotBusy(false);
    }
  };

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center"><h1 className="sr-only">Classement des métiers</h1><Loader2 className="mr-3 h-8 w-8 animate-spin text-emerald-700" /><p className="text-slate-600">Classement contextualisé des métiers en cours…</p></main>;
  if (error || !data || !resultId) return <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16"><h1 className="sr-only">Classement des métiers</h1><Card className="border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" /> Classement indisponible</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/orientation/results">Retour aux résultats</Link></Button></CardContent></Card></main>;

  const dominant = dominantDimensions(data.result.normalizedScores);
  const sourceVersions = data.versioning.catalogSources
    .map((source) => `${sourceKindLabel(source.kind)} ${source.version || 'version inconnue'}`)
    .filter((value, index, values) => values.indexOf(value) === index);
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-10">
      <h1 className="sr-only">Classement des métiers</h1>
      <div className="mx-auto min-w-0 max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost"><Link to={`/orientation/results/${encodeURIComponent(resultId)}`}><ArrowLeft className="mr-2 h-4 w-4" />Retour au résultat</Link></Button><Button asChild variant="outline"><Link to="/careers"><Search className="mr-2 h-4 w-4" />Catalogue métiers</Link></Button></div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2"><Badge>Profil {data.result.displayCode}</Badge><Badge variant="outline">{data.matching.eligibleOccupationCount} métiers classables</Badge><Badge variant="outline">{data.matching.translatedOccupationCount} fiches françaises</Badge>{sourceVersions.map((version) => <Badge key={version} variant="outline">{version}</Badge>)}</div>
            <CardTitle className="flex items-center gap-2 text-3xl"><BriefcaseBusiness className="h-7 w-7" /> Classement expliqué des métiers</CardTitle>
            <CardDescription className="max-w-4xl text-base leading-relaxed">Le score combine les intérêts RIASEC, les compétences ESCO confirmées et un repère de préparation lorsque ces informations existent. Les pondérations dépendent de ton objectif principal et sont redistribuées lorsque des signaux manquent. Ce classement reste une aide à l’exploration, pas une décision automatique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-3">{dominant.map(({ dimension, score }) => <div key={dimension} className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-950"><span className="font-semibold">{dimension}</span> · {score}</div>)}</div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
              <p className="font-semibold">Signaux utilisés par {data.recommendationContext.algorithmVersion}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.recommendationContext.usedSignals.map((signal) => <Badge key={signal} variant="outline">{signalLabel[signal] || signal}</Badge>)}
              </div>
              <p className="mt-3 break-all text-xs text-emerald-800">Empreinte du profil : {data.versioning.profileFingerprint}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="min-w-0 text-sm text-slate-700">
                <p className="font-semibold">Instantané immutable</p>
                <p className="mt-1">Fige ce classement, ses explications et les versions ESCO/O*NET pour une relecture future identique.</p>
                {snapshot ? <p className="mt-2 flex items-center gap-2 break-all text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" /> Instantané {snapshot.id}</p> : null}
                {snapshotError ? <p className="mt-2 text-red-700">{snapshotError}</p> : null}
              </div>
              <Button type="button" onClick={() => void freezeRanking()} disabled={snapshotBusy}>
                {snapshotBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {snapshot ? 'Instantané vérifié' : 'Figer ce classement'}
              </Button>
            </div>
            {data.recommendationContext.missingSignals.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-700">
                <div><p className="font-semibold">Signaux encore manquants</p><p className="mt-1">{data.recommendationContext.missingSignals.map((signal) => signalLabel[signal] || signal).join(', ')}.</p></div>
                <Button asChild variant="outline"><Link to="/profile"><UserRoundCog className="mr-2 h-4 w-4" />Compléter le profil</Link></Button>
              </div>
            ) : null}
            <ul className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              {data.recommendationContext.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}
            </ul>
            {data.matching.fallbackOccupationCount > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">Certaines fiches sans rapprochement français fiable restent servies en anglais et portent un indicateur explicite.</div> : null}
          </CardContent>
        </Card>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">{data.matching.matches.map((match, index) => <CareerMatchCard key={match.occupationId} match={match} rank={index + 1} />)}</div>
      </div>
    </main>
  );
}
