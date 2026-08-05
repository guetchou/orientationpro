import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DRAFT_KEY = 'makoki.cv-optimizer.job-target-draft.v1';

interface JobTargetDraft {
  jobTitle: string;
  jobDescription: string;
}

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Le stockage local peut être indisponible sans bloquer le parcours.
  }
};

const readDraft = (): JobTargetDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    clearDraft();
    return null;
  }
};

export const JobTargetStep = ({
  fileName,
  onSubmit,
  onBack,
  submitting,
}: {
  fileName: string;
  onSubmit: (target: { jobTitle?: string; jobDescription?: string }) => void;
  onBack: () => void;
  submitting: boolean;
}) => {
  const [jobTitle, setJobTitle] = useState(() => readDraft()?.jobTitle ?? '');
  const [jobDescription, setJobDescription] = useState(() => readDraft()?.jobDescription ?? '');

  useEffect(() => {
    if (!jobTitle && !jobDescription) {
      clearDraft();
      return;
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ jobTitle, jobDescription }));
    } catch {
      // La saisie reste disponible en mémoire.
    }
  }, [jobTitle, jobDescription]);

  const trimmedTitle = jobTitle.trim();
  const trimmedDescription = jobDescription.trim();

  return (
    <section className="mx-auto max-w-xl space-y-5" aria-labelledby="job-target-title">
      <div>
        <p className="text-sm font-medium text-emerald-700">Étape 2 sur 3</p>
        <h2 id="job-target-title" className="mt-1 text-xl font-semibold text-stone-900">
          Précise le poste que tu vises
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Cette étape est facultative. Avec une offre, Makoki peut comparer ton CV aux missions et compétences demandées.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-stone-700">
        <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
        <span className="truncate">CV sélectionné : <strong>{fileName}</strong></span>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-stone-900">
          <Target className="h-5 w-5 text-emerald-700" /> Comparer ton CV à une offre
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Colle la description de l’offre pour vérifier si les éléments importants apparaissent dans ton CV. Ajoute uniquement des compétences que tu maîtrises réellement.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="job-title">Intitulé du poste</Label>
            <Input
              id="job-title"
              value={jobTitle}
              maxLength={255}
              placeholder="Ex. Comptable, conseiller clientèle…"
              onChange={(event) => setJobTitle(event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="job-description">Description de l’offre</Label>
              <span className="text-xs text-stone-400">{jobDescription.length} / 20 000</span>
            </div>
            <Textarea
              id="job-description"
              value={jobDescription}
              maxLength={20000}
              rows={7}
              placeholder="Colle ici les missions, les compétences et les critères demandés."
              onChange={(event) => setJobDescription(event.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          disabled={submitting || trimmedDescription.length === 0}
          onClick={() => {
            clearDraft();
            onSubmit({
              jobTitle: trimmedTitle || undefined,
              jobDescription: trimmedDescription || undefined,
            });
          }}
          className="w-full bg-emerald-700 hover:bg-emerald-800"
          size="lg"
        >
          Comparer mon CV à cette offre
        </Button>

        <Button
          variant="outline"
          disabled={submitting}
          onClick={() => { clearDraft(); onSubmit({}); }}
          className="w-full"
        >
          Analyser mon CV sans offre
        </Button>

        <Button variant="ghost" onClick={onBack} disabled={submitting} className="w-full text-stone-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Choisir un autre CV
        </Button>
      </div>
    </section>
  );
};
