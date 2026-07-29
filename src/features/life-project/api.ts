import { apiFetch } from '@/lib/apiClient';
import type {
  CapabilityRegistry,
  LifeProjectEnvelope,
  LifeProjectSummary,
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
    // Le projet reste récupérable même si la connexion s’interrompt entre les deux écritures.
    return created;
  }
};

export const selectLifeProjectScenario = (
  projectId: string,
  scenarioId: string,
  persistenceVersion: number,
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/scenarios/${encodeURIComponent(scenarioId)}/select`,
  {
    method: 'POST',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      commandId: crypto.randomUUID(),
      reason: 'Scénario choisi provisoirement depuis le shell du Parcours MAKOKI.',
    }),
  },
);

export const moveLifeProjectToClarification = (
  projectId: string,
  persistenceVersion: number,
) => apiFetch<LifeProjectEnvelope>(
  `/v1/life-projects/${encodeURIComponent(projectId)}/transitions`,
  {
    method: 'POST',
    body: JSON.stringify({
      expectedVersion: persistenceVersion,
      commandId: crypto.randomUUID(),
      to: 'clarification',
      reason: 'La personne souhaite préciser les informations manquantes.',
    }),
  },
);
