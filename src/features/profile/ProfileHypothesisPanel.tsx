import { useEffect, useMemo, useState } from 'react';
import { Check, Lightbulb, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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

const publicSuggestionText = (text: string | undefined, fallback: string) => {
  if (!text) return fallback;
  return text
    .replace(/Ajouter des compétences ESCO/giu, 'Ajouter des compétences')
    .replace(/compétences ESCO/giu, 'compétences')
    .replace(/Préciser votre mobilité/giu, 'Où souhaites-tu étudier ou travailler ?')
    .replace(/Préciser ton objectif principal/giu, 'Quel est ton objectif aujourd’hui ?')
    .replace(/Préciser votre objectif principal/giu, 'Quel est ton objectif aujourd’hui ?')
    .replace(/ESCO/giu, '')
    .replace(/\s{2,}/gu, ' ')
    .trim();
};

export default function ProfileHypothesisPanel() {
  const [payload, setPayload] = useState<AdaptiveProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    void getAdaptiveProfile()
      .then(setPayload)
      .catch(() => toast.error('Impossible de charger les suggestions de ton profil.'))
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
      toast.success(created
        ? `${created} nouvelle${created > 1 ? 's' : ''} suggestion${created > 1 ? 's' : ''} à examiner.`
        : 'Tes suggestions sont déjà à jour.');
    } catch {
      toast.error('Impossible de mettre à jour les suggestions pour le moment.');
    } finally {
      setGenerating(false);
    }
  };

  const decide = async (hypothesisId: string, status: 'confirmed' | 'rejected') => {
    setDeciding(hypothesisId);
    try {
      setPayload(await decideProfileHypothesis(hypothesisId, status));
      toast.success(status === 'confirmed' ? 'Suggestion confirmée.' : 'Suggestion écartée.');
    } catch {
      toast.error('Impossible d’enregistrer ton choix.');
    } finally {
      setDeciding(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des suggestions…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <Lightbulb className="h-5 w-5 text-amber-600" /> Suggestions à confirmer
            </h2>
            <CardDescription className="mt-2 max-w-3xl">
              Makoki peut te proposer des informations à vérifier pour mieux personnaliser ton parcours. Confirme seulement ce qui est juste pour toi.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => void generate()} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Mettre à jour les suggestions
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposed.length > 0 ? (
          <Badge variant="outline">
            {proposed.length} suggestion{proposed.length > 1 ? 's' : ''} à examiner
          </Badge>
        ) : null}

        {proposed.length === 0 ? (
          <p className="text-sm text-slate-600">
            Aucune suggestion en attente. Complète ton profil puis actualise les suggestions lorsque tu le souhaites.
          </p>
        ) : null}

        {proposed.map((hypothesis) => {
          const value = valueOf(hypothesis);
          const title = publicSuggestionText(value.title, 'Suggestion à examiner');
          const question = publicSuggestionText(value.question || hypothesis.rationale, 'Cette information te correspond-elle ?');
          const rationale = value.question && hypothesis.rationale
            ? publicSuggestionText(hypothesis.rationale, '')
            : '';

          return (
            <div key={hypothesis.id} className="rounded-xl border border-amber-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-800">{question}</p>
                  {rationale ? (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{rationale}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => void decide(hypothesis.id, 'confirmed')}
                    disabled={deciding === hypothesis.id}
                  >
                    <Check className="mr-1 h-4 w-4" /> Confirmer
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => void decide(hypothesis.id, 'rejected')}
                    disabled={deciding === hypothesis.id}
                  >
                    <X className="mr-1 h-4 w-4" /> Écarter
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
