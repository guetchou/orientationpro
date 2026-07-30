import { useEffect, useState } from 'react';
import { FileCheck2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  createProfileSynthesis,
  listProfileSyntheses,
  type ProfileSynthesisEnvelope,
} from './profileSynthesisApi';

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.code === 'PROFILE_SYNTHESIS_RIASEC_REQUIRED') {
    return 'Terminez d’abord un parcours RIASEC.';
  }
  if (error instanceof ApiError && error.code === 'PROFILE_SYNTHESIS_RECOMMENDATION_REQUIRED') {
    return 'Figez d’abord un classement dans les recommandations métiers.';
  }
  return 'Impossible de créer la synthèse pour le moment.';
};

export default function ProfileSynthesisPanel() {
  const [latest, setLatest] = useState<ProfileSynthesisEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void listProfileSyntheses(1)
      .then((payload) => setLatest(payload.syntheses[0] || null))
      .catch(() => toast.error('Impossible de charger les synthèses du profil.'))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      const result = await createProfileSynthesis();
      setLatest(result);
      toast.success(result.created ? 'Nouvelle synthèse versionnée créée.' : 'La synthèse est déjà à jour.');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement de la synthèse…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200 bg-emerald-50/40">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
              <FileCheck2 className="h-5 w-5 text-emerald-700" />
              Synthèse versionnée du profil
            </h2>
            <CardDescription className="mt-2 max-w-3xl">
              Cette synthèse fige le profil confirmé, le Résultat RIASEC v2, les décisions sur les hypothèses et un classement métiers déjà figé.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => void create()} disabled={creating}>
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {latest ? 'Actualiser la synthèse' : 'Créer la synthèse'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latest ? (
          <p className="text-sm text-slate-600">
            Aucune synthèse figée. Un Résultat RIASEC et un snapshot de recommandations sont nécessaires.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{latest.snapshot.schemaVersion}</Badge>
              <Badge variant="outline">{latest.snapshot.engineVersion}</Badge>
              <Badge variant="outline">immutable</Badge>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-4">
              <p className="font-semibold text-slate-900">{latest.synthesis.summary.headline}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Signaux confirmés</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {latest.synthesis.summary.strengths.length > 0
                      ? latest.synthesis.summary.strengths.map((item) => <li key={item}>{item}</li>)
                      : <li>Aucun signal supplémentaire confirmé.</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Prochaines actions</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {latest.synthesis.summary.nextActions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-800">Pistes métiers figées</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {latest.synthesis.sources.recommendations.topMatches.map((match) => (
                    <Badge key={match.occupationId} variant="secondary">
                      {match.preferredLabel} · {Math.round(match.recommendationScore)} %
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                {latest.synthesis.limitations[0]}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
