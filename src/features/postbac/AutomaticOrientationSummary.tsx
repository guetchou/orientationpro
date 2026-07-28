import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { RiasecDimensionCode, RiasecResult } from '@/types/riasec';
import type { CareerMatchResponse } from '@/types/career';
import { getCareerMatches } from '@/services/careerApi';
import { Card, CardContent } from '@/components/ui/card';
import { InterestProfileExplanation } from './InterestProfileExplanation';
import { CareerReasonCard } from './CareerReasonCard';
import { NextSteps } from './NextSteps';
import { AdvisorCta } from './AdvisorCta';
import { isDimensionCode } from './dimensions';
import { MAX_PRIORITY_CAREERS } from './config';

// Resume automatique enrichi. Il ne recalcule aucun score : il lit le resultat
// deja fourni et recupere les metiers deja classes par l'API (une seule requete,
// limit=6). L'affichage est plafonne a MAX_PRIORITY_CAREERS.
export const AutomaticOrientationSummary = ({ result }: { result: RiasecResult }) => {
  const [data, setData] = useState<CareerMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCareerMatches(result.id, {
          locale: 'en',
          limit: MAX_PRIORITY_CAREERS,
        });
        if (active) setData(response);
      } catch {
        if (active) setError('Les métiers à explorer n’ont pas pu être chargés pour le moment.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [result.id]);

  const userTopCodes = (result.ranking?.ordered ?? [])
    .map((entry) => entry.dimension)
    .filter((code): code is RiasecDimensionCode => isDimensionCode(code))
    .slice(0, 3);

  const matches = (data?.matching.matches ?? []).slice(0, MAX_PRIORITY_CAREERS);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-700" />
        <p className="text-sm font-medium text-emerald-800">Vos premières réponses automatiques</p>
      </div>

      <InterestProfileExplanation result={result} />

      <section aria-labelledby="postbac-careers-title">
        <h2 id="postbac-careers-title" className="mb-3 font-heading text-xl font-bold text-stone-900">
          Métiers à explorer
        </h2>
        {loading ? (
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-6 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" /> Chargement des métiers à explorer…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900" role="status">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-stone-600">
            Aucune piste métier n’est disponible pour ce résultat pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((match, index) => (
              <CareerReasonCard
                key={match.occupationId}
                match={match}
                userTopCodes={userTopCodes}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </section>

      <NextSteps resultId={result.id} />

      <Card className="border border-stone-200 shadow-sm">
        <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-stone-700">Besoin d’un regard humain sur ces pistes ?</p>
          <AdvisorCta />
        </CardContent>
      </Card>

      {/* Detail technique conserve en rubrique secondaire (vocabulaire RIASEC). */}
      <details className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
        <summary className="cursor-pointer font-medium text-stone-800">
          Détail technique du profil (méthode RIASEC)
        </summary>
        <div className="mt-3 space-y-1">
          <p>Code d’intérêts : <strong>{result.displayCode || result.primaryCode || '—'}</strong></p>
          <p>Version de l’algorithme : {result.algorithmVersion}</p>
          <p className="text-xs text-stone-500">
            Les scores détaillés et la méthodologie complète restent affichés dans la vue de
            résultat technique ci-dessous.
          </p>
        </div>
      </details>
    </div>
  );
};
