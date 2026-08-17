import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  History,
  Search,
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
import {
  clearCvGuestDraft,
  createCvOperationId,
  loadCvGuestDraft,
  saveCvGuestDraft,
} from './cvGuestDraftStore';
import { withCvAnalysisLock } from './cvAnalysisCoordinator';
import type { AtsAnalysis } from './types';

type Phase = 'upload' | 'analyzing' | 'result' | 'target' | 'error';
type AnalysisTarget = { jobTitle?: string; jobDescription?: string };
type PendingAnalysis = { file: File; target: AnalysisTarget; operationId: string };

const cvOptimizerReturnState = {
  from: { pathname: '/cv-optimizer', search: '', hash: '' },
};

const steps = [
  { label: 'Analyse ton CV', description: 'Comprends ce qui est solide et ce qui doit être amélioré.', icon: FileSearch },
  { label: 'Cible ton poste', description: 'Compare ensuite ton CV à une offre ou à un métier précis.', icon: Target },
  { label: 'Trouve des opportunités', description: 'Passe de ton profil aux offres d’emploi qui te correspondent.', icon: BriefcaseBusiness },
];

export const CvOptimizerPage = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [preview, setPreview] = useState<CvPreview | null>(null);
  const [error, setError] = useState<CvErrorView | null>(null);
  const guestRestoreAttempted = useRef(false);
  const authenticatedResumeAttempted = useRef(false);
  const pendingAnalysis = useRef<PendingAnalysis | null>(null);

  const activeStep = useMemo(() => {
    if (phase === 'upload' || phase === 'analyzing') return 0;
    if (phase === 'target') return 1;
    if (analysis?.snapshot?.targetMatch) return 2;
    return 0;
  }, [analysis, phase]);

  const runAnalysis = useCallback(async (
    selected: File,
    target: AnalysisTarget = {},
    operationId = createCvOperationId(),
  ) => {
    pendingAnalysis.current = { file: selected, target, operationId };
    setPhase('analyzing');
    setError(null);
    try {
      if (user) {
        const result = await createAtsAnalysis({ file: selected, ...target, idempotencyKey: operationId });
        if (!result?.snapshot?.scores) {
          setError({ kind: 'unknown', message: "L'analyse du CV est incomplète. Réessaie." });
          setPhase('error');
          return;
        }
        setAnalysis(result);
        setPreview(null);
        pendingAnalysis.current = null;
        await clearCvGuestDraft();
      } else {
        await saveCvGuestDraft({ operationId, file: selected });
        const result = await createAtsPreview({ file: selected, ...target });
        if (result?.kind !== 'cv-preview-v1') {
          setError({ kind: 'unknown', message: "L'aperçu du CV est incomplet. Réessaie." });
          setPhase('error');
          return;
        }
        setPreview(result);
        setAnalysis(null);
        pendingAnalysis.current = null;
        await saveCvGuestDraft({ operationId, file: selected, preview: result });
      }
      setPhase('result');
    } catch (caught) {
      setError(describeCvError(caught));
      setPhase('error');
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (user) {
      if (authenticatedResumeAttempted.current) return undefined;
      authenticatedResumeAttempted.current = true;
      void loadCvGuestDraft().then((draft) => {
        if (!active || !draft) return;
        setFile(draft.file);
        void withCvAnalysisLock(
          draft.operationId,
          () => runAnalysis(draft.file, {}, draft.operationId),
        );
      });
    } else {
      if (guestRestoreAttempted.current) return undefined;
      guestRestoreAttempted.current = true;
      void loadCvGuestDraft().then((draft) => {
        if (!active || !draft?.preview) return;
        setFile(draft.file);
        setAnalysis(null);
        setPreview(draft.preview);
        setError(null);
        setPhase('result');
      });
    }
    return () => { active = false; };
  }, [runAnalysis, user]);

  const restart = () => {
    pendingAnalysis.current = null;
    setFile(null);
    setAnalysis(null);
    setPreview(null);
    setError(null);
    setPhase('upload');
    void clearCvGuestDraft();
  };

  const retryCurrentAnalysis = () => {
    const pending = pendingAnalysis.current;
    if (!pending) {
      restart();
      return;
    }
    void runAnalysis(pending.file, pending.target, pending.operationId);
  };

  const beginWithFile = (selected: File) => {
    setFile(selected);
    void runAnalysis(selected);
  };

  return (
    <main className="min-h-screen bg-[#f8faf8] px-4 py-7 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700">CV Optimizer</p>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-stone-950 md:text-4xl">Fais de ton CV un vrai point de départ</h1>
            <p className="mt-2 max-w-2xl text-stone-600">Analyse d’abord ton CV, améliore ce qui compte, puis cible un poste et explore les opportunités adaptées à ton profil.</p>
          </div>
          {user ? (
            <Button variant="outline" asChild className="w-fit bg-white">
              <Link to="/cv-history"><History className="mr-2 h-4 w-4" /> Mes analyses</Link>
            </Button>
          ) : null}
        </header>

        <section className="mb-6 grid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm md:grid-cols-3" aria-label="Parcours CV vers emploi">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const active = index === activeStep;
            const Icon = step.icon;
            return (
              <div key={step.label} className={`relative p-5 ${index > 0 ? 'border-t border-stone-200 md:border-l md:border-t-0' : ''} ${active ? 'bg-emerald-50/70' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${active || completed ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </span>
                  <Icon className={`h-5 w-5 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                </div>
                <h2 className="mt-4 font-semibold text-stone-900">{step.label}</h2>
                <p className="mt-1 text-sm leading-5 text-stone-500">{step.description}</p>
              </div>
            );
          })}
        </section>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <p><strong>Logique Makoki :</strong> analyser → améliorer → cibler → rechercher. Le poste vient après le diagnostic du CV, pas avant.</p>
        </div>

        {phase === 'upload' ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-7"><CvUploadStep onSelected={beginWithFile} /></div>
            <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-stone-900">Pourquoi commencer ici ?</h3>
              <ul className="mt-4 space-y-4 text-sm text-stone-600">
                {[
                  'Comprendre la qualité actuelle du CV.',
                  'Repérer les forces et les faiblesses avant de le personnaliser.',
                  'Éviter d’adapter un document qui doit d’abord être corrigé.',
                  'Construire une base réutilisable pour plusieurs candidatures.',
                ].map((item) => (
                  <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><span>{item}</span></li>
                ))}
              </ul>
            </aside>
          </div>
        ) : null}

        {phase === 'target' && file ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-7">
              <JobTargetStep
                fileName={file.name}
                submitting={false}
                onBack={() => setPhase('result')}
                onSubmit={(target) => void runAnalysis(file, target)}
              />
            </div>
            <aside className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-stone-900">Tu n’as pas encore d’offre ?</h3>
                <p className="mt-2 text-sm text-stone-600">Explore les offres publiées sur Makoki, puis reviens comparer ton CV à celle qui t’intéresse.</p>
                <Button variant="outline" asChild className="mt-4 w-full"><Link to="/jobs"><Search className="mr-2 h-4 w-4" /> Rechercher un emploi</Link></Button>
              </div>
            </aside>
          </div>
        ) : null}

        {phase === 'analyzing' ? <CvLoading label="Analyse de ton CV en cours…" /> : null}

        {phase === 'result' && analysis ? (
          <div className="space-y-6">
            <AtsAnalysisResult analysis={analysis} onRestart={restart} />
            {!analysis.snapshot.targetMatch && file ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-emerald-700">Étape suivante</p>
                    <h3 className="mt-1 font-heading text-xl font-bold text-stone-900">Ton diagnostic est prêt. Maintenant, donne-lui une cible.</h3>
                    <p className="mt-1 text-sm text-stone-600">Corrige les priorités du rapport, puis compare ce CV à une offre précise. Tu peux aussi commencer par rechercher une opportunité.</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Button variant="outline" asChild className="bg-white"><Link to="/jobs"><Search className="mr-2 h-4 w-4" /> Rechercher un poste</Link></Button>
                    <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setPhase('target')}>Cibler une offre <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </div>
              </section>
            ) : null}
            {analysis.snapshot.targetMatch ? (
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Étape 3 · Opportunités</p>
                    <h3 className="mt-1 font-heading text-xl font-bold text-stone-900">Passe de l’analyse à la candidature.</h3>
                    <p className="mt-1 text-sm text-stone-600">Explore les offres et utilise l’analyse d’adéquation pour décider où concentrer tes candidatures.</p>
                  </div>
                  <Button asChild className="shrink-0 bg-emerald-700 hover:bg-emerald-800"><Link to="/jobs"><Search className="mr-2 h-4 w-4" /> Voir les offres</Link></Button>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {phase === 'result' && preview ? (
          <div className="space-y-6">
            <CvGuestPreview preview={preview} onRestart={restart} />
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-center md:p-6">
              <h3 className="font-heading text-xl font-bold text-stone-900">Continue ton parcours CV vers emploi</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">Connecte-toi pour conserver tes analyses, cibler une offre et télécharger le rapport complet.</p>
              <Button asChild className="mt-4 bg-emerald-700 hover:bg-emerald-800"><Link to="/login" state={cvOptimizerReturnState}>Continuer <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </section>
          </div>
        ) : null}

        {phase === 'error' && error ? (
          <div className="space-y-6"><CvErrorState error={error} onRetry={retryCurrentAnalysis} /></div>
        ) : null}
      </div>
    </main>
  );
};

export default CvOptimizerPage;
