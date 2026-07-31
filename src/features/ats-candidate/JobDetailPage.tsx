import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationForm } from './ApplicationForm';
import { getJob, listMyApplications } from './api';
import { describeAtsError, type AtsErrorView } from './errors';
import { AtsCapabilityDisabled, AtsErrorState, AtsLoading } from './states';
import { useAtsCandidateCapability } from './useAtsCandidateCapability';
import type { AtsApplication, AtsJob } from './types';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const capability = useAtsCandidateCapability();
  const [job, setJob] = useState<AtsJob | null>(null);
  const [existingApplication, setExistingApplication] = useState<AtsApplication | null>(null);
  const [error, setError] = useState<AtsErrorView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    Promise.all([getJob(jobId), listMyApplications()])
      .then(([loadedJob, applications]) => {
        setJob(loadedJob);
        setExistingApplication(applications.find((application) => application.jobId === jobId) ?? null);
      })
      .catch((caught) => setError(describeAtsError(caught)))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (!jobId) return <AtsErrorState error={{ kind: 'not_found', message: "Cette offre n'existe pas ou plus." }} />;
  if (loading) return <AtsLoading label="Chargement de l’offre…" />;
  if (error) return <div className="container py-16"><AtsErrorState error={error} onRetry={load} /></div>;
  if (!job) return null;

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <Button variant="outline" asChild className="w-fit">
        <Link to="/offres"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux offres</Link>
      </Button>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h1 className="font-heading text-2xl font-semibold text-stone-900">{job.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-stone-700">{job.description}</p>
      </div>

      {existingApplication ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          <p>Vous avez déjà déposé une candidature pour cette offre.</p>
          <Button asChild variant="outline" className="mt-3">
            <Link to={`/mes-candidatures/${existingApplication.id}`}>Voir ma candidature</Link>
          </Button>
        </div>
      ) : (
        <ApplicationForm
          jobId={job.id}
          onDeposited={(application) => navigate(`/mes-candidatures/${application.id}`)}
        />
      )}
    </div>
  );
}
