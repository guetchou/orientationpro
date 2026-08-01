import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createEvaluation, getApplication, getApplicationHistory, listEvaluations, transitionApplication } from './api';
import { describeAtsRecruiterError, type AtsRecruiterErrorView } from './errors';
import { APPLICATION_STATE_LABELS, EVALUATION_RECOMMENDATION_LABELS, REJECTION_REASON_CODE_LABELS } from './labels';
import { AtsCapabilityDisabled, AtsErrorState, AtsLoading } from './states';
import { useAtsRecruiterCapability } from './useAtsRecruiterCapability';
import {
  ATS_APPLICATION_TERMINAL_STATES,
  ATS_EVALUATION_RECOMMENDATIONS,
  ATS_REJECTION_REASON_CODES,
  type AtsApplication,
  type AtsApplicationEvent,
  type AtsApplicationState,
  type AtsEvaluation,
  type AtsEvaluationRecommendation,
  type AtsRejectionReasonCode,
} from './types';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

// Reflète exactement backend/src/ats-v1/workflow.js (TRANSITIONS), sans
// "withdrawn" (réservé au candidat, cf. ACTOR_RULES) : présentation
// défensive uniquement, le serveur reste la seule autorité sur la
// transition réellement acceptée.
const STAFF_TRANSITIONS: Record<AtsApplicationState, AtsApplicationState[]> = {
  submitted: ['under_review'],
  under_review: ['shortlisted', 'rejected'],
  shortlisted: ['interview_planned', 'rejected'],
  interview_planned: ['interview_completed', 'rejected'],
  interview_completed: ['offer_proposed', 'rejected'],
  offer_proposed: ['hired', 'rejected'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

export default function ApplicationReviewPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const capability = useAtsRecruiterCapability();
  const [application, setApplication] = useState<AtsApplication | null>(null);
  const [history, setHistory] = useState<AtsApplicationEvent[] | null>(null);
  const [evaluations, setEvaluations] = useState<AtsEvaluation[] | null>(null);
  const [error, setError] = useState<AtsRecruiterErrorView | null>(null);
  const [loading, setLoading] = useState(true);

  const [nextState, setNextState] = useState<AtsApplicationState | ''>('');
  const [reason, setReason] = useState('');
  const [reasonCode, setReasonCode] = useState<AtsRejectionReasonCode | ''>('');
  const [transitioning, setTransitioning] = useState(false);

  const [recommendation, setRecommendation] = useState<AtsEvaluationRecommendation | ''>('');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  const load = useCallback(() => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getApplication(applicationId),
      getApplicationHistory(applicationId),
      listEvaluations(applicationId),
    ])
      .then(([loadedApplication, events, loadedEvaluations]) => {
        setApplication(loadedApplication);
        setHistory(events);
        setEvaluations(loadedEvaluations);
      })
      .catch((caught) => setError(describeAtsRecruiterError(caught)))
      .finally(() => setLoading(false));
  }, [applicationId]);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  const handleTransition = async (event: FormEvent) => {
    event.preventDefault();
    if (!application || !nextState) return;
    setTransitioning(true);
    setError(null);
    try {
      await transitionApplication(application.id, {
        to: nextState,
        expectedVersion: application.version,
        ...(nextState === 'rejected' ? { reason, reasonCode } : {}),
      });
      setNextState('');
      setReason('');
      setReasonCode('');
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setTransitioning(false);
    }
  };

  const handleEvaluate = async (event: FormEvent) => {
    event.preventDefault();
    if (!application || !recommendation) return;
    setSubmittingEvaluation(true);
    setError(null);
    try {
      await createEvaluation(application.id, {
        recommendation,
        ...(rating ? { rating: Number(rating) } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setRecommendation('');
      setRating('');
      setNote('');
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (!applicationId) return <AtsErrorState error={{ kind: 'not_found', message: "Cette candidature n'existe pas ou plus." }} />;
  if (loading) return <AtsLoading label="Chargement de la candidature…" />;
  if (error && !application) return <div className="container py-16"><AtsErrorState error={error} onRetry={load} /></div>;
  if (!application) return null;

  const isTerminal = ATS_APPLICATION_TERMINAL_STATES.includes(application.state);

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <Button variant="outline" asChild className="w-fit">
        <Link to={`/recruteur/ats/offres/${application.jobId}/pipeline`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au pipeline
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>{APPLICATION_STATE_LABELS[application.state]}</CardTitle>
          <Badge variant="outline">Version {application.version}</Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-stone-600">
          <p>Candidat : {application.candidateAccountId}</p>
          <p>Déposée le {formatDateTime(application.submittedAt)}</p>
          <p>Mise à jour le {formatDateTime(application.updatedAt)}</p>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-amber-800" role="alert">{error.message}</p> : null}

      {!isTerminal ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faire évoluer la candidature</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => { void handleTransition(event); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transition-next-state">Nouvel état</Label>
                <Select value={nextState} onValueChange={(value) => setNextState(value as AtsApplicationState)}>
                  <SelectTrigger id="transition-next-state" className="w-64">
                    <SelectValue placeholder="Choisir un état" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_TRANSITIONS[application.state].map((state) => (
                      <SelectItem key={state} value={state}>{APPLICATION_STATE_LABELS[state]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {nextState === 'rejected' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason-code">Motif de rejet</Label>
                    <Select value={reasonCode} onValueChange={(value) => setReasonCode(value as AtsRejectionReasonCode)}>
                      <SelectTrigger id="rejection-reason-code" className="w-72">
                        <SelectValue placeholder="Choisir un motif" />
                      </SelectTrigger>
                      <SelectContent>
                        {ATS_REJECTION_REASON_CODES.map((code) => (
                          <SelectItem key={code} value={code}>{REJECTION_REASON_CODE_LABELS[code]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Détail (visible en interne uniquement)</Label>
                    <Textarea
                      id="rejection-reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                </>
              ) : null}

              <Button
                type="submit"
                disabled={!nextState || transitioning || (nextState === 'rejected' && (!reason.trim() || !reasonCode))}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                {transitioning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Appliquer
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {history && history.length > 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-stone-900">Historique</h2>
          <ul className="mt-3 space-y-2">
            {history.map((event) => (
              <li key={event.id} className="flex items-center justify-between text-sm text-stone-700">
                <span>
                  {APPLICATION_STATE_LABELS[event.to]}
                  {event.reasonCode ? ` — ${REJECTION_REASON_CODE_LABELS[event.reasonCode as AtsRejectionReasonCode] ?? event.reasonCode}` : ''}
                </span>
                <span className="text-stone-500">{formatDateTime(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évaluation interne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={(event) => { void handleEvaluate(event); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="evaluation-recommendation">Recommandation</Label>
              <Select
                value={recommendation}
                onValueChange={(value) => setRecommendation(value as AtsEvaluationRecommendation)}
              >
                <SelectTrigger id="evaluation-recommendation" className="w-56">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {ATS_EVALUATION_RECOMMENDATIONS.map((option) => (
                    <SelectItem key={option} value={option}>{EVALUATION_RECOMMENDATION_LABELS[option]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evaluation-rating">Note (1 à 5, facultatif)</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="evaluation-rating" className="w-32">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evaluation-note">Note interne (facultatif, jamais visible du candidat)</Label>
              <Textarea id="evaluation-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
            </div>
            <Button
              type="submit"
              disabled={!recommendation || submittingEvaluation}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {submittingEvaluation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer l’évaluation
            </Button>
          </form>

          {evaluations && evaluations.length > 0 ? (
            <ul className="space-y-3 border-t border-stone-200 pt-4">
              {evaluations.map((evaluation) => (
                <li key={evaluation.id} className="rounded-xl border border-stone-200 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-900">
                      {EVALUATION_RECOMMENDATION_LABELS[evaluation.recommendation]}
                      {evaluation.rating ? ` — ${evaluation.rating}/5` : ''}
                    </span>
                    <span className="text-stone-500">{formatDateTime(evaluation.occurredAt)}</span>
                  </div>
                  {evaluation.note ? <p className="mt-2 text-stone-700">{evaluation.note}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
