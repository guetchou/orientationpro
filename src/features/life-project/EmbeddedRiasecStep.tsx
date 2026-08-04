import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
} from 'lucide-react';
import { ApiError } from '@/lib/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  claimGuestOrientation,
  createRiasecAttempt,
  getRiasecAttempt,
  getRiasecInstrument,
  listRiasecResults,
  submitRiasecAttempt,
} from '@/services/riasecApi';
import type { RiasecAttempt, RiasecInstrument } from '@/types/riasec';
import type { AdvisorRiasecProfile } from './advisor-types';
import { persistRiasecResult } from './riasec-profile';

const DRAFT_KEY = 'makoki.riasec.draft.v1';

type Phase = 'loading' | 'intro' | 'questions' | 'submitting' | 'completed' | 'error';

interface LocalDraft {
  attemptId: string;
  instrumentId: string;
  currentIndex: number;
  answers: Record<string, number>;
}

interface EmbeddedRiasecStepProps {
  onComplete: (profile: AdvisorRiasecProfile) => void;
}

const readDraft = (): LocalDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) as LocalDraft : null;
  } catch {
    localStorage.removeItem(DRAFT_KEY);
    return null;
  }
};

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'INCOMPLETE_RESPONSES') return 'Réponds à toutes les affirmations avant de terminer.';
    if (error.status === 429) return 'Trop de tentatives rapprochées. Réessaie dans quelques minutes.';
  }
  return 'Cette étape n’est pas disponible pour le moment. Réessaie dans quelques instants.';
};

