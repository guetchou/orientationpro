import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardList, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from './AnalysisResult';
import { CvEmpty, CvErrorState, CvLoading } from './states';
import {
  deleteCvAnalysis,
  describeCvError,
  getCvAnalysis,
  listCvAnalyses,
  type CvErrorView,
} from './cvApi';
import type { CvAnalysis, CvAnalysisPage } from './types';

const PAGE_SIZE = 10;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

// Historique paginé cote serveur des analyses du compte connecte, avec ouverture
// du detail, telechargement et suppression. Tous les etats sont explicites.
export const CvAnalysisHistory = () => {
  const [page, setPage] = useState<CvAnalysisPage | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<CvErrorView | null>(null);
  const [detail, setDetail] = useState<CvAnalysis | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (nextOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCvAnalyses(PAGE_SIZE, nextOffset);
      setPage(result);
      setOffset(nextOffset);
    } catch (caught) {
      setError(describeCvError(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      setDetail(await getCvAnalysis(id));
    } catch (caught) {
      setError(describeCvError(caught));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCvAnalysis(id);
      setDetail(null);
      await load(offset);
    } catch (caught) {
      setError(describeCvError(caught));
    }
  };

  if (detailLoading) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10">
        <CvLoading label="Chargement de l’analyse…" />
      </main>
    );
  }

  if (detail) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" className="mb-6" onClick={() => setDetail(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l’historique
          </Button>
          <AnalysisResult analysis={detail} onDelete={handleDelete} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-stone-900">Mes analyses de CV</h1>
            <p className="mt-2 text-stone-600">Historique des analyses enregistrées sur votre compte.</p>
          </div>
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link to="/cv-optimizer">
              <Plus className="mr-2 h-4 w-4" /> Nouvelle analyse
            </Link>
          </Button>
        </div>

        {loading ? (
          <CvLoading label="Chargement de votre historique…" />
        ) : error ? (
          <CvErrorState error={error} onRetry={() => void load(offset)} />
        ) : !page || page.analyses.length === 0 ? (
          <CvEmpty
            title="Aucune analyse pour le moment"
            description="Lancez une première analyse pour obtenir un indice de préparation et des recommandations."
            action={
              <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
                <Link to="/cv-optimizer">Analyser mon CV</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {page.analyses.map((item) => (
                <Card key={item.id} className="flex flex-col border border-stone-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 font-heading text-lg">
                      <span className="text-emerald-700">{item.scores.generalReadiness} / 100</span>
                      <Badge variant="outline">{item.document.detectedLanguage}</Badge>
                    </CardTitle>
                    <p className="flex items-center gap-2 text-sm text-stone-500">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.document.fileName || 'Document'}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    {item.targetTitle ? (
                      <p className="text-sm text-stone-600">Poste ciblé : {item.targetTitle}</p>
                    ) : null}
                    <p className="text-xs text-stone-400">{formatDate(item.createdAt)}</p>
                    <Button variant="outline" className="w-full" onClick={() => void openDetail(item.id)}>
                      Ouvrir <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => void load(Math.max(0, offset - PAGE_SIZE))}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <span className="text-sm text-stone-500">
                {offset + 1}–{Math.min(offset + PAGE_SIZE, page.pagination.total)} sur {page.pagination.total}
              </span>
              <Button
                variant="outline"
                disabled={offset + PAGE_SIZE >= page.pagination.total}
                onClick={() => void load(offset + PAGE_SIZE)}
              >
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {page && page.analyses.length === 0 ? (
          <div className="mt-6 flex justify-center text-stone-400">
            <ClipboardList className="h-6 w-6" />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default CvAnalysisHistory;
