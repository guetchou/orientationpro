import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, BookOpen, Languages, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { localRelevanceLabel } from '@/lib/careerPresentation';
import { getCareerOccupation } from '@/services/careerApi';
import type { CareerOccupation } from '@/types/career';
import type { RiasecDimensionCode } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DIMENSIONS: Array<{ code: RiasecDimensionCode; label: string }> = [
  { code: 'R', label: 'Activités concrètes et pratiques' },
  { code: 'I', label: 'Analyse, recherche et résolution de problèmes' },
  { code: 'A', label: 'Création et expression' },
  { code: 'S', label: 'Aide, écoute et transmission' },
  { code: 'E', label: 'Initiative, influence et organisation' },
  { code: 'C', label: 'Méthode, précision et gestion de l’information' },
];

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'OCCUPATION_NOT_FOUND') return 'Ce métier est introuvable dans le catalogue.';
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
        setError('Cette fiche métier est introuvable.');
        setLoading(false);
        return;
      }
      try {
        const loaded = await getCareerOccupation(occupationId, 'fr');
        if (active) setOccupation(loaded);
      } catch (caught) {
        if (active) setError(errorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [occupationId]);

  const interestAreas = useMemo(() => {
    if (!occupation) return [];
    return DIMENSIONS
      .map(({ code, label }) => ({ code, label, score: occupation.riasec[code] }))
      .filter((entry): entry is { code: RiasecDimensionCode; label: string; score: number } => typeof entry.score === 'number')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [occupation]);

  if (loading) {
    return <main className="flex min-h-[70vh] items-center justify-center"><h1 className="sr-only">Fiche métier</h1><Loader2 className="mr-3 h-8 w-8 animate-spin text-emerald-700" /><p className="text-slate-600">Chargement de la fiche métier…</p></main>;
  }

  if (error || !occupation) {
    return <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16"><h1 className="sr-only">Fiche métier</h1><Card className="border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" /> Fiche indisponible</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/careers">Retour aux métiers</Link></Button></CardContent></Card></main>;
  }

  const fallback = occupation.translationStatus === 'unavailable';

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-10">
      <div className="mx-auto min-w-0 max-w-5xl space-y-6">
        <Button asChild variant="ghost"><Link to="/careers"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux métiers</Link></Button>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="h-2 bg-gradient-to-r from-emerald-600 to-blue-600" />
          <CardHeader className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge>Fiche métier</Badge>
              {fallback ? <Badge variant="outline">Informations disponibles en anglais</Badge> : null}
              <Badge variant="outline">{localRelevanceLabel(occupation.localRelevanceStatus)}</Badge>
            </div>
            <h1 className="break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{occupation.preferredLabel}</h1>
            <CardDescription className="break-words text-base leading-relaxed">
              {occupation.description || 'Cette fiche est encore en cours d’enrichissement.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 p-6 pt-0 md:p-8 md:pt-0">
            <Button asChild><Link to="/parcours">Voir si ce métier me correspond</Link></Button>
            <Button asChild variant="outline"><Link to="/careers">Explorer d’autres métiers</Link></Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Ce que ce métier mobilise souvent</CardTitle>
              <CardDescription>Voici les trois types d’activités qui ressortent le plus dans cette fiche. Elles servent de repères, pas de verdict.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interestAreas.length ? interestAreas.map(({ code, label }) => (
                <div key={code} className="rounded-xl border bg-white p-4">
                  <p className="font-medium text-slate-900">{label}</p>
                </div>
              )) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  Les informations sur les activités liées à ce métier sont encore en cours d’enrichissement.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>À vérifier avant de choisir</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-950"><MapPin className="mb-2 h-5 w-5" /><p className="font-medium">Présence locale</p><p className="mt-1">{localRelevanceLabel(occupation.localRelevanceStatus)}</p></div>
              {fallback ? <div className="rounded-xl bg-blue-50 p-4 text-blue-950"><Languages className="mb-2 h-5 w-5" /><p className="font-medium">Langue des informations</p><p className="mt-1">Certaines informations ne sont disponibles qu’en anglais.</p></div> : null}
              <div className="rounded-xl bg-slate-100 p-4 text-slate-900"><ShieldCheck className="mb-2 h-5 w-5" /><p className="font-medium">Formations et conditions d’exercice</p><p className="mt-1">Vérifie les diplômes, autorisations et conditions d’exercice auprès des écoles, employeurs ou organismes compétents.</p></div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Ce qu’il faut savoir pour aller plus loin</CardTitle>
            <CardDescription>Découvre les autres noms utilisés pour ce métier et les compétences qui y sont souvent associées.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Autres noms du métier</h3>
              {occupation.aliases?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {occupation.aliases.map((alias) => <li key={`${alias.locale}-${alias.label}`} className="rounded-lg border p-3">{alias.label}</li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">Aucune autre appellation disponible.</p>}
            </div>
            <div>
              <h3 className="font-semibold">Compétences souvent associées</h3>
              {occupation.skills?.length ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {occupation.skills.slice(0, 20).map((skill) => <li key={skill.id} className="rounded-lg border p-3"><strong>{skill.preferredLabel}</strong>{skill.description ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{skill.description}</p> : null}</li>)}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">Les compétences associées seront prochainement enrichies.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
