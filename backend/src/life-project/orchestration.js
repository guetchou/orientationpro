'use strict';

const {
  createLifeProject,
  deepFreeze,
} = require('./contracts');

const ORCHESTRATION_VERSION = 'makoki-life-path-orchestration-v1';
const AVAILABLE_CAPABILITY_STATUSES = Object.freeze(['active', 'experimental']);

const MODULE_CATALOG = Object.freeze([
  Object.freeze({
    id: 'life-project.clarification',
    label: 'Clarifier la situation et les informations manquantes',
    capabilityId: 'life-project.core-v1',
  }),
  Object.freeze({
    id: 'profile.review',
    label: 'Relire et compléter le profil déclaré',
    capabilityId: 'profile.core-v1',
  }),
  Object.freeze({
    id: 'profile.skills-review',
    label: 'Identifier les compétences à confirmer ou développer',
    capabilityId: 'profile.core-v1',
  }),
  Object.freeze({
    id: 'orientation.interests',
    label: 'Explorer les intérêts professionnels',
    capabilityId: 'orientation.riasec',
  }),
  Object.freeze({
    id: 'career.exploration',
    label: 'Explorer des métiers et des passerelles',
    capabilityId: 'career.recommendations',
  }),
  Object.freeze({
    id: 'life-project.scenario-comparison',
    label: 'Comparer plusieurs scénarios',
    capabilityId: 'life-project.core-v1',
  }),
  Object.freeze({
    id: 'life-project.action-planning',
    label: 'Préparer un plan d’action réaliste',
    capabilityId: 'life-project.core-v1',
  }),
  Object.freeze({
    id: 'life-project.follow-up',
    label: 'Suivre les actions, blocages et prochaines étapes',
    capabilityId: 'life-project.core-v1',
  }),
  Object.freeze({
    id: 'life-project.reorientation',
    label: 'Réexaminer la direction choisie',
    capabilityId: 'life-project.core-v1',
  }),
]);

class LifeProjectOrchestrationError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeProjectOrchestrationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LifeProjectOrchestrationError(
      'LIFE_PROJECT_ORCHESTRATION_FIELD_REQUIRED',
      `${field} must be a non-empty string.`,
      { field },
    );
  }
  return value.trim();
};

