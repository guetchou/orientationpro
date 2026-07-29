import { useEffect, useMemo, useState } from 'react';
import { Check, Lightbulb, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  decideProfileHypothesis,
  generateProfileHypotheses,
  getAdaptiveProfile,
  type AdaptiveProfilePayload,
  type HypothesisValue,
  type ProfileHypothesis,
} from './profileApi';

const valueOf = (hypothesis: ProfileHypothesis) => (
  hypothesis.value_json && typeof hypothesis.value_json === 'object'
    ? hypothesis.value_json as HypothesisValue
    : {}
);

export default function ProfileHypothesisPanel() {
  const [payload, setPayload] = useState<AdaptiveProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    void getAdaptiveProfile()
      .then(setPayload)
      .catch(() => toast.error('Impossible de charger les suggestions du profil.'))
      .finally(() => setLoading(false));
  }, []);

  const proposed = useMemo(
    () => (payload?.hypotheses || []).filter((item) => item.status === 'proposed'),
    [payload?.hypotheses],
  );

  const generate = async () => {
    setGenerating(true);
    try {
      const next = await generateProfileHypotheses();
      setPayload(next);
      const created = next.hypothesisGeneration?.createdCount || 0;
      toast.success(created ? `${created} suggestion${created > 1 ? 's' : ''} créée${created > 1 ? 's' : ''}.` : 'Suggestions déjà à jour.');
    } catch {
      toast.error('Impossible d’analyser le profil pour le moment.');
    } finally {
      setGenerating(false);
    }
  };

  const decide = async (hypothesisId: string, status: 'confirmed' | 'rejected') => {
    setDeciding(hypothesisId);
    try {
      setPayload(await decideProfileHypothesis(hypothesisId, status));
      toast.success(status === 'confirmed' ? 'Suggestion confirmée.' : 'Suggestion rejetée.');
    } catch {
      toast.error('Impossible d’enregistrer cette décision.');
    } finally {
      setDeciding(null);
    }
  };

  if (loading) return <Card><CardContent className="flex items-center gap-2 py-6 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des suggestions…</CardContent></Card>;

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-600" /> Hypothèses à examiner</CardTitle>
            <CardDescription className="mt-2 max-w-3xl">Le système propose des questions à partir des données du profil. Rien n’est confirmé automatiquement : vous gardez la décision finale.</CardDescription>
          </div>
          <Button type="button" onClick={() => void generate()} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Analyser mon profil
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {payload?.hypothesisGeneration ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{payload.hypothesisGeneration.generatorVersion}</Badge>
            <Badge variant="outline">{payload.hypothesisGeneration.createdCount} créée(s)</Badge>
            <Badge variant="outline">{payload.hypothesisGeneration.preservedDecisionCount} décision(s) conservée(s)</Badge>
          </div>
        ) : null}
        {proposed.length === 0 ? <p className="text-sm text-slate-600">Aucune suggestion en attente. Lancez une analyse après avoir mis à jour votre profil.</p> : null}
        {proposed.map((hypothesis) => {
          const value = valueOf(hypothesis);
          return (
            <div key={hypothesis.id} className="rounded-xl border border-amber-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{value.title || 'Suggestion à examiner'}</p>
                  <p className="mt-1 text-sm text-slate-800">{value.question || hypothesis.rationale}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{hypothesis.rationale}</p>
                  {hypothesis.confidence !== null ? <p className="mt-2 text-xs text-slate-500">Confiance technique : {Math.round(hypothesis.confidence * 100)} %</p> : null}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" type="button" onClick={() => void decide(hypothesis.id, 'confirmed')} disabled={deciding === hypothesis.id}><Check className="mr-1 h-4 w-4" /> Confirmer</Button>
                  <Button size="sm" type="button" variant="outline" onClick={() => void decide(hypothesis.id, 'rejected')} disabled={deciding === hypothesis.id}><X className="mr-1 h-4 w-4" /> Rejeter</Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
