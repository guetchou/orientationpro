import { useEffect, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Loader2, Search, UserRoundCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { getProfileCareerRecommendations } from '@/services/careerApi';
import type { CareerProfileRecommendationResponse } from '@/types/career';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CareerMatchCard } from '@/components/career/CareerMatchCard';

interface CareerRecommendationsProps { resultId: string; }

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'PERMISSION_DENIED') return 'Ton Compte ne dispose pas encore de la permission nécessaire pour consulter le catalogue métiers.';
    if (error.code === 'ORIENTATION_RESULT_NOT_FOUND') return 'Ce Résultat d’orientation ne peut pas être utilisé pour générer des recommandations.';
    return error.message;
  }
  return 'Les recommandations métiers n’ont pas pu être chargées.';
};

const signalLabel: Record<string, string> = {
  riasec: 'intérêts RIASEC',
  confirmed_esco_skills: 'compétences ESCO confirmées',
  education: 'niveau d’études',
  primary_goal: 'objectif principal',
};

export function CareerRecommendations({ resultId }: CareerRecommendationsProps) {
  const [data, setData] = useState<CareerProfileRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProfileCareerRecommendations(resultId, { locale: 'fr', limit: 6 });
        if (active) setData(response);
      } catch (caught) {
        if (active) setError(messageForError(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [resultId]);

  return (
    <section aria-labelledby="career-recommendations-title">
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle id="career-recommendations-title" className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 shrink-0" /> Métiers à explorer selon ton profil
              </CardTitle>
              <CardDescription className="mt-2 max-w-3xl leading-relaxed">
                Le classement combine la proximité RIASEC, les compétences ESCO confirmées et, lorsque c’est pertinent, un repère prudent de préparation. Chaque composante reste visible et aucune recommandation ne constitue une garantie.
              </CardDescription>
            </div>
            <Button asChild variant="outline"><Link to="/careers"><Search className="mr-2 h-4 w-4" />Explorer le catalogue</Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-44 items-center justify-center text-slate-600"><Loader2 className="mr-3 h-6 w-6 animate-spin text-emerald-700" />Calcul des recommandations contextualisées…</div>
          ) : error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><p className="flex items-center gap-2 font-medium"><AlertCircle className="h-5 w-5" />Recommandations indisponibles</p><p className="mt-2 text-sm leading-relaxed">{error}</p></div>
          ) : data && data.matching.matches.length > 0 ? (
            <div className="space-y-5">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
                <strong>Signaux utilisés :</strong>{' '}
                {data.recommendationContext.usedSignals.map((signal) => signalLabel[signal] || signal).join(', ')}.
                {' '}Le moteur a classé <strong>{data.matching.eligibleOccupationCount}</strong> métiers disposant d’un profil RIASEC traçable.
              </div>
              {data.recommendationContext.missingSignals.length > 0 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-700">
                  <p>Complète ton profil pour enrichir le classement : {data.recommendationContext.missingSignals.map((signal) => signalLabel[signal] || signal).join(', ')}.</p>
                  <Button asChild size="sm" variant="outline"><Link to="/profile"><UserRoundCog className="mr-2 h-4 w-4" />Compléter mon profil</Link></Button>
                </div>
              ) : null}
              <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {data.matching.matches.map((match, index) => <CareerMatchCard key={match.occupationId} match={match} rank={index + 1} compact />)}
              </div>
              <div className="flex justify-center"><Button asChild><Link to={`/orientation/results/${encodeURIComponent(resultId)}/careers`}>Voir le classement complet</Link></Button></div>
            </div>
          ) : <div className="rounded-xl border p-5 text-slate-600">Aucun métier classable n’est disponible pour ce résultat.</div>}
        </CardContent>
      </Card>
    </section>
  );
}
