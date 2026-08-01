import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { listAtsAnalyses } from '@/features/cv-optimizer/cvApi';
import type { AtsAnalysisSummary } from '@/features/cv-optimizer/types';

// Sélectionne l'une des analyses CV déjà réalisées par le candidat (feature
// cv-optimizer) pour la lier à sa candidature. Ne duplique jamais la liste
// complète de CvAnalysisHistory : juste un choix compact, lecture seule.
export const CvAnalysisSelector = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (cvAnalysisId: string | undefined) => void;
}) => {
  const [analyses, setAnalyses] = useState<AtsAnalysisSummary[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAtsAnalyses(10, 0)
      .then((page) => {
        if (!cancelled) setAnalyses(page.analyses);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <p className="text-sm text-stone-600">
        Vos analyses CV ne sont pas disponibles pour le moment ; vous pouvez postuler sans en lier une.
      </p>
    );
  }

  if (!analyses) {
    return (
      <p className="flex items-center gap-2 text-sm text-stone-600">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de vos analyses CV…
      </p>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium text-stone-900">
        Lier une analyse CV à cette candidature (facultatif)
      </legend>
      <label className="flex items-center gap-2 rounded-lg border border-stone-200 p-3 text-sm">
        <input
          type="radio"
          name="cv-analysis-selection"
          checked={!value}
          onChange={() => onChange(undefined)}
        />
        Postuler sans lier d’analyse CV
      </label>
      {analyses.length === 0 ? (
        <p className="text-sm text-stone-600">
          Vous n’avez pas encore d’analyse CV enregistrée.
        </p>
      ) : (
        analyses.map((analysis) => (
          <label
            key={analysis.id}
            className="flex items-center gap-2 rounded-lg border border-stone-200 p-3 text-sm"
          >
            <input
              type="radio"
              name="cv-analysis-selection"
              value={analysis.id}
              checked={value === analysis.id}
              onChange={() => onChange(analysis.id)}
            />
            <span>
              {analysis.document.fileName || 'Document sans nom'}
              {analysis.targetTitle ? ` — ciblé sur « ${analysis.targetTitle} »` : ''}
            </span>
          </label>
        ))
      )}
    </fieldset>
  );
};
