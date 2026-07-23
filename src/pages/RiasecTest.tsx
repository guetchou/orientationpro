import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  History,
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

  if (phase === 'loading') {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-emerald-700" />
          <p className="text-gray-600">Chargement de l’instrument RIASEC…</p>
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
          <CardContent className="flex gap-3">
            <Button onClick={() => void load()}>Réessayer</Button>
            <Button asChild variant="outline"><Link to="/tests">Retour aux tests</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (phase === 'intro') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Button asChild variant="ghost"><Link to="/tests"><ArrowLeft className="mr-2 h-4 w-4" />Tests</Link></Button>
            <Button asChild variant="outline"><Link to="/orientation/results"><History className="mr-2 h-4 w-4" />Mes résultats</Link></Button>
          </div>
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600" />
            <CardHeader className="space-y-4 p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">Holland / RIASEC</Badge>
                <Badge variant={instrument.status === 'active' ? 'default' : 'outline'}>
                  {instrument.status === 'active' ? 'Version active' : 'Version pilote'}
                </Badge>
              </div>
              <CardTitle className="text-4xl">{instrument.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Réponds à {instrument.itemCount} affirmations pour explorer les environnements professionnels qui correspondent le mieux à tes intérêts actuels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <ClipboardCheck className="mb-2 h-6 w-6 text-emerald-700" />
                  <p className="font-semibold">{instrument.itemCount} affirmations</p>
                  <p className="text-sm text-gray-600">Environ 10 à 15 minutes.</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <ShieldCheck className="mb-2 h-6 w-6 text-blue-700" />
                  <p className="font-semibold">Calcul côté serveur</p>
                  <p className="text-sm text-gray-600">Les clés de calcul ne sont pas exposées au navigateur.</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <Save className="mb-2 h-6 w-6 text-amber-700" />
                  <p className="font-semibold">Brouillon local</p>
                  <p className="text-sm text-gray-600">La reprise fonctionne sur ce navigateur et cet appareil.</p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-900">À lire avant de commencer</p>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">{instrument.disclaimer}</p>
              </div>

              <div>
                <p className="mb-3 font-semibold">Échelle de réponse</p>
                <div className="grid gap-2 sm:grid-cols-5">
                  {instrument.responseScale.map((option) => (
                    <div key={option.value} className="rounded-lg border bg-white p-3 text-center text-sm">
                      <div className="font-bold text-emerald-700">{option.value}</div>
                      <div className="mt-1 text-gray-600">{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button size="lg" onClick={() => void startNewAttempt()}>
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        {resumed && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <Save className="h-4 w-4" /> Brouillon local repris sur cet appareil.
          </div>
        )}
        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
              <span>Affirmation {currentIndex + 1} sur {instrument.itemCount}</span>
              <span>{answeredCount} réponse(s) enregistrée(s) localement</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200" aria-label={`Progression ${progress}%`}>
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <CardTitle className="pt-4 text-2xl leading-relaxed">{currentItem.prompt}</CardTitle>
            <CardDescription>Choisis la réponse qui te correspond le mieux aujourd’hui.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              {instrument.responseScale.map((option) => {
                const selected = selectedValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => chooseAnswer(currentItem.id, option.value)}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                    aria-pressed={selected}
                  >
                    <span><strong className="mr-3 text-emerald-700">{option.value}</strong>{option.label}</span>
                    {selected ? <Check className="h-5 w-5 text-emerald-700" /> : null}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <div className="flex gap-2">
                <Button variant="outline" onClick={goPrevious} disabled={currentIndex === 0 || phase === 'submitting'}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
                <Button variant="ghost" onClick={abandonDraft} disabled={phase === 'submitting'}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Recommencer
                </Button>
              </div>

              {isLast ? (
                <Button onClick={() => void submit()} disabled={selectedValue === undefined || phase === 'submitting'}>
                  {phase === 'submitting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
                  Calculer mon résultat
                </Button>
              ) : (
                <Button onClick={goNext} disabled={selectedValue === undefined || phase === 'submitting'}>
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          Les réponses détaillées sont envoyées au serveur uniquement lors de la soumission finale. Le brouillon intermédiaire reste dans ce navigateur.
        </p>
      </div>
    </main>
  );
}