const isoTimestamp = (value, field) => {
  const text = requiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new LifeProjectOrchestrationError(
      'LIFE_PROJECT_ORCHESTRATION_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return date.toISOString();
};

const uniqueStrings = (value, field) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new LifeProjectOrchestrationError(
      'LIFE_PROJECT_ORCHESTRATION_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const normalizeRegistry = (registry) => {
  if (!registry || !Array.isArray(registry.capabilities)) {
    throw new LifeProjectOrchestrationError(
      'LIFE_PROJECT_CAPABILITY_REGISTRY_REQUIRED',
      'A capability registry is required to orchestrate the journey.',
    );
  }
  return registry;
};

const capabilityMap = (registry) => new Map(
  registry.capabilities.map((entry) => [entry.id, entry]),
);

const resolveCapability = (capabilities, capabilityId) => {
  const capability = capabilities.get(capabilityId);
  if (!capability) {
    return deepFreeze({
      capabilityId,
      availability: 'unavailable',
      capabilityStatus: 'missing',
      blockers: [`Capacité non enregistrée : ${capabilityId}`],
      publicLimitations: [],
    });
  }

  if (capability.status === 'disabled') {
    return deepFreeze({
      capabilityId,
      availability: 'disabled',
      capabilityStatus: capability.status,
      blockers: [`Capacité désactivée : ${capabilityId}`],
      publicLimitations: [...(capability.publicLimitations || [])],
    });
  }

  if (!AVAILABLE_CAPABILITY_STATUSES.includes(capability.status)) {
    return deepFreeze({
      capabilityId,
      availability: 'unavailable',
      capabilityStatus: capability.status || 'unknown',
      blockers: [`Statut de capacité non utilisable : ${capability.status || 'inconnu'}`],
      publicLimitations: [...(capability.publicLimitations || [])],
    });
  }

  const unavailableDependencies = (capability.dependencies || []).filter((dependencyId) => {
    const dependency = capabilities.get(dependencyId);
    return !dependency || !AVAILABLE_CAPABILITY_STATUSES.includes(dependency.status);
  });

  if (unavailableDependencies.length > 0) {
    return deepFreeze({
      capabilityId,
      availability: 'unavailable',
      capabilityStatus: capability.status,
      blockers: unavailableDependencies.map((dependencyId) => (
        `Dépendance indisponible : ${dependencyId}`
      )),
      publicLimitations: [...(capability.publicLimitations || [])],
    });
  }

  return deepFreeze({
    capabilityId,
    availability: 'available',
    capabilityStatus: capability.status,
    blockers: [],
    publicLimitations: [...(capability.publicLimitations || [])],
  });
};

const actionSummary = (project) => {
  const items = project.actionPlans.flatMap((plan) => plan.items);
  const count = (status) => items.filter((item) => item.status === status).length;
  return deepFreeze({
    total: items.length,
    planned: count('planned'),
    inProgress: count('in_progress'),
    completed: count('completed'),
    blocked: count('blocked'),
    cancelled: count('cancelled'),
  });
};

const reason = (code, message) => Object.freeze({ code, message });

const candidateRules = ({ project, actions }) => {
  const candidates = [];
  const add = (moduleId, priority, reasons) => {
    if (!candidates.some((candidate) => candidate.moduleId === moduleId)) {
      candidates.push({ moduleId, priority, reasons });
    }
  };

  if (project.state === 'reorientation') {
    add('life-project.reorientation', 10, [
      reason('PROJECT_STATE_REORIENTATION', 'Le projet est explicitement en réorientation.'),
    ]);
  }

  if (actions.blocked > 0) {
    add('life-project.follow-up', 12, [
      reason('ACTION_BLOCKED', `${actions.blocked} action(s) sont bloquées et demandent une décision.`),
    ]);
  } else if (actions.inProgress > 0) {
    add('life-project.follow-up', 18, [
      reason('ACTION_IN_PROGRESS', `${actions.inProgress} action(s) sont en cours et doivent être suivies.`),
    ]);
  }

  const uncertaintyNeedsClarification = ['unknown', 'high'].includes(project.uncertainty.level);
  if (project.missingInformation.length > 0 || uncertaintyNeedsClarification) {
    const reasons = [];
    if (project.missingInformation.length > 0) {
      reasons.push(reason(
        'PROJECT_INFORMATION_MISSING',
        `${project.missingInformation.length} information(s) restent à préciser.`,
      ));
    }
    if (uncertaintyNeedsClarification) {
      reasons.push(reason(
        'PROJECT_UNCERTAINTY_HIGH',
        `Le niveau d’incertitude déclaré est ${project.uncertainty.level}.`,
      ));
    }
    add('life-project.clarification', 25, reasons);
  }

  if (project.scenarios.length === 0) {
    add('profile.review', 35, [
      reason('NO_SCENARIO_PROFILE_CONTEXT', 'Aucun scénario n’existe encore ; le profil déclaré peut être complété.'),
    ]);
    add('orientation.interests', 45, [
      reason('NO_SCENARIO_INTEREST_EXPLORATION', 'Les intérêts peuvent ouvrir des pistes sans constituer un verdict.'),
    ]);
    add('profile.skills-review', 55, [
      reason('NO_SCENARIO_SKILLS_CONTEXT', 'Les compétences déclarées ou observables peuvent aider à construire des pistes.'),
    ]);
  }

  if (project.scenarios.length >= 2 && !project.activeScenarioId) {
    add('life-project.scenario-comparison', 30, [
      reason('MULTIPLE_SCENARIOS_NO_SELECTION', 'Plusieurs scénarios existent sans choix provisoire explicite.'),
    ]);
  }

  if (['comparison', 'provisional_choice'].includes(project.state)
    || project.scenarios.length > 0) {
    add('career.exploration', 50, [
      reason('SCENARIO_NEEDS_EXTERNAL_EXPLORATION', 'Les scénarios peuvent être confrontés à des métiers et passerelles disponibles.'),
    ]);
  }

  if (project.activeScenarioId) {
    const plans = project.actionPlans.filter((plan) => plan.scenarioId === project.activeScenarioId);
    if (plans.length === 0 || plans.every((plan) => plan.items.length === 0)) {
      add('life-project.action-planning', 28, [
        reason('ACTIVE_SCENARIO_WITHOUT_ACTIONS', 'Le scénario actif ne dispose pas encore d’actions concrètes.'),
      ]);
    }
  }

  if (actions.planned > 0 && ['preparation', 'experimentation', 'action', 'follow_up'].includes(project.state)) {
    add('life-project.follow-up', 32, [
      reason('PLANNED_ACTIONS_READY', `${actions.planned} action(s) planifiées peuvent être engagées ou révisées.`),
    ]);
  }

  if (actions.total > 0 && actions.completed === actions.total) {
    add('life-project.follow-up', 20, [
      reason('ALL_ACTIONS_REVIEW', 'Toutes les actions enregistrées sont terminées ; leurs effets doivent être examinés.'),
    ]);
  }

  if (project.state === 'confirmation') {
    add('life-project.follow-up', 40, [
      reason('CONFIRMED_PROJECT_REMAINS_REVISABLE', 'Le projet confirmé reste révisable si le contexte change.'),
    ]);
  }

  if (candidates.length === 0) {
    add('life-project.clarification', 90, [
      reason('SAFE_DEFAULT_CLARIFICATION', 'Aucune prochaine étape spécialisée ne peut être déduite sans clarification supplémentaire.'),
    ]);
  }

  return candidates;
};

const createAdaptiveOrchestration = ({
  project: projectInput,
  capabilityRegistry: registryInput,
  generatedAt,
  completedModuleIds: completedInput = [],
  skippedModuleIds: skippedInput = [],
} = {}) => {
  const project = createLifeProject(projectInput);
  const registry = normalizeRegistry(registryInput);
  const generated = isoTimestamp(generatedAt, 'generatedAt');
  const completedModuleIds = uniqueStrings(completedInput, 'completedModuleIds');
  const skippedModuleIds = uniqueStrings(skippedInput, 'skippedModuleIds');
  const completed = new Set(completedModuleIds);
  const skipped = new Set(skippedModuleIds);
  const catalog = new Map(MODULE_CATALOG.map((module) => [module.id, module]));
  const capabilities = capabilityMap(registry);
  const actions = actionSummary(project);

  const recommendations = candidateRules({ project, actions })
    .sort((left, right) => left.priority - right.priority || left.moduleId.localeCompare(right.moduleId))
    .map((candidate) => {
      const module = catalog.get(candidate.moduleId);
      const capability = resolveCapability(capabilities, module.capabilityId);
      const completion = completed.has(module.id)
        ? 'completed'
        : skipped.has(module.id)
          ? 'skipped'
          : 'pending';
      return deepFreeze({
        moduleId: module.id,
        label: module.label,
        capabilityId: module.capabilityId,
        availability: capability.availability,
        capabilityStatus: capability.capabilityStatus,
        completion,
        priority: candidate.priority,
        reasons: candidate.reasons,
        blockers: capability.blockers,
        publicLimitations: capability.publicLimitations,
      });
    });

  const next = recommendations.find((entry) => (
    entry.availability === 'available' && entry.completion === 'pending'
  )) || null;

  return deepFreeze({
    schemaVersion: ORCHESTRATION_VERSION,
    projectId: project.id,
    ownerAccountId: project.ownerAccountId,
    projectState: project.state,
    generatedAt: generated,
    source: {
      lifeProjectSchemaVersion: project.schemaVersion,
      projectUpdatedAt: project.updatedAt,
      capabilityRegistrySchemaVersion: registry.schemaVersion || null,
    },
    signals: {
      missingInformationCount: project.missingInformation.length,
      uncertaintyLevel: project.uncertainty.level,
      scenarioCount: project.scenarios.length,
      activeScenarioId: project.activeScenarioId,
      actions,
    },
    completedModuleIds,
    skippedModuleIds,
    recommendations,
    nextModuleId: next?.moduleId || null,
    nextModuleReasons: next ? next.reasons : [],
  });
};

module.exports = {
  AVAILABLE_CAPABILITY_STATUSES,
  LifeProjectOrchestrationError,
  MODULE_CATALOG,
  ORCHESTRATION_VERSION,
  createAdaptiveOrchestration,
  resolveCapability,
};
