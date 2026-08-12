import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  History,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { CvUploadStep } from './CvUploadStep';
import { JobTargetStep } from './JobTargetStep';
import { AtsAnalysisResult } from './AtsAnalysisResult';
import { CvGuestPreview } from './CvGuestPreview';
import { CvLoading, CvErrorState } from './states';
import {
  createAtsAnalysis,
  createAtsPreview,
  describeCvError,
  type CvErrorView,
  type CvPreview,
} from './cvApi';
import type { AtsAnalysis } from './types';

type Phase = 'upload' | 'target' | 'analyzing' | 'result' | 'error';

const steps = [
  { label: 'Ton CV', icon: FileText },
  { label: 'Le poste visé', icon: Target },
  { label: 'Ton analyse', icon: Sparkles },
];

export const CvOptimizerPage = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [preview, setPreview] = useState<CvPreview | null>(null);
  const [error, setError] = useState<CvErrorView | null>(null);

  const activeStep = useMemo(() => {
    if (phase === 'upload') return 0;
    if (phase === 'target') return 1;
    return 2;
  }, [phase]);

  const runAnalysis = async (
    selected: File,
    target: { jobTitle?: string; jobDescription?: string },
  ) => {
    setPhase('analyzing');
    setError(null);
    try {
      if (user) {
        const result = await createAtsAnalysis({ file: selected, ...target });
        if (!result?.snapshot?.scores) {
          setError({ kind: 'unknown', message: "L'analyse du CV est incomplète. Réessaie." });
          setPhase('error');
          return;
        }
        setAnalysis(result);
      } else {
        const result = await createAtsPreview({ file: selected, ...target });
        if (result?.kind !== 'cv-preview-v1') {
          setError({ kind: 'unknown', message: "L'aperçu du CV est incomplet. Réessaie." });
          setPhase('error');
          return;
        }
        setPreview(result);
      }
      setPhase('result');
    } catch (caught) {
      setError(describeCvError(caught));
      setPhase('error');
    }
  };

  const restart = () => {
    setFile(null);
    setAnalysis(null);
    setPreview(null);
    setError(null);
    setPhase('upload');
  };

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 md:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              <Sparkles className="h-4 w-4" /> Analyse de CV
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-stone-900 md:text-4xl">
              Vérifie et améliore ton CV
            </h1>
            <p className="mt-2 text-stone-600">
              Importe ton CV, indique le poste que tu vises et reçois des recommandations concrètes pour le rendre plus clair et plus adapté.
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              L’analyse vérifie la lisibilité, la structure et la présence d’éléments souvent recherchés par les logiciels de tri de candidatures. Elle ne garantit ni entretien ni recrutement.
            </p>
          </div>
          {user ? (
            <Button variant="outline" asChild>
              <Link to="/cv-history">
                <History className="mr-2 h-4 w-4" /> Mes analyses
              </Link>
            </Button>
          ) : null}
        </div>

        <ol className="mb-7 grid gap-2 sm:grid-cols-3" aria-label="Étapes de l’analyse de CV">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;
            const Icon = step.icon;
            return (
              <li
                key={step.label}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                  active
                    ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-950'
                    : completed
                      ? 'border-emerald-200 bg-white text-emerald-900'
                      : 'border-stone-200 bg-white text-stone-500'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  active
                    ? 'bg-emerald-700 text-white'
                    : completed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-100 text-stone-500'
                }`}>
                  {completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span>Étape {index + 1} · {step.label}</span>
              </li>
            );
          })}
        </ol>

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
            fileName={file.name}
            submitting={false}
            onBack={() => setPhase('upload')}
            onSubmit={(target) => void runAnalysis(file, target)}
          />
        ) : null}

        {phase === 'analyzing' ? <CvLoading label="Analyse de ton CV en cours…" /> : null}

        {phase === 'result' && analysis ? (
          <AtsAnalysisResult analysis={analysis} onRestart={restart} />
        ) : null}

        {phase === 'result' && preview ? (
          <CvGuestPreview preview={preview} onRestart={restart} />
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
