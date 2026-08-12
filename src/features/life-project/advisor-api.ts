import { apiFetch } from '@/lib/apiClient';
import type { CapabilityRegistry } from './types';
import type {
  AdvisorDiagnosticInput,
  AdvisorEnvelope,
  AdvisorObjective,
  AdvisorProjectSummary,
  AdvisorRecommendationScenario,
} from './advisor-types';
import { readPersistedRiasecProfile } from './riasec-profile';

export const LIFE_PROJECT_UPDATED_EVENT = 'makoki:life-project-updated';

const scenarioMatchesObjective = (
  scenario: AdvisorRecommendationScenario,
  objective: AdvisorObjective | undefined,
) => {
  if (!objective) return true;

  if (scenario.category === 'entrepreneurship') {
    return objective === 'entrepreneurship';
  }

  if (scenario.category === 'bridge') {
    return ['insertion', 'reentry', 'work_and_training'].includes(objective);
  }

  return true;
};

const keepOnlyContextualRecommendations = (envelope: AdvisorEnvelope): AdvisorEnvelope => {
  const recommendation = envelope.project.recommendation;
  const objective = envelope.project.diagnostic?.objective;
  if (!recommendation || !objective) return envelope;

  const scenarios = recommendation.scenarios.filter((scenario) => scenarioMatchesObjective(scenario, objective));
  if (scenarios.length === recommendation.scenarios.length) return envelope;

  return {
    ...envelope,
    project: {
      ...envelope.project,
      recommendation: {
        ...recommendation,
        scenarios,
      },
    },
  };
};

const publishProjectUpdate = (envelope: AdvisorEnvelope) => {
  const contextualEnvelope = keepOnlyContextualRecommendations(envelope);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent<AdvisorEnvelope>(LIFE_PROJECT_UPDATED_EVENT, { detail: contextualEnvelope }));
  }
  return contextualEnvelope;
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

export const getAdvisorProject = async (projectId: string) => publishProjectUpdate(await apiFetch<AdvisorEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}`,
));

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
