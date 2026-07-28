import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CvUploadStep } from './CvUploadStep';
import { JobTargetStep } from './JobTargetStep';
import { AtsAnalysisResult } from './AtsAnalysisResult';
import { CvLoading, CvErrorState } from './states';
import { createAtsAnalysis, describeCvError, type CvErrorView } from './cvApi';
import type { AtsAnalysis } from './types';

type Phase = 'upload' | 'target' | 'analyzing' | 'result' | 'error';

// Parcours public de l'analyse ATS MAKOKI. Le candidat importe son CV ; MAKOKI
// transmet le fichier a l'API ATS /api/v1/cv ; le moteur versionne
// makoki-cv-rules-v1 evalue la compatibilite ATS ; l'interface restitue le
// resultat. Aucune analyse locale, aucun score simule : en cas d'echec ou de
// service indisponible, on affiche un etat honnete.
export const CvOptimizerPage = () => {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [error, setError] = useState<CvErrorView | null>(null);

  const runAnalysis = async (
    selected: File,
    target: { jobTitle?: string; jobDescription?: string },
  ) => {
    setPhase('analyzing');
    setError(null);
    try {
      const result = await createAtsAnalysis({ file: selected, ...target });
      if (!result?.snapshot?.scores) {
        setError({ kind: 'unknown', message: "L'analyse ATS est revenue incomplète. Réessayez." });
        setPhase('error');
        return;
      }
      setAnalysis(result);
      setPhase('result');
    } catch (caught) {
      setError(describeCvError(caught));
      setPhase('error');
    }
  };

  const restart = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setPhase('upload');
  };

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" /> Analyse ATS — Optimiseur de CV MAKOKI
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-stone-900">
              Analysez la compatibilité ATS de votre CV
            </h1>
            <p className="mt-2 max-w-xl text-stone-600">
              Votre CV est transmis à l’API d’analyse MAKOKI et évalué par le moteur versionné{' '}
              <strong>makoki-cv-rules-v1</strong>. Vous obtenez les règles réussies, les problèmes
              détectés, les preuves observables et des recommandations d’optimisation ATS.
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              La compatibilité est mesurée selon les règles MAKOKI analysées, sans garantie de
              passage des ATS ni reproduction de tous les ATS du marché.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/cv-history">
              <History className="mr-2 h-4 w-4" /> Mes analyses ATS
            </Link>
          </Button>
        </div>

        {phase === 'upload' ? (
          <CvUploadStep
            onSelected={(selected) => {
              setFile(selected);
              setPhase('target');
            }}
          />
        ) : null}

        {phase === 'target' && file ? (
          <JobTargetStep
            submitting={false}
            onBack={() => setPhase('upload')}
            onSubmit={(target) => void runAnalysis(file, target)}
          />
        ) : null}

        {phase === 'analyzing' ? (
          <CvLoading label="Analyse ATS de votre CV en cours…" />
        ) : null}

        {phase === 'result' && analysis ? (
          <AtsAnalysisResult analysis={analysis} onRestart={restart} />
        ) : null}

        {phase === 'error' && error ? (
          <div className="space-y-6">
            <CvErrorState error={error} onRetry={restart} />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default CvOptimizerPage;
