import { apiFetch } from '@/lib/apiClient';
import type { CapabilityRegistry } from './types';
import type {
  AdvisorDiagnosticInput,
  AdvisorEnvelope,
  AdvisorProjectSummary,
} from './advisor-types';
import { readPersistedRiasecProfile } from './riasec-profile';

export const LIFE_PROJECT_UPDATED_EVENT = 'makoki:life-project-updated';

const publishProjectUpdate = (envelope: AdvisorEnvelope) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent<AdvisorEnvelope>(LIFE_PROJECT_UPDATED_EVENT, { detail: envelope }));
  }
  return envelope;
};

const commandId = () => globalThis.crypto?.randomUUID?.()
  || `command-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getAdvisorCapabilityRegistry = () => apiFetch<CapabilityRegistry>(
  '/v1/capabilities',
  {},
  { auth: false },
);

export const listAdvisorProjects = () => apiFetch<{
  schemaVersion: string;
  projects: AdvisorProjectSummary[];
}>('/v1/life-projects');

export const getAdvisorProject = (projectId: string) => apiFetch<AdvisorEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}`,
);

export const createAdvisorProject = (title: string, purpose: string) => apiFetch<AdvisorEnvelope>(
  '/v1/life-projects',
  {
    method: 'POST',
    body: JSON.stringify({ title, purpose }),
  },
);

export const saveAdvisorDiagnostic = (
  projectId: string,
  persistenceVersion: number,
  diagnostic: AdvisorDiagnosticInput,
) => {
  const riasecProfile = readPersistedRiasecProfile();
  return apiFetch<AdvisorEnvelope>(
    `/v1/life-projects/${encodeURIComponent(projectId)}/diagnostic`,
    {
      method: 'PUT',
      headers: { 'If-Match': `"${persistenceVersion}"` },
      body: JSON.stringify({
        ...diagnostic,
        ...(riasecProfile ? { riasecResultId: riasecProfile.resultId } : {}),
      }),
    },
  );
};

export const generateAdvisorRecommendations = async (
  projectId: string,
  persistenceVersion: number,
  maximumScenarios = 5,
) => publishProjectUpdate(await apiFetch<AdvisorEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/recommendations`,
  {
    method: 'POST',
    headers: { 'If-Match': `"${persistenceVersion}"` },
    body: JSON.stringify({ maximumScenarios }),
  },
));

export const selectAdvisorScenario = async (
  envelope: AdvisorEnvelope,
  scenarioId: string,
): Promise<AdvisorEnvelope> => {
  const selected = await apiFetch<AdvisorEnvelope>(
    `/v1/life-projects/${encodeURIComponent(envelope.project.id)}/scenarios/${encodeURIComponent(scenarioId)}/select`,
    {
      method: 'POST',
      headers: { 'If-Match': `"${envelope.persistenceVersion}"` },
      body: JSON.stringify({
        commandId: commandId(),
        reason: 'Option retenue provisoirement dans le parcours Projet de vie.',
      }),
    },
  );

  if (selected.project.state !== 'comparison') return publishProjectUpdate(selected);

  const transitioned = await apiFetch<AdvisorEnvelope>(
    `/v1/life-projects/${encodeURIComponent(selected.project.id)}/transitions`,
    {
      method: 'POST',
      headers: { 'If-Match': `"${selected.persistenceVersion}"` },
      body: JSON.stringify({
        commandId: commandId(),
        to: 'provisional_choice',
        reason: 'Le choix reste provisoire jusqu’à vérification des conditions locales.',
      }),
    },
  );
  return publishProjectUpdate(transitioned);
};
