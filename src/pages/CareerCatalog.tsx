import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Languages, Loader2, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { getCareerCatalogSummary, searchCareerOccupations } from '@/services/careerApi';
import type { CareerCatalogSourceSummary, CareerOccupation } from '@/types/career';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;
const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Le catalogue métiers n’a pas pu être chargé.';

export default function CareerCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = String(searchParams.get('q') || '').trim().slice(0, 120);
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [detailedOnly, setDetailedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [occupations, setOccupations] = useState<CareerOccupation[]>([]);
  const [sources, setSources] = useState<CareerCatalogSourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catalogSources, results] = await Promise.all([
          getCareerCatalogSummary(),
          searchCareerOccupations({ query, locale: 'fr', riasecOnly: detailedOnly, limit: PAGE_SIZE, offset }),
        ]);
        if (!Array.isArray(catalogSources) || !Array.isArray(results)) throw new Error('Réponse du catalogue incomplète.');
        if (active) {
          setSources(catalogSources);
          setOccupations(results);
        }
      } catch (caught) {
        if (active) setError(errorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [query, detailedOnly, offset]);

  const submitSearch = () => {
    const normalized = queryInput.trim().slice(0, 120);
    setOffset(0);
    setQuery(normalized);
    const next = new URLSearchParams(searchParams);
    if (normalized) next.set('q', normalized);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const frenchSource = sources.find((source) => source.locale === 'fr');

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-10">
      <h1 className="sr-only">Explorer les métiers</h1>
      <div className="mx-auto min-w-0 max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost"><Link to="/parcours"><ArrowLeft className="mr-2 h-4 w-4" />Revenir à mon projet</Link></Button>
          <Button asChild><Link to="/parcours">Mieux préciser mes choix</Link></Button>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Catalogue des métiers</Badge>
              {frenchSource ? <Badge variant="outline">Informations en français</Badge> : null}
            </div>
            <CardTitle className="text-3xl">Explore les métiers qui t’intéressent</CardTitle>
            <CardDescription className="max-w-4xl text-base leading-relaxed">
              Recherche un métier, découvre ce qu’il implique au quotidien et compare plusieurs pistes avant de décider lesquelles approfondir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <label htmlFor="career-search" className="mb-2 block text-sm font-medium text-slate-700">Métier ou mot-clé</label>
                <Input id="career-search" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }} placeholder="Ex. infirmier, comptable, ingénieur…" />
              </div>
              <Button type="button" className="self-end" onClick={submitSearch}><Search className="mr-2 h-4 w-4" />Rechercher</Button>
            </div>
            <label className="flex items-center gap-3 rounded-xl border p-4 text-sm text-slate-700">
              <input type="checkbox" checked={detailedOnly} onChange={(event) => { setOffset(0); setDetailedOnly(event.target.checked); }} className="h-4 w-4" />
              Afficher uniquement les fiches qui contiennent le plus d’informations
            </label>
            <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
              Ces fiches servent à explorer. Avant de choisir une voie, vérifie aussi les formations disponibles, les conditions d’accès et la réalité du métier auprès des organismes concernés.
            </div>
          </CardContent>
        </Card>

        {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"><p className="flex items-center gap-2 font-medium"><AlertCircle className="h-5 w-5" />Catalogue indisponible</p><p className="mt-2 text-sm">{error}</p></div> : null}
        {loading ? <div className="flex min-h-52 items-center justify-center text-slate-600"><Loader2 className="mr-3 h-7 w-7 animate-spin text-emerald-700" />Chargement des métiers…</div> : (
          <div className="min-w-0 space-y-4">
            <p className="text-sm text-slate-600">{occupations.length} métier{occupations.length > 1 ? 's' : ''} affiché{occupations.length > 1 ? 's' : ''}{query ? ` pour « ${query} »` : ''}.</p>
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              {occupations.map((occupation) => (
                <Card key={occupation.id} className="h-full min-w-0 overflow-hidden border-slate-200 shadow-sm">
                  <CardHeader className="min-w-0 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {occupation.translationStatus === 'unavailable' ? <Badge variant="outline"><Languages className="mr-1 h-3 w-3" />Informations en anglais</Badge> : <Badge variant="outline">Informations en français</Badge>}
                    </div>
                    <CardTitle className="break-words text-xl">{occupation.preferredLabel}</CardTitle>
                    <CardDescription className="line-clamp-4 break-words leading-relaxed">{occupation.description || 'Cette fiche est encore en cours d’enrichissement.'}</CardDescription>
                  </CardHeader>
                  <CardContent><Button asChild variant="outline" className="w-full"><Link to={`/careers/${encodeURIComponent(occupation.id)}`}>Voir les activités et compétences</Link></Button></CardContent>
                </Card>
              ))}
            </div>
            {!occupations.length && !error ? (
              <div className="rounded-xl border bg-white p-6 text-center text-slate-700">
                <p className="font-medium">Aucun métier ne correspond à cette recherche.</p>
                <p className="mt-2 text-sm text-slate-500">Essaie un mot plus simple, un secteur d’activité ou enlève le filtre sur les fiches détaillées.</p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="outline" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}><ChevronLeft className="mr-2 h-4 w-4" />Précédent</Button>
              <span className="text-sm text-slate-600">Métiers {occupations.length ? offset + 1 : 0} à {offset + occupations.length}</span>
              <Button type="button" variant="outline" disabled={occupations.length < PAGE_SIZE || loading} onClick={() => setOffset(offset + PAGE_SIZE)}>Suivant<ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
