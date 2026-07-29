import { apiFetch } from '@/lib/apiClient';
import type {
  Capability,
  LifeProjectSummary,
  LoadedLifeProject,
  TriageInput,
} from './types';

interface CapabilityRegistry {
  schemaVersion: string;
  configurationValid: boolean;
  capabilities: Capability[];
}

export const getLifeProjectCapability = async () => {
  const registry = await apiFetch<CapabilityRegistry>(
    '/v1/capabilities',
    {},
    { auth: false },
  );
  return registry.capabilities.find((entry) => entry.id === 'life-project.core-v1') ?? null;
};

export const listLifeProjects = async () => {
  const response = await apiFetch<{
    schemaVersion: string;
    projects: LifeProjectSummary[];
  }>('/v1/life-projects');
  return response.projects;
};

export const getLifeProject = (projectId: string) =>
  apiFetch<LoadedLifeProject>(`/v1/life-projects/${encodeURIComponent(projectId)}`);

export const createLifeProject = (input: TriageInput) =>
  apiFetch<LoadedLifeProject>('/v1/life-projects', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      purpose: input.need,
      missingInformation: [
        'Les contraintes personnelles et matérielles',
        'Les compétences et expériences utiles',
        'Les possibilités locales à vérifier',
      ],
      uncertainty: {
        level: 'high',
        reasons: ['Le projet débute à partir d’informations déclarées.'],
      },
      provenanceNotes: `Situation déclarée : ${input.situation}. Besoin déclaré : ${input.need}.`,
    }),
  });

export const addInitialScenario = (
  loaded: LoadedLifeProject,
  input: TriageInput,
) => apiFetch<LoadedLifeProject>(
  `/v1/life-projects/${encodeURIComponent(loaded.project.id)}/scenarios`,
  {
    method: 'POST',
    headers: { 'If-Match': `"${loaded.persistenceVersion}"` },
    body: JSON.stringify({
      title: input.need,
      description: `Première piste issue de la situation déclarée : ${input.situation}.`,
      status: 'exploring',
      optionType: 'mixed',
      assumptions: ['Cette piste correspond au besoin déclaré.'],
      missingInformation: [
        'Décrire les contraintes prioritaires',
        'Vérifier les compétences mobilisables',
        'Identifier une option locale réaliste',
      ],
      uncertainty: {
        level: 'high',
        reasons: ['Cette piste reste à explorer et ne constitue pas une recommandation finale.'],
      },
      provenanceNotes: 'Scénario initial créé depuis le triage utilisateur.',
    }),
  },
);

export const createProjectFromTriage = async (input: TriageInput) => {
  const created = await createLifeProject(input);
  return addInitialScenario(created, input);
};
