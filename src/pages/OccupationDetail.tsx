import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BookOpen, ExternalLink, Languages, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { localRelevanceLabel, profileStatusLabel } from '@/lib/careerPresentation';
import { getCareerOccupation } from '@/services/careerApi';
import type { CareerOccupation } from '@/types/career';
import type { RiasecDimensionCode } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DIMENSIONS: Array<{ code: RiasecDimensionCode; label: string }> = [
  { code: 'R', label: 'Réaliste' },
  { code: 'I', label: 'Investigateur' },
  { code: 'A', label: 'Artistique' },
  { code: 'S', label: 'Social' },
  { code: 'E', label: 'Entreprenant' },
  { code: 'C', label: 'Conventionnel' },
];

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'OCCUPATION_NOT_FOUND') return 'Ce métier est introuvable dans le catalogue actif.';
    return error.message;
  }
  return 'La fiche métier n’a pas pu être chargée.';
};

export default function OccupationDetail() {
  const { occupationId } = useParams<{ occupationId: string }>();
  const [occupation, setOccupation] = useState<CareerOccupation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!occupationId) {
        setError('Identifiant de métier manquant.');
        setLoading(false);
        return;
      }
      try {
        const loaded = await getCareerOccupation(occupationId);
        if (active) setOccupation(loaded);
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
  }, [occupationId]);

  const availableScores = useMemo(() => {
    if (!occupation) return [];
    return DIMENSIONS
      .map(({ code, label }) => ({ code, label, score: occupation.riasec[code] }))
      .filter((entry): entry is { code: RiasecDimensionCode; label: string; score: number } => (
        typeof entry.score === 'number'
      ));
  }, [occupation]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="mr-3 h-8 w-8 animate-spin text-emerald-700" />
        <p className="text-slate-600">Chargement de la fiche métier…</p>
      </main>
    );
  }

  if (error || !occupation) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" /> Fiche indisponible
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link to="/careers">Retour au catalogue</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button asChild variant="ghost">
          <Link to="/careers"><ArrowLeft className="mr-2 h-4 w-4" />Retour au catalogue</Link>
        </Button>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="h-2 bg-gradient-to-r from-emerald-600 to-blue-600" />
          <CardHeader className="space-y-4 p-8">
            <div className="flex flex-wrap gap-2">
              <Badge>{occupation.riasecDisplayCode || 'Profil indisponible'}</Badge>
              <Badge variant="outline">{profileStatusLabel(occupation.riasecProfileStatus)}</Badge>
              <Badge variant="outline">{occupation.sourceCode}</Badge>
            </div>
            <CardTitle className="text-4xl leading-tight">{occupation.preferredLabel}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {occupation.description || 'Description indisponible dans le référentiel source.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-8 pt-0 md:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4 text-blue-950">
              <Languages className="mb-2 h-5 w-5" />
              <p className="font-medium">Langue du contenu</p>
              <p className="mt-1 text-sm">{occupation.locale === 'en' ? 'Anglais — traduction ESCO à venir' : occupation.locale}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4 text-emerald-950">
              <MapPin className="mb-2 h-5 w-5" />
              <p className="font-medium">Contexte local</p>
              <p className="mt-1 text-sm">{localRelevanceLabel(occupation.localRelevanceStatus)}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4 text-slate-900">
              <ShieldCheck className="mb-2 h-5 w-5" />
              <p className="font-medium">Traçabilité</p>
              <p className="mt-1 text-sm">Source {occupation.source.title}, version {occupation.source.version}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profil RIASEC du métier</CardTitle>
              <CardDescription>Valeurs normalisées de 0 à 100 provenant du référentiel source.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableScores.length ? availableScores.map(({ code, label, score }) => (
                <div key={code}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span><strong>{code}</strong> · {label}</span>
                    <strong>{score}</strong>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
                  </div>
                </div>
              )) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  Aucun profil RIASEC direct n’est disponible. Ce métier est consultable, mais il est exclu du classement automatique.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Données complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between gap-3 border-b pb-3"><span>Code O*NET</span><strong>{occupation.sourceCode}</strong></div>
              <div className="flex justify-between gap-3 border-b pb-3"><span>Code ISCO</span><strong>{occupation.iscoCode || 'Non renseigné'}</strong></div>
              <div className="flex justify-between gap-3 border-b pb-3"><span>Job Zone</span><strong>{occupation.jobZone || 'Non renseignée'}</strong></div>
              <div className="flex justify-between gap-3"><span>Statut local</span><strong>{localRelevanceLabel(occupation.localRelevanceStatus)}</strong></div>
              {occupation.localRelevanceNotes ? <p className="rounded-lg bg-slate-50 p-3 leading-relaxed">{occupation.localRelevanceNotes}</p> : null}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Compétences et appellations</CardTitle>
            <CardDescription>Cette section sera enrichie par ESCO et par la revue Congo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Appellations disponibles</h3>
              {occupation.aliases?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {occupation.aliases.map((alias) => <li key={`${alias.locale}-${alias.label}`} className="rounded-lg border p-3">{alias.label} <span className="text-slate-500">({alias.locale})</span></li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">Aucune appellation alternative importée pour le moment.</p>}
            </div>
            <div>
              <h3 className="font-semibold">Compétences liées</h3>
              {occupation.skills?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {occupation.skills.slice(0, 20).map((skill) => <li key={skill.id} className="rounded-lg border p-3">{skill.preferredLabel}</li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">Les compétences ESCO ne sont pas encore intégrées.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Source et licence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>{occupation.source.attribution}</p>
            <p><strong>Licence :</strong> {occupation.source.licenseName}</p>
            <Button asChild variant="outline">
              <a href={occupation.source.licenseUrl} target="_blank" rel="noreferrer">
                Consulter la licence <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
