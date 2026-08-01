import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getJob, listMyApplications } from './api';
import { describeAtsError, type AtsErrorView } from './errors';
import { APPLICATION_STATE_LABELS } from './labels';
import { AtsCapabilityDisabled, AtsEmpty, AtsErrorState, AtsLoading } from './states';
import { useAtsCandidateCapability } from './useAtsCandidateCapability';
import type { AtsApplication } from './types';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium' }).format(new Date(value));

export default function MyApplicationsPage() {
  const capability = useAtsCandidateCapability();
  const [applications, setApplications] = useState<AtsApplication[] | null>(null);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState<AtsErrorView | null>(null);

  const load = useCallback(() => {
    setError(null);
    setApplications(null);
    listMyApplications()
      .then(async (loaded) => {
        setApplications(loaded);
        const uniqueJobIds = [...new Set(loaded.map((application) => application.jobId))];
        const entries = await Promise.all(uniqueJobIds.map(async (jobId) => {
          try {
            const job = await getJob(jobId);
            return [jobId, job.title] as const;
          } catch {
            return [jobId, 'Offre'] as const;
          }
        }));
        setJobTitles(Object.fromEntries(entries));
      })
      .catch((caught) => setError(describeAtsError(caught)));
  }, []);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-stone-900">
        <ClipboardList className="h-6 w-6 text-emerald-700" /> Mes candidatures
      </h1>

      {error ? <AtsErrorState error={error} onRetry={load} /> : null}
      {!error && applications === null ? <AtsLoading label="Chargement de vos candidatures…" /> : null}
      {!error && applications?.length === 0 ? (
        <AtsEmpty
          title="Aucune candidature"
          description="Vous n’avez encore déposé aucune candidature."
          action={<Link to="/offres" className="text-emerald-700 hover:underline">Parcourir les offres</Link>}
        />
      ) : null}
      {!error && applications && applications.length > 0 ? (
        <ul className="space-y-3">
          {applications.map((application) => (
            <li key={application.id}>
              <Link to={`/mes-candidatures/${application.id}`}>
                <Card className="transition hover:border-emerald-300">
                  <CardHeader>
                    <CardTitle>{jobTitles[application.jobId] || 'Offre'}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-stone-600">
                    <span>{APPLICATION_STATE_LABELS[application.state]}</span>
                    <span>Déposée le {formatDate(application.submittedAt)}</span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
