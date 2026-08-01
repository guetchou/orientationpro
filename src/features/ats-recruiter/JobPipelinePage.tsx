import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getJob, listApplicationsForJob } from './api';
import { describeAtsRecruiterError, type AtsRecruiterErrorView } from './errors';
import { APPLICATION_STATE_LABELS } from './labels';
import { AtsCapabilityDisabled, AtsEmpty, AtsErrorState, AtsLoading } from './states';
import { useAtsRecruiterCapability } from './useAtsRecruiterCapability';
import type { AtsApplication, AtsApplicationState, AtsJob } from './types';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium' }).format(new Date(value));

const APPLICATION_STATES = Object.keys(APPLICATION_STATE_LABELS) as AtsApplicationState[];

export default function JobPipelinePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const capability = useAtsRecruiterCapability();
  const [job, setJob] = useState<AtsJob | null>(null);
  const [applications, setApplications] = useState<AtsApplication[] | null>(null);
  const [error, setError] = useState<AtsRecruiterErrorView | null>(null);
  const [stateFilter, setStateFilter] = useState<AtsApplicationState | 'all'>('all');
  const [emailFilter, setEmailFilter] = useState('');

  const load = useCallback(() => {
    if (!jobId) return;
    setError(null);
    setApplications(null);
    Promise.all([
      getJob(jobId),
      listApplicationsForJob(jobId, {
        state: stateFilter === 'all' ? undefined : stateFilter,
        candidateEmail: emailFilter.trim() || undefined,
      }),
    ])
      .then(([loadedJob, loadedApplications]) => {
        setJob(loadedJob);
        setApplications(loadedApplications);
      })
      .catch((caught) => setError(describeAtsRecruiterError(caught)));
  }, [jobId, stateFilter, emailFilter]);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (!jobId) return <AtsErrorState error={{ kind: 'not_found', message: "Cette offre n'existe pas ou plus." }} />;

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <Button variant="outline" asChild className="w-fit">
        <Link to="/recruteur/ats/offres"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux offres</Link>
      </Button>

      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-stone-900">
        <ClipboardList className="h-6 w-6 text-emerald-700" /> {job?.title || 'Pipeline'}
      </h1>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="pipeline-state-filter">État</Label>
            <Select value={stateFilter} onValueChange={(value) => setStateFilter(value as AtsApplicationState | 'all')}>
              <SelectTrigger id="pipeline-state-filter" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                {APPLICATION_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{APPLICATION_STATE_LABELS[state]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pipeline-email-filter">Email candidat</Label>
            <Input
              id="pipeline-email-filter"
              type="email"
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
              placeholder="candidat@example.com"
              className="w-64"
            />
          </div>
        </CardContent>
      </Card>

      {error ? <AtsErrorState error={error} onRetry={load} /> : null}
      {!error && applications === null ? <AtsLoading label="Chargement des candidatures…" /> : null}
      {!error && applications?.length === 0 ? (
        <AtsEmpty title="Aucune candidature" description="Aucune candidature ne correspond à ces critères." />
      ) : null}
      {!error && applications && applications.length > 0 ? (
        <ul className="space-y-3">
          {applications.map((application) => (
            <li key={application.id}>
              <Link to={`/recruteur/ats/candidatures/${application.id}`}>
                <Card className="transition hover:border-emerald-300">
                  <CardHeader>
                    <CardTitle className="text-base">{APPLICATION_STATE_LABELS[application.state]}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-stone-600">
                    Déposée le {formatDate(application.submittedAt)}
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
