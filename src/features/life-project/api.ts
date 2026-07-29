import { ApiError, apiFetch } from '@/lib/apiClient';
import type { LifeProjectSyncCommand } from './sync';
import type {
  CapabilityRegistry,
  LifeProjectActionStatus,
  LifeProjectEnvelope,
  LifeProjectOrchestrationEnvelope,
  LifeProjectProgressEnvelope,
  LifeProjectSummary,
  LifeProjectState,
  TriageDraft,
} from './types';

export const getCapabilityRegistry = () => apiFetch<CapabilityRegistry>(
  '/v1/capabilities',
  {},
  { auth: false },
);

export const listLifeProjects = () => apiFetch<{
  schemaVersion: string;
  projects: LifeProjectSummary[];
}>('/v1/life-projects');

export const getLifeProject = (projectId: string) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}`,
);

export const getLifeProjectProgress = (projectId: string) => apiFetch<LifeProjectProgressEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/progress`,
);

export const getLifeProjectOrchestration = (
  projectId: string,
  completedModuleIds: string[] = [],
  skippedModuleIds: string[] = [],
) => {
  const query = new URLSearchParams();
  if (completedModuleIds.length > 0) query.set('completed', completedModuleIds.join(','));
  if (skippedModuleIds.length > 0) query.set('skipped', skippedModuleIds.join(','));
  const suffix = query.size > 0 ? `?${query.toString()}` : '';
  return apiFetch<LifeProjectOrchestrationEnvelope>(
    `/v1/life-projects/${encodeURIComponent(projectId)}/orchestration${suffix}`,
  );
};

const needLabels: Record<string, string> = {
  studies: 'Construire mon parcours d’études',
  training: 'Trouver une formation adaptée',
  employment: 'Préparer mon insertion professionnelle',
  career_change: 'Préparer une reconversion',
  entrepreneurship: 'Explorer un projet entrepreneurial',
  skills: 'Développer mes compétences',
  wellbeing: 'Retrouver un équilibre pour avancer',
  uncertain: 'Clarifier ma direction',
};

const needOptionTypes: Record<string, string> = {
  studies: 'education',
  training: 'training',
  employment: 'employment',
  career_change: 'career_change',
  entrepreneurship: 'entrepreneurship',
  skills: 'skills',
  wellbeing: 'wellbeing',
  uncertain: 'mixed',
};

const describeTriage = (draft: TriageDraft) => [
  `Situation déclarée : ${draft.situation}.`,
  `Besoin principal déclaré : ${draft.need}.`,
  `Mobilité envisagée : ${draft.mobility}.`,
  `Horizon déclaré : ${draft.urgency}.`,
  draft.detail.trim() ? `Précision libre : ${draft.detail.trim()}.` : null,
].filter(Boolean).join(' ');

export const createProjectFromTriage = async (draft: TriageDraft): Promise<LifeProjectEnvelope> => {
  const title = needLabels[draft.need] || needLabels.uncertain;
  const created = await apiFetch<LifeProjectEnvelope>('/v1/life-projects', {
    method: 'POST',
    body: JSON.stringify({
      title,
      purpose: describeTriage(draft),
      missingInformation: [
        'Vérifier les contraintes concrètes',
        'Comparer plusieurs possibilités',
        'Définir la première action réaliste',
      ],
      uncertainty: {
        level: 'high',
        reasons: ['Le projet commence à partir d’informations déclarées.'],
      },
      provenanceNotes: 'Triage initial du Parcours MAKOKI.',
    }),
  });

  try {
    return await apiFetch<LifeProjectEnvelope>(
      `/v1/life-projects/${encodeURIComponent(created.project.id)}/scenarios`,
      {
        method: 'POST',
        body: JSON.stringify({
          expectedVersion: created.persistenceVersion,
          title,
          description: describeTriage(draft),
          status: 'candidate',
          optionType: needOptionTypes[draft.need] || 'mixed',
          missingInformation: [
            'Conditions d’accès et ressources nécessaires',
            'Expérience concrète permettant de tester cette piste',
          ],
          uncertainty: {
            level: 'high',
            reasons: ['Ce scénario doit être exploré et confronté à la réalité.'],
          },
          provenanceNotes: 'Scénario initial créé depuis le triage.',
        }),
      },
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return created;
  }
};

export const selectLifeProjectScenario = (
  projectId: string,
  scenarioId: string,
  persistenceVersion: number,
  commandId = crypto.randomUUID(),
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/scenarios/${encodeURIComponent(scenarioId)}/select`,
  {
    method: 'POST',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      commandId,
      reason: 'Scénario choisi provisoirement depuis le Parcours MAKOKI.',
    }),
  },
);

export const transitionLifeProject = (
  projectId: string,
  to: LifeProjectState,
  persistenceVersion: number,
  commandId = crypto.randomUUID(),
  reason = 'La personne fait évoluer explicitement son projet.',
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/transitions`,
  {
    method: 'POST',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      commandId,
      to,
      reason,
    }),
  },
);

export const moveLifeProjectToClarification = (
  projectId: string,
  persistenceVersion: number,
  commandId = crypto.randomUUID(),
) => transitionLifeProject(
  projectId,
  'clarification',
  persistenceVersion,
  commandId,
  'La personne souhaite préciser les informations manquantes.',
);

export const createLifeProjectActionPlan = (
  projectId: string,
  scenarioId: string,
  persistenceVersion: number,
  title: string,
  actionTitle: string,
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/action-plans`,
  {
    method: 'POST',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      scenarioId,
      title,
      status: 'active',
      items: [{
        title: actionTitle,
        status: 'planned',
      }],
      provenanceNotes: 'Plan et première action créés depuis le Parcours MAKOKI.',
    }),
  },
);

export interface UpdateLifeProjectActionInput {
  status?: LifeProjectActionStatus;
  position?: number;
  title?: string;
  description?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  evidenceIds?: string[];
  blockingReasons?: string[];
  reason?: string;
}

export const updateLifeProjectAction = (
  projectId: string,
  planId: string,
  actionId: string,
  persistenceVersion: number,
  input: UpdateLifeProjectActionInput,
  commandId = crypto.randomUUID(),
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/action-plans/${encodeURIComponent(planId)}/actions/${encodeURIComponent(actionId)}`,
  {
    method: 'PATCH',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      commandId,
      ...input,
    }),
  },
);

export const executeLifeProjectSyncCommand = (
  command: LifeProjectSyncCommand,
  currentVersion: number,
): Promise<LifeProjectEnvelope> => {
  if (command.kind === 'select_scenario') {
    return selectLifeProjectScenario(
      command.projectId,
      String(command.payload.scenarioId),
      currentVersion,
      command.commandId,
    );
  }
  if (command.kind === 'transition') {
    return transitionLifeProject(
      command.projectId,
      String(command.payload.to) as LifeProjectState,
      currentVersion,
      command.commandId,
      typeof command.payload.reason === 'string' ? command.payload.reason : undefined,
    );
  }
  return updateLifeProjectAction(
    command.projectId,
    String(command.payload.planId),
    String(command.payload.actionId),
    currentVersion,
    command.payload.input as UpdateLifeProjectActionInput,
    command.commandId,
  );
};
