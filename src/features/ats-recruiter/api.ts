import { apiFetch } from '@/lib/apiClient';
import type {
  AtsApplication,
  AtsApplicationEvent,
  AtsEvaluation,
  AtsEvaluationRecommendation,
  AtsJob,
  AtsJobEvent,
  AtsRecruiterAssignment,
  AtsApplicationState,
  CapabilityRegistry,
} from './types';

const BASE = '/v1/ats';

export const getCapabilityRegistry = () => apiFetch<CapabilityRegistry>(
  '/v1/capabilities',
  {},
  { auth: false },
);

// Le serveur borne déjà la liste par rôle/organisation (admin: tout, manager:
// son organisation, recruteur: ses offres affectées) — aucun filtre client ici.
export const listJobs = async (): Promise<AtsJob[]> => {
  const payload = await apiFetch<{ schemaVersion: string; jobs: AtsJob[] }>(`${BASE}/jobs`);
  return payload.jobs;
};

export const getJob = async (jobId: string): Promise<AtsJob> => {
  const payload = await apiFetch<{ schemaVersion: string; job: AtsJob }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}`,
  );
  return payload.job;
};

export const createJob = async (title: string, description: string): Promise<AtsJob> => {
  const payload = await apiFetch<{ schemaVersion: string; job: AtsJob }>(`${BASE}/jobs`, {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
  return payload.job;
};

export const publishJob = async (jobId: string, expectedVersion: number): Promise<AtsJob> => {
  const payload = await apiFetch<{ schemaVersion: string; job: AtsJob }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}/publish`,
    { method: 'POST', body: JSON.stringify({ expectedVersion }) },
  );
  return payload.job;
};

export const closeJob = async (jobId: string, expectedVersion: number): Promise<AtsJob> => {
  const payload = await apiFetch<{ schemaVersion: string; job: AtsJob }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}/close`,
    { method: 'POST', body: JSON.stringify({ expectedVersion }) },
  );
  return payload.job;
};

export interface PipelineFilters {
  state?: AtsApplicationState;
  candidateEmail?: string;
}

export const listApplicationsForJob = async (
  jobId: string,
  filters: PipelineFilters = {},
): Promise<AtsApplication[]> => {
  const params = new URLSearchParams();
  if (filters.state) params.set('state', filters.state);
  if (filters.candidateEmail) params.set('candidateEmail', filters.candidateEmail);
  const query = params.toString();
  const payload = await apiFetch<{ schemaVersion: string; applications: AtsApplication[] }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}/applications${query ? `?${query}` : ''}`,
  );
  return payload.applications;
};

export const listJobEvents = async (jobId: string): Promise<AtsJobEvent[]> => {
  const payload = await apiFetch<{ schemaVersion: string; events: AtsJobEvent[] }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}/events`,
  );
  return payload.events;
};

export const listJobRecruiters = async (jobId: string): Promise<AtsRecruiterAssignment[]> => {
  const payload = await apiFetch<{ schemaVersion: string; recruiters: AtsRecruiterAssignment[] }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}/recruiters`,
  );
  return payload.recruiters;
};

export const assignRecruiter = (jobId: string, recruiterAccountId: string): Promise<void> => apiFetch(
  `${BASE}/jobs/${encodeURIComponent(jobId)}/recruiters`,
  { method: 'POST', body: JSON.stringify({ recruiterAccountId }) },
);

export const removeRecruiter = (jobId: string, recruiterAccountId: string): Promise<void> => apiFetch(
  `${BASE}/jobs/${encodeURIComponent(jobId)}/recruiters/${encodeURIComponent(recruiterAccountId)}`,
  { method: 'DELETE' },
);

export const getApplication = async (applicationId: string): Promise<AtsApplication> => {
  const payload = await apiFetch<{ schemaVersion: string; application: AtsApplication }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}`,
  );
  return payload.application;
};

// Vue recruteur : historique complet, non expurgé (le serveur ne redacte que
// pour le candidat propriétaire).
export const getApplicationHistory = async (applicationId: string): Promise<AtsApplicationEvent[]> => {
  const payload = await apiFetch<{ schemaVersion: string; events: AtsApplicationEvent[] }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}/history`,
  );
  return payload.events;
};

export interface TransitionCommand {
  to: AtsApplicationState;
  expectedVersion: number;
  reason?: string;
  reasonCode?: string;
}

export const transitionApplication = (
  applicationId: string,
  command: TransitionCommand,
): Promise<{ application: AtsApplication; event: AtsApplicationEvent }> => apiFetch(
  `${BASE}/applications/${encodeURIComponent(applicationId)}/transitions`,
  { method: 'POST', body: JSON.stringify(command) },
);

export const listEvaluations = async (applicationId: string): Promise<AtsEvaluation[]> => {
  const payload = await apiFetch<{ schemaVersion: string; evaluations: AtsEvaluation[] }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}/evaluations`,
  );
  return payload.evaluations;
};

export interface CreateEvaluationCommand {
  recommendation: AtsEvaluationRecommendation;
  rating?: number;
  note?: string;
}

export const createEvaluation = async (
  applicationId: string,
  command: CreateEvaluationCommand,
): Promise<AtsEvaluation> => {
  const payload = await apiFetch<{ schemaVersion: string; evaluation: AtsEvaluation }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}/evaluations`,
    { method: 'POST', body: JSON.stringify(command) },
  );
  return payload.evaluation;
};
