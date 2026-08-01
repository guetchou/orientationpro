import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { closeJob, createJob, listJobs, publishJob } from './api';
import { describeAtsRecruiterError, type AtsRecruiterErrorView } from './errors';
import { AtsCapabilityDisabled, AtsEmpty, AtsErrorState, AtsLoading } from './states';
import { useAtsRecruiterCapability } from './useAtsRecruiterCapability';
import type { AtsJob, AtsJobStatus } from './types';

const STATUS_LABELS: Record<AtsJobStatus, string> = {
  draft: 'Brouillon',
  published: 'Publiée',
  closed: 'Clôturée',
};

const STATUS_VARIANT: Record<AtsJobStatus, 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  published: 'default',
  closed: 'outline',
};

export default function JobsDashboardPage() {
  const capability = useAtsRecruiterCapability();
  const [jobs, setJobs] = useState<AtsJob[] | null>(null);
  const [error, setError] = useState<AtsRecruiterErrorView | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionJobId, setActionJobId] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setJobs(null);
    listJobs()
      .then(setJobs)
      .catch((caught) => setError(describeAtsRecruiterError(caught)));
  }, []);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await createJob(title.trim(), description.trim());
      setTitle('');
      setDescription('');
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (job: AtsJob) => {
    setActionJobId(job.id);
    setError(null);
    try {
      await publishJob(job.id, job.version);
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setActionJobId(null);
    }
  };

  const handleClose = async (job: AtsJob) => {
    setActionJobId(job.id);
    setError(null);
    try {
      await closeJob(job.id, job.version);
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setActionJobId(null);
    }
  };

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (capability === 'error') {
    return (
      <div className="container py-16">
        <AtsErrorState error={{ kind: 'service_unavailable', message: 'Le service recrutement est indisponible.' }} />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl space-y-8 py-10">
      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-stone-900">
        <Briefcase className="h-6 w-6 text-emerald-700" /> Offres
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Créer une offre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => { void handleCreate(event); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Titre</Label>
              <Input id="job-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={4}
              />
            </div>
            <Button type="submit" disabled={creating} className="bg-emerald-700 hover:bg-emerald-800">
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Créer l’offre
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <AtsErrorState error={error} onRetry={load} /> : null}
      {!error && jobs === null ? <AtsLoading label="Chargement des offres…" /> : null}
      {!error && jobs?.length === 0 ? (
        <AtsEmpty title="Aucune offre" description="Créez votre première offre pour commencer à recevoir des candidatures." />
      ) : null}
      {!error && jobs && jobs.length > 0 ? (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                  <CardTitle className="text-base">
                    <Link to={`/recruteur/ats/offres/${job.id}/pipeline`} className="hover:underline">
                      {job.title}
                    </Link>
                  </CardTitle>
                  <Badge variant={STATUS_VARIANT[job.status]}>{STATUS_LABELS[job.status]}</Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <p className="line-clamp-2 max-w-md text-sm text-stone-600">{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/recruteur/ats/offres/${job.id}/equipe`}>Équipe</Link>
                    </Button>
                    {job.status === 'draft' ? (
                      <Button
                        size="sm"
                        onClick={() => { void handlePublish(job); }}
                        disabled={actionJobId === job.id}
                        className="bg-emerald-700 hover:bg-emerald-800"
                      >
                        {actionJobId === job.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Publier
                      </Button>
                    ) : null}
                    {job.status === 'published' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { void handleClose(job); }}
                        disabled={actionJobId === job.id}
                      >
                        {actionJobId === job.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Clôturer
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
