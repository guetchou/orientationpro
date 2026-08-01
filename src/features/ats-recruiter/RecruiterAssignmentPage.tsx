import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { assignRecruiter, getJob, listJobRecruiters, removeRecruiter } from './api';
import { describeAtsRecruiterError, type AtsRecruiterErrorView } from './errors';
import { AtsCapabilityDisabled, AtsEmpty, AtsErrorState, AtsLoading } from './states';
import { useAtsRecruiterCapability } from './useAtsRecruiterCapability';
import type { AtsJob, AtsRecruiterAssignment } from './types';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('fr-CG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function RecruiterAssignmentPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const capability = useAtsRecruiterCapability();
  const [job, setJob] = useState<AtsJob | null>(null);
  const [recruiters, setRecruiters] = useState<AtsRecruiterAssignment[] | null>(null);
  const [error, setError] = useState<AtsRecruiterErrorView | null>(null);
  const [recruiterAccountId, setRecruiterAccountId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removingAccountId, setRemovingAccountId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!jobId) return;
    setError(null);
    setRecruiters(null);
    Promise.all([getJob(jobId), listJobRecruiters(jobId)])
      .then(([loadedJob, loadedRecruiters]) => {
        setJob(loadedJob);
        setRecruiters(loadedRecruiters);
      })
      .catch((caught) => setError(describeAtsRecruiterError(caught)));
  }, [jobId]);

  useEffect(() => {
    if (capability === 'enabled') load();
  }, [capability, load]);

  const handleAssign = async (event: FormEvent) => {
    event.preventDefault();
    if (!jobId || !recruiterAccountId.trim()) return;
    setAssigning(true);
    setError(null);
    try {
      await assignRecruiter(jobId, recruiterAccountId.trim());
      setRecruiterAccountId('');
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (accountId: string) => {
    if (!jobId) return;
    setRemovingAccountId(accountId);
    setError(null);
    try {
      await removeRecruiter(jobId, accountId);
      load();
    } catch (caught) {
      setError(describeAtsRecruiterError(caught));
    } finally {
      setRemovingAccountId(null);
    }
  };

  if (capability === 'loading') return <AtsLoading label="Chargement…" />;
  if (capability === 'disabled') return <AtsCapabilityDisabled />;
  if (!jobId) return <AtsErrorState error={{ kind: 'not_found', message: "Cette offre n'existe pas ou plus." }} />;

  return (
    <div className="container max-w-2xl space-y-6 py-10">
      <Button variant="outline" asChild className="w-fit">
        <Link to="/recruteur/ats/offres"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux offres</Link>
      </Button>

      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-stone-900">
        <Users className="h-6 w-6 text-emerald-700" /> Équipe — {job?.title || 'Offre'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Affecter un recruteur</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => { void handleAssign(event); }} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="recruiter-account-id">Identifiant du compte recruteur</Label>
              <Input
                id="recruiter-account-id"
                value={recruiterAccountId}
                onChange={(event) => setRecruiterAccountId(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={assigning} className="bg-emerald-700 hover:bg-emerald-800">
              {assigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Affecter
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? <AtsErrorState error={error} onRetry={load} /> : null}
      {!error && recruiters === null ? <AtsLoading label="Chargement de l’équipe…" /> : null}
      {!error && recruiters?.length === 0 ? (
        <AtsEmpty title="Aucun recruteur affecté" description="Affectez un recruteur pour lui donner accès au pipeline de cette offre." />
      ) : null}
      {!error && recruiters && recruiters.length > 0 ? (
        <ul className="space-y-3">
          {recruiters.map((assignment) => (
            <li key={assignment.recruiterAccountId}>
              <Card>
                <CardContent className="flex items-center justify-between gap-3 pt-6">
                  <div className="text-sm">
                    <p className="font-medium text-stone-900">{assignment.recruiterAccountId}</p>
                    <p className="text-stone-500">Affecté le {formatDateTime(assignment.assignedAt)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { void handleRemove(assignment.recruiterAccountId); }}
                    disabled={removingAccountId === assignment.recruiterAccountId}
                  >
                    {removingAccountId === assignment.recruiterAccountId
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <X className="mr-2 h-4 w-4" />}
                    Retirer
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
