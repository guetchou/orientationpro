import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listPublishedJobs } from './api';
import { describeAtsError, type AtsErrorView } from './errors';
import { AtsCapabilityDisabled, AtsEmpty, AtsErrorState, AtsLoading } from './states';
import { useAtsCandidateCapability } from './useAtsCandidateCapability';
import type { AtsJob } from './types';

export default function JobListPage() {
  const capability = useAtsCandidateCapability();
  const [jobs, setJobs] = useState<AtsJob[] | null>(null);
  const [error, setError] = useState<AtsErrorView | null>(null);

  const load = useCallback(() => {
    setError(null);
    setJobs(null);
    listPublishedJobs()
      .then(setJobs)
      .catch((caught) => setError(describeAtsError(caught)));
  }, []);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (capability === 'error') {
    return (
      <div className="container py-16">
        <AtsErrorState error={{ kind: 'service_unavailable', message: 'Le service candidature est indisponible.' }} />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-stone-900">
        <Briefcase className="h-6 w-6 text-emerald-700" /> Offres publiées
      </h1>

      {error ? <AtsErrorState error={error} onRetry={load} /> : null}
      {!error && jobs === null ? <AtsLoading label="Chargement des offres…" /> : null}
      {!error && jobs?.length === 0 ? (
        <AtsEmpty title="Aucune offre publiée" description="Revenez plus tard : aucune offre n’est ouverte aux candidatures pour le moment." />
      ) : null}
      {!error && jobs && jobs.length > 0 ? (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Link to={`/offres/${job.id}`} className="hover:underline">{job.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-stone-600">{job.description}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
