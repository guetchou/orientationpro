import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CvUploadStep } from './CvUploadStep';
import { JobTargetStep } from './JobTargetStep';
import { AnalysisResult } from './AnalysisResult';
import { CvLoading, CvErrorState } from './states';
import { createCvAnalysis, describeCvError, type CvErrorView } from './cvApi';
import type { CvAnalysis } from './types';

type Phase = 'upload' | 'target' | 'analyzing' | 'result' | 'error';

// Parcours public d'optimisation de CV. Aucune analyse locale : tout passe par
// l'API /api/v1/cv. En cas d'echec ou de service indisponible, on affiche un
// etat honnete, jamais un faux resultat.
export const CvOptimizerPage = () => {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null);
  const [error, setError] = useState<CvErrorView | null>(null);

  const runAnalysis = async (
    selected: File,
    target: { jobTitle?: string; jobDescription?: string },
  ) => {
    setPhase('analyzing');
    setError(null);
    try {
      const result = await createCvAnalysis({ file: selected, ...target });
      if (!result?.snapshot?.scores) {
        // Resultat incomplet : on refuse d'afficher un ecran partiel trompeur.
        setError({ kind: 'unknown', message: "L'analyse est revenue incomplète. Réessayez." });
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
              <Sparkles className="h-4 w-4" /> Optimiseur de CV MAKOKI
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-stone-900">
              Analysez et améliorez votre CV
            </h1>
            <p className="mt-2 max-w-xl text-stone-600">
              Analyse heuristique et explicable de la structure, de la lisibilité et de l’adéquation
              de votre CV avec une offre. Une aide à l’amélioration, pas une garantie de sélection.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/cv-history">
              <History className="mr-2 h-4 w-4" /> Mon historique
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
          <CvLoading label="Analyse de votre CV en cours…" />
        ) : null}

        {phase === 'result' && analysis ? (
          <AnalysisResult analysis={analysis} onRestart={restart} />
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
