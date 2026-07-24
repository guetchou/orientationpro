import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/lib/apiClient';
import { localRelevanceLabel, profileStatusLabel } from '@/lib/careerPresentation';
import { getCareerCatalogSummary, searchCareerOccupations } from '@/services/careerApi';
import type { CareerCatalogSourceSummary, CareerOccupation } from '@/types/career';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  return 'Le catalogue métiers n’a pas pu être chargé.';
};

export default function CareerCatalog() {
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [riasecOnly, setRiasecOnly] = useState(false);
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
          searchCareerOccupations({
            query,
            locale: 'en',
            riasecOnly,
            limit: PAGE_SIZE,
            offset,
          }),
        ]);
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
    return () => {
      active = false;
    };
  }, [query, riasecOnly, offset]);

  const submitSearch = () => {
    setOffset(0);
    setQuery(queryInput.trim());
  };

  const source = sources[0];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Button asChild variant="ghost">
          <Link to="/orientation/results"><ArrowLeft className="mr-2 h-4 w-4" />Mes résultats</Link>
        </Button>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Catalogue métiers</Badge>
              {source ? <Badge variant="outline">{source.occupationCount} métiers</Badge> : null}
              {source ? <Badge variant="outline">{source.matchableCount} profils RIASEC</Badge> : null}
            </div>
            <CardTitle className="text-3xl">Explorer les métiers</CardTitle>
            <CardDescription className="max-w-4xl text-base leading-relaxed">
              Recherche dans le référentiel professionnel importé et versionné. Les contenus sont actuellement en anglais, avec leur source et leur statut RIASEC conservés.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <label htmlFor="career-search" className="mb-2 block text-sm font-medium text-slate-700">
                  Métier ou mot-clé
                </label>
                <Input
                  id="career-search"
                  value={queryInput}
                  onChange={(event) => setQueryInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') submitSearch();
                  }}
                  placeholder="Ex. nurse, engineer, accountant…"
                />
              </div>
              <Button type="button" className="self-end" onClick={submitSearch}>
                <Search className="mr-2 h-4 w-4" />Rechercher
              </Button>
            </div>

            <label className="flex items-center gap-3 rounded-xl border p-4 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={riasecOnly}
                onChange={(event) => {
                  setOffset(0);
                  setRiasecOnly(event.target.checked);
                }}
                className="h-4 w-4"
              />
              Afficher uniquement les métiers disposant d’un profil RIASEC classable
            </label>

            {source ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
                Source : <strong>{source.title}</strong>, version {source.version}. Licence : {source.licenseName}. L’adaptation Congo n’a pas encore été validée métier par métier.
              </div>
            ) : null}
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="flex items-center gap-2 font-medium"><AlertCircle className="h-5 w-5" />Catalogue indisponible</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-52 items-center justify-center text-slate-600">
            <Loader2 className="mr-3 h-7 w-7 animate-spin text-emerald-700" />Chargement des métiers…
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {occupations.length} résultat(s) affiché(s){query ? ` pour « ${query} »` : ''}.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {occupations.map((occupation) => (
                <Card key={occupation.id} className="h-full border-slate-200 shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={occupation.riasecProfileStatus === 'missing' ? 'outline' : 'default'}>
                        {occupation.riasecDisplayCode || 'Sans profil'}
                      </Badge>
                      <Badge variant="secondary">{profileStatusLabel(occupation.riasecProfileStatus)}</Badge>
                    </div>
                    <CardTitle className="text-xl">{occupation.preferredLabel}</CardTitle>
                    <CardDescription className="line-clamp-4 leading-relaxed">
                      {occupation.description || 'Description indisponible.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">{occupation.sourceCode}</Badge>
                      <Badge variant="outline">{localRelevanceLabel(occupation.localRelevanceStatus)}</Badge>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/careers/${encodeURIComponent(occupation.id)}`}>Consulter la fiche</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!occupations.length && !error ? (
              <div className="rounded-xl border p-6 text-center text-slate-600">
                Aucun métier ne correspond aux critères actuels.
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />Précédent
              </Button>
              <span className="text-sm text-slate-600">Résultats {offset + 1} à {offset + occupations.length}</span>
              <Button
                type="button"
                variant="outline"
                disabled={occupations.length < PAGE_SIZE || loading}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Suivant<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
