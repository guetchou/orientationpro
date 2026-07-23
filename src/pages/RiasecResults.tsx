import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ClipboardList, Loader2, Plus } from 'lucide-react';
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="secondary">Holland / RIASEC</Badge>
            <h1 className="mt-3 text-4xl font-bold">Mes Résultats d’orientation</h1>
            <p className="mt-2 text-gray-600">Historique réel des passations enregistrées sur ton compte.</p>
          </div>
          <Button asChild><Link to="/tests/riasec"><Plus className="mr-2 h-4 w-4" />Nouvelle passation</Link></Button>
        </div>

        {loading && (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center justify-center gap-3 p-12 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement de l’historique…
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-emerald-700" />
              <h2 className="text-2xl font-semibold">Aucun résultat enregistré</h2>
              <p className="mx-auto mt-2 max-w-xl text-gray-600">
                Réalise une première passation RIASEC pour obtenir tes scores et ton code d’intérêts professionnels.
              </p>
              <Button asChild className="mt-6"><Link to="/tests/riasec">Commencer</Link></Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {results.map((result) => {
            const top = result.ranking?.ordered?.slice(0, 3) || [];
            return (
              <Card key={result.id} className="border-0 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl">{result.displayCode || result.primaryCode || 'Profil à égalités'}</CardTitle>
                      <CardDescription className="mt-1">{formatDate(result.createdAt)}</CardDescription>
                    </div>
                    <Badge variant={result.primaryCode ? 'default' : 'outline'}>
                      {result.primaryCode ? 'Code principal' : 'Égalité en tête'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    {top.map((entry) => (
                      <div key={entry.dimension} className="rounded-lg bg-emerald-50 p-3 text-center">
                        <div className="font-bold text-emerald-800">{entry.dimension}</div>
                        <div className="text-lg font-semibold">{entry.score}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Différenciation</span>
                    <strong>{result.differentiation.range} points</strong>
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
      </div>
    </main>
  );
}
