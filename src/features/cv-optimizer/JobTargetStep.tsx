import { useState } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Etape 2 (facultative) : cibler une offre. Sans description d'offre, aucune
// pertinence ciblee n'est calculee (le serveur renvoie targetRelevance = null).
export const JobTargetStep = ({
  onSubmit,
  onBack,
  submitting,
}: {
  onSubmit: (target: { jobTitle?: string; jobDescription?: string }) => void;
  onBack: () => void;
  submitting: boolean;
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const trimmedTitle = jobTitle.trim();
  const trimmedDescription = jobDescription.trim();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-stone-900">
          <Target className="h-5 w-5 text-emerald-700" /> Cibler une offre (facultatif)
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Renseignez une offre pour comparer votre CV à ses attentes. Sans description, l’analyse
          reste générale.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="job-title">Intitulé du poste</Label>
            <Input
              id="job-title"
              value={jobTitle}
              maxLength={255}
              placeholder="Ex. Comptable, Conseiller clientèle…"
              onChange={(event) => setJobTitle(event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="job-description">Description de l’offre</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              maxLength={20000}
              rows={6}
              placeholder="Collez ici les missions et compétences demandées par l’offre."
              onChange={(event) => setJobDescription(event.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBack} disabled={submitting} className="sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Button
          variant="outline"
          disabled={submitting}
          onClick={() => onSubmit({})}
          className="flex-1"
        >
          Analyser sans offre
        </Button>
        <Button
          disabled={submitting || trimmedDescription.length === 0}
          onClick={() =>
            onSubmit({
              jobTitle: trimmedTitle || undefined,
              jobDescription: trimmedDescription || undefined,
            })
          }
          className="flex-1 bg-emerald-700 hover:bg-emerald-800"
        >
          Comparer à cette offre
        </Button>
      </div>
    </div>
  );
};
