import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApplication, getApplicationHistory, withdrawApplication } from './api';
import { describeAtsError, type AtsErrorView } from './errors';
import { APPLICATION_STATE_LABELS } from './labels';
import { AtsCapabilityDisabled, AtsErrorState, AtsLoading } from './states';
import { useAtsCandidateCapability } from './useAtsCandidateCapability';
import { ATS_APPLICATION_TERMINAL_STATES, type AtsApplication, type AtsApplicationEvent } from './types';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const capability = useAtsCandidateCapability();
  const [application, setApplication] = useState<AtsApplication | null>(null);
  const [history, setHistory] = useState<AtsApplicationEvent[] | null>(null);
  const [error, setError] = useState<AtsErrorView | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(() => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    Promise.all([getApplication(applicationId), getApplicationHistory(applicationId)])
      .then(([loadedApplication, events]) => {
        setApplication(loadedApplication);
        setHistory(events);
      })
      .catch((caught) => setError(describeAtsError(caught)))
      .finally(() => setLoading(false));
  }, [applicationId]);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  const handleWithdraw = async () => {
    if (!application) return;
    setWithdrawing(true);
    setError(null);
    try {
      const { application: updated } = await withdrawApplication(application.id, application.version);
      setApplication(updated);
      setConfirmingWithdraw(false);
      load();
    } catch (caught) {
      setError(describeAtsError(caught));
    } finally {
      setWithdrawing(false);
    }
  };

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (!applicationId) return <AtsErrorState error={{ kind: 'not_found', message: "Cette candidature n'existe pas ou plus." }} />;
  if (loading) return <AtsLoading label="Chargement de la candidature…" />;
  if (error && !application) return <div className="container py-16"><AtsErrorState error={error} onRetry={load} /></div>;
  if (!application) return null;

  const canWithdraw = !ATS_APPLICATION_TERMINAL_STATES.includes(application.state);

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <Button variant="outline" asChild className="w-fit">
        <Link to="/mes-candidatures"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à mes candidatures</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{APPLICATION_STATE_LABELS[application.state]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-stone-600">
          <p>Déposée le {formatDateTime(application.submittedAt)}</p>
          <p>Mise à jour le {formatDateTime(application.updatedAt)}</p>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-amber-800" role="alert">{error.message}</p> : null}

      {history && history.length > 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-stone-900">Historique</h2>
          <ul className="mt-3 space-y-2">
            {history.map((event) => (
              <li key={event.id} className="flex items-center justify-between text-sm text-stone-700">
                <span>{APPLICATION_STATE_LABELS[event.to]}</span>
                <span className="text-stone-500">{formatDateTime(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {canWithdraw ? (
        confirmingWithdraw ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-amber-900">Confirmez-vous le retrait de cette candidature ? Cette action est définitive.</p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={() => setConfirmingWithdraw(false)} disabled={withdrawing}>
                Annuler
              </Button>
              <Button
                onClick={() => { void handleWithdraw(); }}
                disabled={withdrawing}
                className="bg-amber-700 hover:bg-amber-800"
              >
                {withdrawing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmer le retrait
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmingWithdraw(true)}>
            Retirer ma candidature
          </Button>
        )
      ) : null}
    </div>
  );
}
