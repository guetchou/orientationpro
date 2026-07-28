import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  History,
  Keyboard,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { ApiError } from '@/lib/apiClient';
import {
  createRiasecAttempt,
  getRiasecAttempt,
  getRiasecInstrument,
  submitRiasecAttempt,
} from '@/services/riasecApi';
import type { RiasecAttempt, RiasecInstrument } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DRAFT_KEY = 'makoki.riasec.draft.v1';

type Phase = 'loading' | 'intro' | 'questions' | 'submitting' | 'error';

interface LocalDraft {
  attemptId: string;
  instrumentId: string;
  currentIndex: number;
  answers: Record<string, number>;
  savedAt: string;
}

const readDraft = (): LocalDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(DRAFT_KEY);
    return null;
  }
};

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.code === 'RIASEC_INSTRUMENT_UNAVAILABLE') {
      return 'Aucun instrument RIASEC n’est actuellement ouvert aux passations.';
    }
    if (error.code === 'PERMISSION_DENIED') {
      return 'Ton compte ne possède pas encore l’autorisation nécessaire pour réaliser ce test.';
    }
    if (error.code === 'INCOMPLETE_RESPONSES') {
      return 'Toutes les affirmations doivent recevoir une réponse avant le calcul.';
    }
    return error.message;
  }
  return 'Le module RIASEC n’a pas pu être chargé.';
};

