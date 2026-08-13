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
    <section className="space-y-5" aria-labelledby="job-target-title">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Étape 2 · Cible ton poste</p>
        <h2 id="job-target-title" className="mt-1 font-heading text-2xl font-bold text-stone-900">
          Compare ton CV à une offre réelle
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-stone-600">
          Ton CV a déjà été analysé. Ajoute maintenant l’offre qui t’intéresse pour mesurer ce qui correspond et ce qui mérite d’être adapté.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-stone-700">
        <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
        <span className="truncate"><strong>{fileName}</strong></span>
      </div>

      <div className="grid gap-5 rounded-2xl border border-stone-200 bg-stone-50/50 p-5 md:p-6">
        <div className="flex items-center gap-2 font-semibold text-stone-900">
          <Target className="h-5 w-5 text-emerald-700" /> Offre ciblée
        </div>
        <div>
          <Label htmlFor="job-title">Intitulé du poste</Label>
          <Input
            id="job-title"
            value={jobTitle}
            maxLength={255}
            placeholder="Ex. Responsable commercial, comptable, conseiller clientèle…"
            onChange={(event) => setJobTitle(event.target.value)}
            className="mt-1 bg-white"
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
            rows={6}
            placeholder="Colle ici les missions, compétences et critères demandés dans l’offre."
            onChange={(event) => setJobDescription(event.target.value)}
            className="mt-1 bg-white"
          />
          <p className="mt-2 text-xs text-stone-500">Makoki ne te demandera jamais d’ajouter une compétence que tu ne maîtrises pas réellement.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} disabled={submitting} className="w-full text-stone-600 sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au diagnostic
        </Button>
        <Button
          disabled={submitting || trimmedDescription.length === 0}
          onClick={() => {
            clearDraft();
            onSubmit({
              jobTitle: trimmedTitle || undefined,
              jobDescription: trimmedDescription || undefined,
            });
          }}
          className="w-full bg-emerald-700 px-7 hover:bg-emerald-800 sm:w-auto"
          size="lg"
        >
          Analyser l’adéquation
        </Button>
      </div>
    </section>
  );
};
