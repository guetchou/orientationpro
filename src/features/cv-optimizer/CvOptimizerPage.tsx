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
        setError({ kind: 'unknown', message: "L'analyse du CV est incomplète. Réessaie." });
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
              <Sparkles className="h-4 w-4" /> Analyse de CV
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-stone-900">
              Vérifie et améliore ton CV
            </h1>
            <p className="mt-2 max-w-xl text-stone-600">
              Importe ton CV pour repérer ce qui est clair, ce qui manque et ce qui peut être amélioré pour le poste que tu vises.
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              L’analyse s’appuie sur des règles de lisibilité et de compatibilité avec les logiciels de tri de candidatures. Elle ne garantit ni entretien ni recrutement.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/cv-history">
              <History className="mr-2 h-4 w-4" /> Mes analyses
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

        {phase === 'analyzing' ? <CvLoading label="Analyse de ton CV en cours…" /> : null}

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