export default function RiasecTest() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [instrument, setInstrument] = useState<RiasecInstrument | null>(null);
  const [attempt, setAttempt] = useState<RiasecAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
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
            setCurrentIndex(Math.min(
              Math.max(draft.currentIndex || 0, 0),
              restored.instrument.itemCount - 1,
            ));
            setResumed(true);
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (phase !== 'questions' || !attempt || !instrument) return;
    const draft: LocalDraft = {
      attemptId: attempt.id,
      instrumentId: instrument.id,
      currentIndex,
      answers,
      savedAt: new Date().toISOString(),
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
      setResumed(false);
      setPhase('questions');
    } catch (caught) {
      setError(errorMessage(caught));
      setPhase('error');
    }
  };

  const chooseAnswer = (itemId: string, value: number) => {
    setAnswers((previous) => ({ ...previous, [itemId]: value }));
  };

  const goNext = () => {
    if (!instrument || selectedValue === undefined) return;
    setCurrentIndex((index) => Math.min(index + 1, instrument.itemCount - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
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
      navigate(`/orientation/results/${completion.result.id}`, { replace: true });
    } catch (caught) {
      setError(errorMessage(caught));
      setPhase('questions');
    }
  };

  const abandonDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setAttempt(null);
    setAnswers({});
    setCurrentIndex(0);
    setResumed(false);
    setPhase('intro');
  };

  // Navigation au clavier pendant la passation : les chiffres sélectionnent une
  // réponse sur l'échelle, les flèches et Entrée déplacent la personne. Sur
  // mobile ces raccourcis restent inertes ; ils accélèrent la saisie au clavier.
  useEffect(() => {
    if (phase !== 'questions' || !instrument || !currentItem) return;

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const numeric = Number(event.key);
      const option = instrument.responseScale.find((entry) => entry.value === numeric);
      if (option) {
        event.preventDefault();
        chooseAnswer(currentItem.id, option.value);
        return;
      }

      if ((event.key === 'ArrowRight' || event.key === 'Enter') && selectedValue !== undefined) {
        event.preventDefault();
        if (isLast) void submit();
        else goNext();
      }
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        event.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, instrument, currentItem, selectedValue, isLast, currentIndex]);

  if (phase === 'loading') {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-stone-50">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-emerald-700" />
          <p className="text-stone-600">Chargement de l’instrument RIASEC…</p>
        </div>
      </main>
    );
  }

  if (phase === 'error' || !instrument) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-2xl px-4 py-16">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" /> Module indisponible
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => void load()} className="bg-emerald-700 hover:bg-emerald-800">Réessayer</Button>
            <Button asChild variant="outline"><Link to="/tests">Retour aux tests</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button asChild variant="ghost" className="text-stone-600 hover:text-stone-900">
              <Link to="/tests"><ArrowLeft className="mr-2 h-4 w-4" />Tests</Link>
            </Button>
            <Button asChild variant="ghost" className="text-stone-600 hover:text-stone-900">
              <Link to="/orientation/results"><History className="mr-2 h-4 w-4" />Mes résultats</Link>
            </Button>
          </div>

          <Card className="overflow-hidden border border-stone-200 shadow-sm">
            {/* Accent unique aux couleurs du Congo, sans dégradé arc-en-ciel. */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-700" />
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-700 hover:bg-emerald-700">Holland / RIASEC</Badge>
                <Badge variant={instrument.status === 'active' ? 'secondary' : 'outline'}>
                  {instrument.status === 'active' ? 'Version active' : 'Version pilote'}
                </Badge>
              </div>
              <CardTitle className="font-heading text-3xl leading-tight sm:text-4xl">
                {instrument.title}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-stone-600">
                Réponds à {instrument.itemCount} affirmations pour explorer les environnements
                professionnels qui correspondent le mieux à tes intérêts actuels.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6 pt-0 sm:p-8 sm:pt-0">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <ClipboardCheck className="mb-2 h-6 w-6 text-emerald-700" />
                  <p className="font-semibold text-stone-900">{instrument.itemCount} affirmations</p>
                  <p className="text-sm text-stone-600">Environ 10 à 15 minutes.</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <ShieldCheck className="mb-2 h-6 w-6 text-emerald-700" />
                  <p className="font-semibold text-stone-900">Calcul côté serveur</p>
                  <p className="text-sm text-stone-600">Les clés de calcul ne sont jamais exposées au navigateur.</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <Save className="mb-2 h-6 w-6 text-amber-600" />
                  <p className="font-semibold text-stone-900">Reprise possible</p>
                  <p className="text-sm text-stone-600">Le brouillon reste sur ce navigateur et cet appareil.</p>
                </div>
              </div>

              <div>
                <p className="mb-3 font-semibold text-stone-900">Échelle de réponse</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {instrument.responseScale.map((option) => (
                    <div
                      key={option.value}
                      className="rounded-lg border border-stone-200 bg-white p-3 text-center text-sm"
                    >
                      <div className="font-bold text-emerald-700">{option.value}</div>
                      <div className="mt-1 text-stone-600">{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => void startNewAttempt()}
                className="w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"
              >
                Commencer la passation <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!attempt || !currentItem) return null;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        {resumed && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Save className="h-4 w-4 shrink-0" /> Brouillon local repris sur cet appareil.
          </div>
        )}
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Barre de progression collante : le repère reste visible au défilement. */}
        <div className="sticky top-0 z-10 -mx-4 border-b border-stone-200 bg-stone-50/90 px-4 py-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-stone-700">
              Affirmation {currentIndex + 1} / {instrument.itemCount}
            </span>
            <span className="text-stone-500">{answeredCount} répondue(s)</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progression : ${progress}%`}
          >
            <div className="h-full rounded-full bg-emerald-700 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="border border-stone-200 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="font-heading text-xl leading-relaxed text-stone-900 sm:text-2xl">
              {currentItem.prompt}
            </CardTitle>
            <CardDescription className="text-stone-500">
              Choisis la réponse qui te correspond le mieux aujourd’hui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-2.5" role="radiogroup" aria-label="Échelle de réponse">
              {instrument.responseScale.map((option) => {
                const selected = selectedValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => chooseAnswer(currentItem.id, option.value)}
                    className={`flex min-h-[3.25rem] items-center justify-between rounded-xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      selected
                        ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-200'
                        : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          selected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {option.value}
                      </span>
                      <span className="text-stone-800">{option.label}</span>
                    </span>
                    {selected ? <Check className="h-5 w-5 shrink-0 text-emerald-700" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <Button
                variant="outline"
                onClick={goPrevious}
                disabled={currentIndex === 0 || phase === 'submitting'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>

              {isLast ? (
                <Button
                  onClick={() => void submit()}
                  disabled={selectedValue === undefined || phase === 'submitting'}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  {phase === 'submitting'
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <ClipboardCheck className="mr-2 h-4 w-4" />}
                  Calculer mon résultat
                </Button>
              ) : (
                <Button
                  onClick={goNext}
                  disabled={selectedValue === undefined || phase === 'submitting'}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={abandonDraft}
            disabled={phase === 'submitting'}
            className="text-stone-500 hover:text-stone-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
          </Button>
          <span className="hidden items-center gap-1.5 text-xs text-stone-400 sm:flex">
            <Keyboard className="h-3.5 w-3.5" />
            Clavier : 1–{instrument.responseScale.length} pour répondre, ← → pour naviguer
          </span>
        </div>

        <p className="px-1 text-center text-xs leading-relaxed text-stone-400">
          Les réponses détaillées ne sont envoyées au serveur qu’à la soumission finale.
          Le brouillon intermédiaire reste dans ce navigateur.
        </p>
      </div>
    </main>
  );
}
