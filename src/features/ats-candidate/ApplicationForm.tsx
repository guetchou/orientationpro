import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CvAnalysisSelector } from './CvAnalysisSelector';
import { depositApplication } from './api';
import { describeAtsError, type AtsErrorView } from './errors';
import type { AtsApplication } from './types';

const draftKey = (jobId: string) => `makoki.ats-candidate.application-draft.${jobId}.v1`;

// localStorage peut lever (navigation privée, quota, politique de sécurité) :
// ces accès ne doivent jamais faire échouer la saisie du candidat.
// Même motif que src/features/cv-optimizer/JobTargetStep.tsx (issue #152).
const clearDraft = (jobId: string) => {
  try {
    localStorage.removeItem(draftKey(jobId));
  } catch {
    // Stockage local indisponible : rien à nettoyer.
  }
};

const readDraft = (jobId: string): string | undefined => {
  try {
    const raw = localStorage.getItem(draftKey(jobId));
    return raw ? (JSON.parse(raw).cvAnalysisId as string | undefined) : undefined;
  } catch {
    clearDraft(jobId);
    return undefined;
  }
};

export const ApplicationForm = ({
  jobId,
  onDeposited,
}: {
  jobId: string;
  onDeposited: (application: AtsApplication) => void;
}) => {
  const [cvAnalysisId, setCvAnalysisId] = useState<string | undefined>(() => readDraft(jobId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AtsErrorView | null>(null);

  useEffect(() => {
    if (!cvAnalysisId) {
      clearDraft(jobId);
      return;
    }
    try {
      localStorage.setItem(draftKey(jobId), JSON.stringify({ cvAnalysisId }));
    } catch {
      // Stockage local indisponible : la sélection reste fonctionnelle en mémoire.
    }
  }, [jobId, cvAnalysisId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { application } = await depositApplication(jobId, cvAnalysisId);
      clearDraft(jobId);
      onDeposited(application);
    } catch (caught) {
      setError(describeAtsError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
      <CvAnalysisSelector value={cvAnalysisId} onChange={setCvAnalysisId} />
      {error ? (
        <p className="text-sm text-amber-800" role="alert">{error.message}</p>
      ) : null}
      <Button
        disabled={submitting}
        onClick={() => { void handleSubmit(); }}
        className="bg-emerald-700 hover:bg-emerald-800"
      >
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Envoyer ma candidature
      </Button>
    </div>
  );
};
