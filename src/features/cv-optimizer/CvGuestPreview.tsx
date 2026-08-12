import { CheckCircle2, LockKeyhole, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { CvPreview } from './cvApi';

interface CvGuestPreviewProps {
  preview: CvPreview;
  onRestart: () => void;
}

export const CvGuestPreview = ({ preview, onRestart }: CvGuestPreviewProps) => (
  <section className="space-y-5" aria-labelledby="cv-preview-title">
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" /> Analyse terminée
          </p>
          <h2 id="cv-preview-title" className="mt-1 font-heading text-2xl font-bold text-stone-900">
            Aperçu gratuit
          </h2>
          <p className="mt-1 text-stone-600">
            Voici les premiers indicateurs de compatibilité ATS de ton CV.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
          <strong className="block text-3xl text-emerald-800">{preview.score}/100</strong>
          <span className="text-xs text-emerald-700">score global</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-stone-50 p-4">
          <p className="text-sm font-medium text-stone-900">
            {preview.sectionsPresent} sections sur {preview.sectionsTotal} détectées
          </p>
          {preview.targetScore !== null ? (
            <p className="mt-1 text-sm text-stone-600">Adéquation au poste : {preview.targetScore}/100</p>
          ) : null}
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-950">Action prioritaire</p>
          <p className="mt-1 text-sm text-amber-900">{preview.priorityAction}</p>
        </div>
      </div>

      {preview.highlights.length > 0 ? (
        <ul className="mt-5 space-y-2" aria-label="Premiers points positifs">
          {preview.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-sm text-stone-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {highlight}
            </li>
          ))}
        </ul>
      ) : null}
    </div>

    <div className="rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
        <div>
          <h3 className="font-heading text-xl font-semibold">Débloque ton analyse détaillée</h3>
          <p className="mt-2 text-sm text-stone-200">
            Crée un compte ou connecte-toi pour accéder au rapport complet, l’export et la sauvegarde de tes analyses.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-500 text-stone-950 hover:bg-emerald-400">
              <Link to="/register">Créer mon compte</Link>
            </Button>
            <Button asChild variant="outline" className="border-stone-500 bg-transparent text-white hover:bg-stone-800 hover:text-white">
              <Link to="/login">Me connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Button type="button" variant="ghost" onClick={onRestart}>
      <RotateCcw className="mr-2 h-4 w-4" /> Tester un autre CV
    </Button>
  </section>
);
