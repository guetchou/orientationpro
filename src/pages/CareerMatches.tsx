import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, BriefcaseBusiness, Loader2, Search, UserRoundCog } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { dominantDimensions } from '@/lib/careerPresentation';
import { getProfileCareerRecommendations } from '@/services/careerApi';
import type { CareerProfileRecommendationResponse } from '@/types/career';
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

export default function CareerMatches() {
  const { resultId } = useParams<{ resultId: string }>();
  const [data, setData] = useState<CareerProfileRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center"><Loader2 className="mr-3 h-8 w-8 animate-spin text-emerald-700" /><p className="text-slate-600">Classement contextualisé des métiers en cours…</p></main>;
  if (error || !data || !resultId) return <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16"><Card className="border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" /> Classement indisponible</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/orientation/results">Retour aux résultats</Link></Button></CardContent></Card></main>;

  const dominant = dominantDimensions(data.result.normalizedScores);
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-10">
      <div className="mx-auto min-w-0 max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost"><Link to={`/orientation/results/${encodeURIComponent(resultId)}`}><ArrowLeft className="mr-2 h-4 w-4" />Retour au résultat</Link></Button><Button asChild variant="outline"><Link to="/careers"><Search className="mr-2 h-4 w-4" />Catalogue métiers</Link></Button></div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2"><Badge>Profil {data.result.displayCode}</Badge><Badge variant="outline">{data.matching.eligibleOccupationCount} métiers classables</Badge><Badge variant="outline">{data.matching.translatedOccupationCount} fiches françaises</Badge></div>
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
