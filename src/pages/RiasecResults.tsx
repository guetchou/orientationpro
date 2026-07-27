import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, ClipboardList, Loader2, Plus } from 'lucide-react';
import { ApiError } from '@/lib/apiClient';
import { listRiasecResults } from '@/services/riasecApi';
import type { RiasecResult } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formatDate = (value?: string) => {
  if (!value) return 'Date indisponible';
  return new Intl.DateTimeFormat('fr-CG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const messageForError = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  return 'L’historique n’a pas pu être chargé.';
};

export default function RiasecResults() {
  const [results, setResults] = useState<RiasecResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const loaded = await listRiasecResults(50, 0);
        if (active) setResults(loaded.filter((result) => result.resultType === 'riasec'));
      } catch (caught) {
        if (active) setError(messageForError(caught));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button asChild variant="ghost" className="text-stone-600 hover:text-stone-900">
          <Link to="/tests"><ArrowLeft className="mr-2 h-4 w-4" />Tests</Link>
        </Button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="bg-emerald-700 hover:bg-emerald-700">Holland / RIASEC</Badge>
            <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">Mes résultats d’orientation</h1>
            <p className="mt-2 text-stone-600">Historique réel des passations enregistrées sur ton compte.</p>
          </div>
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link to="/tests/riasec"><Plus className="mr-2 h-4 w-4" />Nouvelle passation</Link>
          </Button>
        </div>

        {loading && (
          <Card className="border border-stone-200 shadow-sm">
            <CardContent className="flex items-center justify-center gap-3 p-12 text-stone-600" role="status" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-700" /> Chargement de l’historique…
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <Card className="overflow-hidden border border-stone-200 shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-700" />
            <CardContent className="p-10 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <ClipboardList className="h-7 w-7 text-emerald-700" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-stone-900">Aucun résultat enregistré</h2>
              <p className="mx-auto mt-2 max-w-xl text-stone-600">
                Réalise une première passation RIASEC pour obtenir tes scores et ton code d’intérêts professionnels.
              </p>
              <Button asChild className="mt-6 bg-emerald-700 hover:bg-emerald-800">
                <Link to="/tests/riasec"><Plus className="mr-2 h-4 w-4" />Commencer</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((result) => {
              const top = result.ranking?.ordered?.slice(0, 3) || [];
              return (
                <Card
                  key={result.id}
                  className="flex flex-col border border-stone-200 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="font-heading text-2xl text-emerald-700">
                          {result.displayCode || result.primaryCode || 'Profil à égalités'}
                        </CardTitle>
                        <CardDescription className="mt-1 text-stone-500">
                          {formatDate(result.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge variant={result.primaryCode ? 'secondary' : 'outline'}>
                        {result.primaryCode ? 'Code principal' : 'Égalité en tête'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {top.map((entry, index) => (
                        <div
                          key={entry.dimension}
                          className={`rounded-lg p-3 text-center ${
                            index === 0 ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-900'
                          }`}
                        >
                          <div className="text-sm font-bold">{entry.dimension}</div>
                          <div className="text-lg font-semibold">{entry.score}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-stone-100 pt-3 text-sm text-stone-600">
                      <span>Différenciation</span>
                      <strong className="text-stone-900">{result.differentiation.range} pts</strong>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/orientation/results/${result.id}`}>
                        Ouvrir le résultat <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
