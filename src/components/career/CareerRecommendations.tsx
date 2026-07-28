import { useEffect, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { getCareerMatches } from '@/services/careerApi';
import type { CareerMatchResponse } from '@/types/career';
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

export function CareerRecommendations({ resultId }: CareerRecommendationsProps) {
  const [data, setData] = useState<CareerMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCareerMatches(resultId, { locale: 'fr', limit: 6 });
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
                <BriefcaseBusiness className="h-5 w-5 shrink-0" /> Métiers correspondant à ton profil
              </CardTitle>
              <CardDescription className="mt-2 max-w-3xl leading-relaxed">
                Classement calculé avec les profils RIASEC O*NET. Les libellés, descriptions et compétences sont servis en français depuis ESCO lorsqu’un rapprochement officiel ou revu est disponible.
              </CardDescription>
            </div>
            <Button asChild variant="outline"><Link to="/careers"><Search className="mr-2 h-4 w-4" />Explorer le catalogue</Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-44 items-center justify-center text-slate-600"><Loader2 className="mr-3 h-6 w-6 animate-spin text-emerald-700" />Calcul des correspondances…</div>
          ) : error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><p className="flex items-center gap-2 font-medium"><AlertCircle className="h-5 w-5" />Recommandations indisponibles</p><p className="mt-2 text-sm leading-relaxed">{error}</p></div>
          ) : data && data.matching.matches.length > 0 ? (
            <div className="space-y-5">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
                <strong>{data.matching.eligibleOccupationCount}</strong> métiers disposent d’un profil RIASEC traçable. <strong>{data.matching.translatedOccupationCount}</strong> fiches ont un contenu français disponible ; les autres signalent explicitement le repli anglais.
              </div>
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
