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
  { code: 'R', label: 'Réaliste' }, { code: 'I', label: 'Investigateur' },
  { code: 'A', label: 'Artistique' }, { code: 'S', label: 'Social' },
  { code: 'E', label: 'Entreprenant' }, { code: 'C', label: 'Conventionnel' },
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
      if (!occupationId) { setError('Identifiant de métier manquant.'); setLoading(false); return; }
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

  const availableScores = useMemo(() => {
    if (!occupation) return [];
    return DIMENSIONS.map(({ code, label }) => ({ code, label, score: occupation.riasec[code] }))
      .filter((entry): entry is { code: RiasecDimensionCode; label: string; score: number } => typeof entry.score === 'number');
  }, [occupation]);

  if (loading) return <main className="flex min-h-[70vh] items-center justify-center"><h1 className="sr-only">Fiche métier</h1><Loader2 className="mr-3 h-8 w-8 animate-spin text-emerald-700" /><p className="text-slate-600">Chargement de la fiche métier…</p></main>;
  if (error || !occupation) return <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16"><h1 className="sr-only">Fiche métier</h1><Card className="border-red-200"><CardHeader><CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" /> Fiche indisponible</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent><Button asChild variant="outline"><Link to="/careers">Retour au catalogue</Link></Button></CardContent></Card></main>;

  const fallback = occupation.translationStatus === 'unavailable';
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-10">
      <h1 className="sr-only">{occupation.preferredLabel}</h1>
      <div className="mx-auto min-w-0 max-w-5xl space-y-6">
        <Button asChild variant="ghost"><Link to="/careers"><ArrowLeft className="mr-2 h-4 w-4" />Retour au catalogue</Link></Button>
        <Card className="overflow-hidden border-0 shadow-xl"><div className="h-2 bg-gradient-to-r from-emerald-600 to-blue-600" /><CardHeader className="min-w-0 space-y-4 p-6 md:p-8"><div className="flex flex-wrap gap-2"><Badge>{occupation.riasecDisplayCode || 'Profil indisponible'}</Badge><Badge variant="outline">{profileStatusLabel(occupation.riasecProfileStatus)}</Badge><Badge variant="outline">O*NET {occupation.sourceCode}</Badge>{fallback ? <Badge variant="outline"><Languages className="mr-1 h-3 w-3" />Anglais par défaut</Badge> : <Badge variant="outline">Français ESCO</Badge>}</div><CardTitle className="break-words text-3xl leading-tight md:text-4xl">{occupation.preferredLabel}</CardTitle><CardDescription className="break-words text-base leading-relaxed">{occupation.description || 'Description indisponible dans le référentiel source.'}</CardDescription></CardHeader><CardContent className="grid gap-4 p-6 pt-0 md:grid-cols-3 md:p-8 md:pt-0"><div className="rounded-xl bg-blue-50 p-4 text-blue-950"><Languages className="mb-2 h-5 w-5" /><p className="font-medium">Langue réellement servie</p><p className="mt-1 text-sm">{fallback ? 'Anglais — français indisponible' : 'Français'}</p></div><div className="rounded-xl bg-emerald-50 p-4 text-emerald-950"><MapPin className="mb-2 h-5 w-5" /><p className="font-medium">Contexte local</p><p className="mt-1 text-sm">{localRelevanceLabel(occupation.localRelevanceStatus)}</p></div><div className="rounded-xl bg-slate-100 p-4 text-slate-900"><ShieldCheck className="mb-2 h-5 w-5" /><p className="font-medium">Sources distinctes</p><p className="mt-1 text-sm">Description : {occupation.presentationSource.title}. RIASEC : {occupation.riasecSource.title}.</p></div></CardContent></Card>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="min-w-0 border-0 shadow-lg"><CardHeader><CardTitle>Profil RIASEC du métier</CardTitle><CardDescription>Valeurs O*NET normalisées de 0 à 100. ESCO ne recalcule pas ce profil.</CardDescription></CardHeader><CardContent className="space-y-4">{availableScores.length ? availableScores.map(({ code, label, score }) => <div key={code}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span><strong>{code}</strong> · {label}</span><strong>{score}</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} /></div></div>) : <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Aucun profil RIASEC direct n’est disponible. Ce métier est exclu du classement automatique.</div>}</CardContent></Card>
          <Card className="min-w-0 border-0 shadow-lg"><CardHeader><CardTitle>Données complémentaires</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="flex flex-wrap justify-between gap-3 border-b pb-3"><span>Code O*NET</span><strong className="break-all">{occupation.sourceCode}</strong></div><div className="flex flex-wrap justify-between gap-3 border-b pb-3"><span>Code ISCO</span><strong>{occupation.iscoCode || 'Non renseigné'}</strong></div><div className="flex flex-wrap justify-between gap-3 border-b pb-3"><span>Job Zone</span><strong>{occupation.jobZone || 'Non renseignée'}</strong></div><div className="flex flex-wrap justify-between gap-3"><span>Statut local</span><strong>{localRelevanceLabel(occupation.localRelevanceStatus)}</strong></div>{occupation.crosswalk ? <div className="rounded-lg bg-slate-50 p-3 leading-relaxed">Rapprochement {occupation.crosswalk.mappingKind}, niveau {occupation.crosswalk.confidenceLevel}, statut {occupation.crosswalk.reviewStatus}. Une correspondance officielle n’est pas présentée comme une revue locale.</div> : null}</CardContent></Card>
        </div>

        <Card className="min-w-0 border-0 shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Compétences et appellations</CardTitle><CardDescription>{fallback ? 'Aucun contenu ESCO français fiable n’est disponible pour cette fiche.' : 'Contenus français fournis par ESCO.'}</CardDescription></CardHeader><CardContent className="grid min-w-0 gap-5 md:grid-cols-2"><div className="min-w-0"><h3 className="font-semibold">Appellations disponibles</h3>{occupation.aliases?.length ? <ul className="mt-3 space-y-2 text-sm text-slate-700">{occupation.aliases.map((alias) => <li key={`${alias.locale}-${alias.label}`} className="break-words rounded-lg border p-3">{alias.label}</li>)}</ul> : <p className="mt-3 text-sm text-slate-600">Aucune appellation alternative disponible.</p>}</div><div className="min-w-0"><h3 className="font-semibold">Compétences liées</h3>{occupation.skills?.length ? <ul className="mt-3 space-y-2 text-sm text-slate-700">{occupation.skills.slice(0, 20).map((skill) => <li key={skill.id} className="break-words rounded-lg border p-3"><strong>{skill.preferredLabel}</strong>{skill.description ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{skill.description}</p> : null}</li>)}</ul> : <p className="mt-3 text-sm text-slate-600">Aucune compétence française reliée n’est disponible.</p>}</div></CardContent></Card>

        <Card className="border-0 shadow-lg"><CardHeader><CardTitle>Sources et licences</CardTitle></CardHeader><CardContent className="space-y-5 text-sm leading-relaxed text-slate-700"><div><h3 className="font-semibold">Profil RIASEC — {occupation.riasecSource.title}</h3><p>{occupation.riasecSource.attribution}</p><Button asChild variant="outline" className="mt-2"><a href={occupation.riasecSource.licenseUrl} target="_blank" rel="noreferrer">Licence O*NET <ExternalLink className="ml-2 h-4 w-4" /></a></Button></div>{occupation.presentationSource.id !== occupation.riasecSource.id ? <div><h3 className="font-semibold">Description — {occupation.presentationSource.title}</h3><p>{occupation.presentationSource.attribution}</p><Button asChild variant="outline" className="mt-2"><a href={occupation.presentationSource.licenseUrl} target="_blank" rel="noreferrer">Licence ESCO <ExternalLink className="ml-2 h-4 w-4" /></a></Button></div> : null}</CardContent></Card>
      </div>
    </main>
  );
}