export default function EmbeddedRiasecStep({ onComplete }: EmbeddedRiasecStepProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [instrument, setInstrument] = useState<RiasecInstrument | null>(null);
  const [attempt, setAttempt] = useState<RiasecAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      await claimGuestOrientation();
      const existing = await listRiasecResults(1, 0);
      if (existing[0]) {
        onComplete(persistRiasecResult(existing[0]));
        setPhase('completed');
        return;
      }

      const available = await getRiasecInstrument();
      setInstrument(available);
      const draft = readDraft();
      if (draft?.instrumentId === available.id) {
        try {
          const restored = await getRiasecAttempt(draft.attemptId);
          if (restored.attempt.status === 'in_progress') {
            setAttempt(restored.attempt);
            setInstrument(restored.instrument);
            setAnswers(draft.answers || {});
            setCurrentIndex(Math.min(Math.max(draft.currentIndex || 0, 0), restored.instrument.itemCount - 1));
            setPhase('questions');
            return;
          }
        } catch {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
      setPhase('intro');
    } catch (caught) {
      setError(errorMessage(caught));
      setPhase('error');
    }
  }, [onComplete]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (phase !== 'questions' || !attempt || !instrument) return;
    const draft: LocalDraft = {
      attemptId: attempt.id,
      instrumentId: instrument.id,
      currentIndex,
      answers,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [answers, attempt, currentIndex, instrument, phase]);

  const currentItem = instrument?.items[currentIndex];
  const selectedValue = currentItem ? answers[currentItem.id] : undefined;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress = instrument ? Math.round((answeredCount / instrument.itemCount) * 100) : 0;
  const isLast = Boolean(instrument && currentIndex === instrument.itemCount - 1);

  const startNewAttempt = async () => {
    setPhase('loading');
    setError(null);
    localStorage.removeItem(DRAFT_KEY);
    try {
      const created = await createRiasecAttempt();
      setAttempt(created.attempt);
      setInstrument(created.instrument);
      setAnswers({});
      setCurrentIndex(0);
      setPhase('questions');
    } catch (caught) {
      setError(errorMessage(caught));
      setPhase('error');
    }
  };

  const restart = () => {
    const confirmed = window.confirm('Recommencer effacera toutes les réponses de ce questionnaire. Continuer ?');
    if (!confirmed) return;
    localStorage.removeItem(DRAFT_KEY);
    setAttempt(null);
    setAnswers({});
    setCurrentIndex(0);
    setError(null);
    setPhase('intro');
  };

  const submit = async () => {
    if (!attempt || !instrument) return;
    const responses = instrument.items
      .filter((item) => answers[item.id] !== undefined)
      .map((item) => ({ itemId: item.id, value: answers[item.id] }));
    if (responses.length !== instrument.itemCount) {
      setError(`Il reste ${instrument.itemCount - responses.length} réponse(s) à compléter.`);
      return;
    }

    setPhase('submitting');
    setError(null);
    try {
      const completion = await submitRiasecAttempt(attempt.id, responses);
      localStorage.removeItem(DRAFT_KEY);
      onComplete(persistRiasecResult(completion.result));
      setPhase('completed');
    } catch (caught) {
      setError(errorMessage(caught));
      setPhase('questions');
    }
  };

  if (phase === 'completed') return null;

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <Card className="print:hidden">
        <CardContent className="flex min-h-44 items-center justify-center p-8" role="status">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
          {phase === 'submitting' ? 'Préparation de ton résultat…' : 'Préparation de ton parcours…'}
        </CardContent>
      </Card>
    );
  }

  if (phase === 'error' || !instrument) {
    return (
      <Card className="border-red-200 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" />Étape momentanément indisponible</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent><Button type="button" onClick={() => void load()}>Réessayer</Button></CardContent>
      </Card>
    );
  }

  if (phase === 'intro') {
    return (
      <Card className="overflow-hidden border-primary/20 print:hidden" data-testid="unified-riasec-intro">
        <div className="h-1.5 bg-primary" />
        <CardHeader className="pb-4">
          <Badge className="w-fit">Première étape</Badge>
          <CardTitle className="text-2xl">Découvre ce qui t’intéresse</CardTitle>
          <CardDescription className="text-base">
            Lis chaque affirmation et indique simplement si elle te ressemble aujourd’hui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
            <span><strong>{instrument.itemCount}</strong> affirmations</span>
            <span><strong>10 à 15 minutes</strong></span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Save className="h-4 w-4" />Reprise possible sur cet appareil</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Il n’y a pas de bonne ou de mauvaise réponse. Choisis ce qui te ressemble le plus, sans chercher la réponse idéale.
          </p>
          <Button type="button" size="lg" onClick={() => void startNewAttempt()}>
            Commencer le questionnaire <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!attempt || !currentItem) return null;

  return (
    <Card className="print:hidden" data-testid="unified-riasec-questions">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge>Questionnaire en cours</Badge>
          <span className="text-sm text-muted-foreground">{progress}% complété</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <CardTitle className="pt-4 text-xl">Affirmation {currentIndex + 1} sur {instrument.itemCount}</CardTitle>
        <CardDescription className="text-base text-foreground">{currentItem.prompt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="À quel point cette affirmation te ressemble-t-elle ?">
          {instrument.responseScale.map((option) => {
            const selected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setAnswers((previous) => ({ ...previous, [currentItem.id]: option.value }))}
                className={`min-h-12 rounded-lg border p-3 text-sm transition ${selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:border-primary/50'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Button type="button" variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}>
            <ArrowLeft className="mr-2 h-4 w-4" />Précédent
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={restart}>
              <RotateCcw className="mr-2 h-4 w-4" />Recommencer
            </Button>
            <Button type="button" disabled={selectedValue === undefined} onClick={() => {
              if (isLast) void submit();
              else setCurrentIndex((index) => Math.min(instrument.itemCount - 1, index + 1));
            }}>
              {isLast ? <><CheckCircle2 className="mr-2 h-4 w-4" />Voir mon résultat</> : <>Suivant<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite"><Save className="h-3.5 w-3.5" />{answeredCount} réponse(s) enregistrée(s) sur cet appareil.</p>
      </CardContent>
    </Card>
  );
}
