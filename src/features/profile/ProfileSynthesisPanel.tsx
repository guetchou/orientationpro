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
    return 'Termine d’abord le questionnaire sur tes centres d’intérêt.';
  }
  if (error instanceof ApiError && error.code === 'PROFILE_SYNTHESIS_RECOMMENDATION_REQUIRED') {
    return 'Choisis d’abord au moins une piste de métier dans ton parcours.';
  }
  return 'Impossible de créer ta synthèse pour le moment.';
};

const cleanPublicText = (text: string) => text
  .replace(/Résultat RIASEC/giu, 'résultat de ton parcours')
  .replace(/RIASEC/giu, 'centres d’intérêt')
  .replace(/ESCO/giu, '')
  .replace(/O\*NET/giu, '')
  .replace(/\s{2,}/gu, ' ')
  .trim();

const publicHeadline = (headline: string) => (
  /RIASEC|ESCO|O\*NET|snapshot|engine|immutable/iu.test(headline)
    ? 'Voici les principaux éléments de ton profil et les pistes à explorer.'
    : headline
);

export default function ProfileSynthesisPanel() {
  const [latest, setLatest] = useState<ProfileSynthesisEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void listProfileSyntheses(1)
      .then((payload) => setLatest(payload.syntheses[0] || null))
      .catch(() => toast.error('Impossible de charger la synthèse de ton profil.'))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      const result = await createProfileSynthesis();
      setLatest(result);
      toast.success(result.created ? 'Ta synthèse a été créée.' : 'Ta synthèse est déjà à jour.');
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
              Synthèse de mon profil
            </h2>
            <CardDescription className="mt-2 max-w-3xl">
              Retrouve les éléments confirmés de ton profil, les métiers à explorer et les prochaines actions utiles.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => void create()} disabled={creating}>
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {latest ? 'Mettre à jour la synthèse' : 'Créer ma synthèse'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!latest ? (
          <p className="text-sm text-slate-600">
            Ta synthèse sera disponible après le questionnaire sur tes centres d’intérêt et le choix de premières pistes de métiers.
          </p>
        ) : (
          <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{publicHeadline(latest.synthesis.summary.headline)}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Ce qui ressort de ton profil</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {latest.synthesis.summary.strengths.length > 0
                    ? latest.synthesis.summary.strengths.map((item) => <li key={item}>{cleanPublicText(item)}</li>)
                    : <li>Aucun élément supplémentaire confirmé pour le moment.</li>}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Prochaines actions</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {latest.synthesis.summary.nextActions.map((item) => <li key={item}>{cleanPublicText(item)}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-800">Métiers à explorer</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {latest.synthesis.sources.recommendations.topMatches.map((match) => (
                  <Badge key={match.occupationId} variant="secondary">
                    {match.preferredLabel}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Cette synthèse aide à organiser ta réflexion. Elle ne décide pas à ta place et ne garantit ni admission, ni emploi, ni réussite.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
