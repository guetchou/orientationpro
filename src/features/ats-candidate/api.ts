import { apiFetch } from '@/lib/apiClient';
import type {
  AtsApplication,
  AtsApplicationEvent,
  AtsJob,
  CapabilityRegistry,
} from './types';

const BASE = '/v1/ats';

export const getCapabilityRegistry = () => apiFetch<CapabilityRegistry>(
  '/v1/capabilities',
  {},
  { auth: false },
);

// Le serveur ne renvoie déjà que les offres visibles par le compte authentifié
// (publiées pour n'importe quel candidat). Le filtre client est une couche de
// présentation défensive, jamais la frontière d'autorisation.
export const listPublishedJobs = async (): Promise<AtsJob[]> => {
  const page = await apiFetch<{ schemaVersion: string; jobs: AtsJob[] }>(`${BASE}/jobs`);
  return page.jobs.filter((job) => job.status === 'published');
};

export const getJob = async (jobId: string): Promise<AtsJob> => {
  const payload = await apiFetch<{ schemaVersion: string; job: AtsJob }>(
    `${BASE}/jobs/${encodeURIComponent(jobId)}`,
  );
  return payload.job;
};

export const depositApplication = (
  jobId: string,
  cvAnalysisId?: string,
): Promise<{ application: AtsApplication; event: AtsApplicationEvent }> => apiFetch(
  `${BASE}/jobs/${encodeURIComponent(jobId)}/applications`,
  {
    method: 'POST',
    body: JSON.stringify(cvAnalysisId ? { cvAnalysisId } : {}),
  },
);

export const listMyApplications = async (): Promise<AtsApplication[]> => {
  const payload = await apiFetch<{ schemaVersion: string; applications: AtsApplication[] }>(
    `${BASE}/my/applications`,
  );
  return payload.applications;
};

export const getApplication = async (applicationId: string): Promise<AtsApplication> => {
  const payload = await apiFetch<{ schemaVersion: string; application: AtsApplication }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}`,
  );
  return payload.application;
};

export const getApplicationHistory = async (applicationId: string): Promise<AtsApplicationEvent[]> => {
  const payload = await apiFetch<{ schemaVersion: string; events: AtsApplicationEvent[] }>(
    `${BASE}/applications/${encodeURIComponent(applicationId)}/history`,
  );
  return payload.events;
};

// Le retrait ne demande jamais de motif (règle backend : withdraw n'exige pas
// de "reason"). N'ajoutez pas ce champ sans un besoin métier réel.
export const withdrawApplication = (
  applicationId: string,
  expectedVersion: number,
): Promise<{ application: AtsApplication; event: AtsApplicationEvent }> => apiFetch(
  `${BASE}/applications/${encodeURIComponent(applicationId)}/transitions`,
  {
    method: 'POST',
    body: JSON.stringify({ to: 'withdrawn', expectedVersion }),
  },
);
