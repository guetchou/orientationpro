'use strict';

const crypto = require('node:crypto');
const {
  createActionPlan,
  createDecisionCriterion,
  createLifeProject,
  createLifeProjectScenario,
} = require('./contracts');
const {
  createLifeProjectDiagnostic,
  diagnosticMissingInformation,
  diagnosticToEngineInput,
} = require('./diagnostic-contracts');
const {
  RECOMMENDATION_ENGINE_VERSION,
} = require('./recommendation-contracts');
const { generateLifeRecommendations } = require('./recommendation-engine');
const { selectActiveScenario, transitionLifeProject } = require('./state-machine');
const {
  ActionTrackingError,
  createActionTrackingRecord,
  summarizeActionProgress,
  transitionActionTracking,
} = require('./action-tracking');

class LifeProjectServiceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeProjectServiceError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LifeProjectServiceError(
      'LIFE_PROJECT_API_INPUT_INVALID',
      `${field} must be a non-empty string.`,
      { field },
    );
  }
  return value.trim();
};

const expectedVersion = (value) => {
  const version = Number(value);
  if (!Number.isInteger(version) || version < 1) {
    throw new LifeProjectServiceError(
      'LIFE_PROJECT_API_VERSION_REQUIRED',
      'A positive expected persistence version is required.',
      { expectedVersion: value },
    );
  }
  return version;
};

const PRIORITY_LABELS = Object.freeze({
  duration: 'Durée',
  cost: 'Coût',
  proximity: 'Proximité',
  employability: 'Employabilité',
  interest: 'Intérêt personnel',
  personal_interest: 'Intérêt personnel',
  prestige: 'Prestige',
  alternance: 'Possibilité d’alternance',
  future_income: 'Revenus futurs',
  stability: 'Stabilité',
  evolution: 'Possibilité d’évolution',
  family_compatibility: 'Compatibilité familiale',
});

const uncertaintyFromRecommendation = (recommendation) => {
  if (!recommendation || recommendation.scenarios.length === 0) {
    return {
      level: 'high',
      reasons: recommendation?.missingInformation || ['Aucune recommandation exploitable.'],
    };
  }
  const levels = recommendation.scenarios.map((scenario) => scenario.confidence);
  if (levels.every((level) => level === 'high')) {
    return { level: 'low', reasons: recommendation.missingInformation };
  }
  if (levels.some((level) => level === 'low')) {
    return {
      level: 'high',
      reasons: recommendation.missingInformation.length > 0
        ? recommendation.missingInformation
        : ['Une ou plusieurs options reposent sur des informations insuffisantes.'],
    };
  }
  return {
    level: 'medium',
    reasons: recommendation.missingInformation,
  };
};

const createLifeProjectService = ({
  store,
  actionTrackingStore = null,
  optionProvider = async () => [],
  idFactory = crypto.randomUUID,
  clock = () => new Date(),
} = {}) => {
  if (!store || typeof store.create !== 'function' || typeof store.save !== 'function') {
    throw new TypeError('A life-project store is required.');
  }
  if (typeof optionProvider !== 'function') {
    throw new TypeError('optionProvider must be a function.');
  }

  const timestamp = () => clock().toISOString();
  const userProvenance = (accountId, recordedAt, notes = null) => ({
    sourceType: 'user_statement',
    sourceId: null,
    actorId: accountId,
    recordedAt,
    notes,
  });
  const systemProvenance = (accountId, recordedAt, notes = null) => ({
    sourceType: 'system_calculation',
    sourceId: RECOMMENDATION_ENGINE_VERSION,
    actorId: accountId,
    recordedAt,
    notes,
  });
  const actor = (accountId) => ({ kind: 'user', id: accountId });

  const requireTracking = () => {
    if (!actionTrackingStore
      || typeof actionTrackingStore.list !== 'function'
      || typeof actionTrackingStore.get !== 'function'
      || typeof actionTrackingStore.save !== 'function') {
      throw new LifeProjectServiceError(
        'ACTION_TRACKING_UNAVAILABLE',
        'Action tracking is not configured for this service.',
      );
    }
    return actionTrackingStore;
  };

  const getRequired = async (accountId, projectId) => {
    const loaded = await store.get(accountId, projectId);
    if (!loaded) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_NOT_FOUND',
        'The life project does not exist for this account.',
        { projectId },
      );
    }
    return loaded;
  };

  const save = async (loaded, project, version) => store.save(project, {
    expectedVersion: expectedVersion(version ?? loaded.persistenceVersion),
  });

  const replay = (loaded, commandId, predicate) => {
    const existing = loaded.project.stateHistory.find((entry) => entry.eventId === commandId);
    if (!existing) return null;
    if (!predicate(existing)) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_COMMAND_CONFLICT',
        'The command identifier was already used for a different operation.',
        { commandId },
      );
    }
    return { ...loaded, replayed: true };
  };

  const normalizePlan = ({ accountId, project, input, planId, existingPlan = null, now }) => {
    const scenarioId = requiredString(input.scenarioId, 'scenarioId');
    if (!project.scenarios.some((scenario) => scenario.id === scenarioId)) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_SCENARIO_NOT_FOUND',
        'The action plan must reference a scenario in this project.',
        { scenarioId },
      );
    }
    const existingItems = new Map((existingPlan?.items || []).map((item) => [item.id, item]));
    const items = Array.isArray(input.items) ? input.items.map((item) => {
      const itemId = item.id || idFactory();
      const previous = existingItems.get(itemId);
      return {
        ...item,
        id: itemId,
        provenance: userProvenance(accountId, now, item.provenanceNotes || null),
        createdAt: previous?.createdAt || now,
        updatedAt: now,
      };
    }) : [];

    return createActionPlan({
      ...input,
      id: planId,
      scenarioId,
      items,
      provenance: userProvenance(accountId, now, input.provenanceNotes || null),
      createdAt: existingPlan?.createdAt || now,
      updatedAt: now,
    });
  };

  const initialTracking = ({ projectId, planId, item, position, accountId, now }) => (
    createActionTrackingRecord({
      projectId,
      planId,
      actionId: item.id,
      position,
      statusHistory: [{
        eventId: idFactory(),
        from: null,
        to: item.status,
        occurredAt: now,
        actor: actor(accountId),
        reason: 'Action créée dans le plan.',
      }],
      createdAt: now,
      updatedAt: now,
    })
  );

  const syncTrackingForProject = async (accountId, project, now) => {
    if (!actionTrackingStore) return;
    const trackingStore = requireTracking();
    const actionIds = [];
    for (const plan of project.actionPlans) {
      for (let index = 0; index < plan.items.length; index += 1) {
        const item = plan.items[index];
        actionIds.push(item.id);
        const existing = await trackingStore.get(accountId, project.id, item.id);
        let record = existing || initialTracking({
          projectId: project.id,
          planId: plan.id,
          item,
          position: index,
          accountId,
          now,
        });
        if (existing && existing.statusHistory.at(-1)?.to !== item.status) {
          record = transitionActionTracking(existing, {
            eventId: idFactory(),
            to: item.status,
            occurredAt: now,
            actor: actor(accountId),
            reason: 'Statut modifié lors de la mise à jour du plan.',
          });
        }
        record = createActionTrackingRecord({
          ...record,
          planId: plan.id,
          position: index,
          updatedAt: now,
        });
        await trackingStore.save(accountId, record);
      }
    }
    if (typeof trackingStore.deleteMissing === 'function') {
      await trackingStore.deleteMissing(accountId, project.id, actionIds);
    }
  };

  const findAction = (project, planId, actionId) => {
    const plan = project.actionPlans.find((entry) => entry.id === planId);
    if (!plan) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_ACTION_PLAN_NOT_FOUND',
        'The action plan does not exist in this project.',
        { planId },
      );
    }
    const item = plan.items.find((entry) => entry.id === actionId);
    if (!item) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_ACTION_NOT_FOUND',
        'The action does not exist in this plan.',
        { planId, actionId },
      );
    }
    return { plan, item };
  };

  const previousGeneratedScenarioIds = (project) => new Set(
    Array.isArray(project.recommendation?.scenarios)
      ? project.recommendation.scenarios.map((scenario) => scenario.id)
      : [],
  );

  const withoutPreviousGeneration = (project) => {
    const generatedIds = previousGeneratedScenarioIds(project);
    if (generatedIds.size === 0) return project;
    return createLifeProject({
      ...project,
      activeScenarioId: generatedIds.has(project.activeScenarioId) ? null : project.activeScenarioId,
      scenarios: project.scenarios.filter((scenario) => !generatedIds.has(scenario.id)),
      actionPlans: project.actionPlans.filter((plan) => !generatedIds.has(plan.scenarioId)),
      recommendation: null,
    });
  };

  const criteriaFromDiagnostic = ({ diagnostic, currentCriteria, accountId, now }) => {
    const generatedIds = new Set(diagnostic.priorities.map((entry) => `diagnostic-priority-${entry.id}`));
    const preserved = currentCriteria.filter((criterion) => !criterion.id.startsWith('diagnostic-priority-'));
    const generated = diagnostic.priorities.map((entry) => createDecisionCriterion({
      id: `diagnostic-priority-${entry.id}`,
      label: PRIORITY_LABELS[entry.id] || entry.id,
      description: 'Critère classé pendant le diagnostic conseiller.',
      direction: ['duration', 'cost'].includes(entry.id) ? 'minimize' : 'maximize',
      importance: entry.importance,
      provenance: userProvenance(accountId, now, 'Critère issu du diagnostic conseiller.'),
    }));
    if (new Set(generated.map((criterion) => criterion.id)).size !== generatedIds.size) {
      throw new LifeProjectServiceError(
        'LIFE_PROJECT_DIAGNOSTIC_PRIORITY_INVALID',
        'Diagnostic priority identifiers are not unique.',
      );
    }
    return [...preserved, ...generated];
  };

  const recommendationScenarioToProjectScenario = ({ scenario, accountId, now }) => (
    createLifeProjectScenario({
      id: scenario.id,
      title: scenario.title,
      description: scenario.reasons.map((reason) => reason.explanation).join(' '),
      horizon: scenario.firstActions[0]
        ? `Première preuve attendue sous ${scenario.firstActions[0].deadlineDays} jours`
        : null,
      status: 'candidate',
      optionType: scenario.category,
      assumptions: scenario.reasons.map((reason) => reason.explanation),
      barriers: [...scenario.conditions, ...scenario.risks, ...scenario.blockingFactors],
      supports: scenario.strengths,
      missingInformation: scenario.missingInformation,
      uncertainty: {
        level: scenario.confidence === 'high'
          ? 'low'
          : (scenario.confidence === 'medium' ? 'medium' : 'high'),
        reasons: scenario.missingInformation,
      },
      provenance: systemProvenance(accountId, now, `Scénario généré avec un score de ${scenario.fitScore}/100.`),
      createdAt: now,
      updatedAt: now,
    })
  );

  const actionPlanFromRecommendation = ({ scenario, accountId, now }) => {
    const items = scenario.firstActions.map((action) => {
      const dueAt = new Date(new Date(now).getTime() + action.deadlineDays * 86400000).toISOString();
      return {
        id: idFactory(),
        title: action.title,
        description: `Preuve attendue : ${action.expectedEvidence}`,
        status: 'planned',
        dueAt,
        completedAt: null,
        evidenceIds: [],
        blockingReasons: [],
        provenance: systemProvenance(accountId, now, 'Action produite par le moteur et modifiable par le conseiller.'),
        createdAt: now,
        updatedAt: now,
      };
    });
    return createActionPlan({
      id: idFactory(),
      scenarioId: scenario.id,
      title: `Premières actions — ${scenario.title}`,
      status: 'draft',
      items,
      missingInformation: scenario.missingInformation,
      provenance: systemProvenance(accountId, now, 'Plan initial produit par le moteur.'),
      createdAt: now,
      updatedAt: now,
    });
  };

  const advanceToComparison = ({ project, accountId, now }) => {
    let advanced = project;
    if (advanced.state === 'exploration') {
      advanced = transitionLifeProject(advanced, {
        to: 'clarification',
        eventId: idFactory(),
        occurredAt: now,
        actor: { kind: 'system', id: RECOMMENDATION_ENGINE_VERSION },
        reason: 'Diagnostic conseiller enregistré.',
        provenance: systemProvenance(accountId, now),
      });
    }
    if (advanced.state === 'clarification') {
      advanced = transitionLifeProject(advanced, {
        to: 'comparison',
        eventId: idFactory(),
        occurredAt: now,
        actor: { kind: 'system', id: RECOMMENDATION_ENGINE_VERSION },
        reason: 'Options calculées et prêtes à comparer.',
        provenance: systemProvenance(accountId, now),
      });
    }
    return advanced;
  };

  return {
    async create(accountId, input = {}) {
      const now = timestamp();
      const project = createLifeProject({
        id: idFactory(),
        ownerAccountId: accountId,
        title: input.title,
        purpose: input.purpose,
        state: 'exploration',
        activeScenarioId: null,
        scenarios: [],
        criteria: [],
        actionPlans: [],
        stateHistory: [],
        diagnostic: null,
        recommendation: null,
        missingInformation: input.missingInformation,
        uncertainty: input.uncertainty,
        provenance: userProvenance(accountId, now, input.provenanceNotes || null),
        createdAt: now,
        updatedAt: now,
      });
      return store.create(project);
    },

    async list(accountId) {
      return store.list(accountId);
    },

    async get(accountId, projectId) {
      return getRequired(accountId, projectId);
    },

    async getProgress(accountId, projectId) {
      const loaded = await getRequired(accountId, projectId);
      const trackingRecords = actionTrackingStore
        ? await requireTracking().list(accountId, projectId)
        : [];
      return {
        schemaVersion: 'makoki-life-project-progress-v1',
        persistenceVersion: loaded.persistenceVersion,
        progress: summarizeActionProgress({
          project: loaded.project,
          trackingRecords,
        }),
      };
    },

    async replaceDiagnostic(accountId, projectId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const now = timestamp();
      const previous = loaded.project.diagnostic;
      const diagnostic = createLifeProjectDiagnostic({
        ...input,
        id: input.id || previous?.id || `diagnostic-${projectId}`,
        recordedAt: previous?.recordedAt || input.recordedAt || now,
        updatedAt: now,
      });
      const baseProject = withoutPreviousGeneration(loaded.project);
      const missingInformation = diagnosticMissingInformation(diagnostic);
      const project = createLifeProject({
        ...baseProject,
        diagnostic,
        recommendation: null,
        criteria: criteriaFromDiagnostic({
          diagnostic,
          currentCriteria: baseProject.criteria,
          accountId,
          now,
        }),
        missingInformation,
        uncertainty: {
          level: missingInformation.length >= 5 ? 'high' : (missingInformation.length > 0 ? 'medium' : 'low'),
          reasons: missingInformation,
        },
        updatedAt: now,
      });
      const saved = await save(loaded, project, version);
      await syncTrackingForProject(accountId, saved.project, now);
      return saved;
    },

    async generateRecommendations(accountId, projectId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      if (!loaded.project.diagnostic) {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_DIAGNOSTIC_REQUIRED',
          'A counselor diagnostic is required before generating recommendations.',
          { projectId },
        );
      }
      const now = timestamp();
      const diagnostic = createLifeProjectDiagnostic(loaded.project.diagnostic);
      const engineDiagnostic = diagnosticToEngineInput(diagnostic);
      const options = await optionProvider({
        accountId,
        project: loaded.project,
        diagnostic: engineDiagnostic,
      });
      const recommendation = generateLifeRecommendations({
        diagnostic: engineDiagnostic,
        options,
        generatedAt: now,
        maximumScenarios: input.maximumScenarios === undefined
          ? 5
          : Number(input.maximumScenarios),
      });
      const baseProject = withoutPreviousGeneration(loaded.project);
      const scenarios = recommendation.scenarios.map((scenario) => (
        recommendationScenarioToProjectScenario({ scenario, accountId, now })
      ));
      const actionPlans = recommendation.scenarios.map((scenario) => (
        actionPlanFromRecommendation({ scenario, accountId, now })
      ));
      const manualScenarioIds = new Set(baseProject.scenarios.map((scenario) => scenario.id));
      const collision = scenarios.find((scenario) => manualScenarioIds.has(scenario.id));
      if (collision) {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_GENERATED_SCENARIO_CONFLICT',
          'A generated scenario identifier conflicts with an existing manual scenario.',
          { scenarioId: collision.id },
        );
      }
      let project = createLifeProject({
        ...baseProject,
        scenarios: [...baseProject.scenarios, ...scenarios],
        actionPlans: [...baseProject.actionPlans, ...actionPlans],
        recommendation,
        missingInformation: recommendation.missingInformation,
        uncertainty: uncertaintyFromRecommendation(recommendation),
        updatedAt: now,
      });
      if (recommendation.status === 'complete') {
        project = advanceToComparison({ project, accountId, now });
      }
      const saved = await save(loaded, project, version);
      await syncTrackingForProject(accountId, saved.project, now);
      return saved;
    },

    async addScenario(accountId, projectId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const now = timestamp();
      const scenario = createLifeProjectScenario({
        ...input,
        id: idFactory(),
        provenance: userProvenance(accountId, now, input.provenanceNotes || null),
        createdAt: now,
        updatedAt: now,
      });
      const project = createLifeProject({
        ...loaded.project,
        scenarios: [...loaded.project.scenarios, scenario],
        updatedAt: now,
      });
      return save(loaded, project, version);
    },

    async selectScenario(accountId, projectId, scenarioId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const commandId = requiredString(input.commandId, 'commandId');
      const canonicalReason = `scenario:${scenarioId}${input.reason ? `|${input.reason}` : ''}`;
      const repeated = replay(loaded, commandId, (entry) => (
        entry.eventType === 'scenario_selection' && entry.reason === canonicalReason
      ));
      if (repeated) return repeated;
      const now = timestamp();
      const project = selectActiveScenario(loaded.project, {
        scenarioId,
        eventId: commandId,
        occurredAt: now,
        actor: actor(accountId),
        reason: canonicalReason,
        provenance: userProvenance(accountId, now, input.provenanceNotes || null),
      });
      return save(loaded, project, version);
    },

    async transition(accountId, projectId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const commandId = requiredString(input.commandId, 'commandId');
      const destination = requiredString(input.to, 'to');
      const repeated = replay(loaded, commandId, (entry) => (
        entry.eventType === 'state_transition' && entry.to === destination
      ));
      if (repeated) return repeated;
      const now = timestamp();
      const project = transitionLifeProject(loaded.project, {
        to: destination,
        eventId: commandId,
        occurredAt: now,
        actor: actor(accountId),
        reason: input.reason,
        provenance: userProvenance(accountId, now, input.provenanceNotes || null),
      });
      return save(loaded, project, version);
    },

    async createActionPlan(accountId, projectId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const now = timestamp();
      const plan = normalizePlan({
        accountId,
        project: loaded.project,
        input,
        planId: idFactory(),
        now,
      });
      const project = createLifeProject({
        ...loaded.project,
        actionPlans: [...loaded.project.actionPlans, plan],
        updatedAt: now,
      });
      const saved = await save(loaded, project, version);
      await syncTrackingForProject(accountId, saved.project, now);
      return saved;
    },

    async replaceActionPlan(accountId, projectId, planId, input = {}, version) {
      const loaded = await getRequired(accountId, projectId);
      const existingPlan = loaded.project.actionPlans.find((plan) => plan.id === planId);
      if (!existingPlan) {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_ACTION_PLAN_NOT_FOUND',
          'The action plan does not exist in this project.',
          { planId },
        );
      }
      const now = timestamp();
      const replacement = normalizePlan({
        accountId,
        project: loaded.project,
        input,
        planId,
        existingPlan,
        now,
      });
      const project = createLifeProject({
        ...loaded.project,
        actionPlans: loaded.project.actionPlans.map((plan) => (
          plan.id === planId ? replacement : plan
        )),
        updatedAt: now,
      });
      const saved = await save(loaded, project, version);
      await syncTrackingForProject(accountId, saved.project, now);
      return saved;
    },

    async updateActionItem(accountId, projectId, planId, actionId, input = {}, version) {
      const trackingStore = requireTracking();
      const loaded = await getRequired(accountId, projectId);
      const { plan, item } = findAction(loaded.project, planId, actionId);
      const commandId = requiredString(input.commandId, 'commandId');
      const now = timestamp();
      const requestedStatus = input.status || item.status;
      let tracking = await trackingStore.get(accountId, projectId, actionId);
      tracking = tracking || initialTracking({
        projectId,
        planId,
        item,
        position: plan.items.findIndex((entry) => entry.id === actionId),
        accountId,
        now,
      });

      const replayed = tracking.statusHistory.find((entry) => entry.eventId === commandId);
      if (replayed) {
        if (replayed.to !== requestedStatus) {
          throw new LifeProjectServiceError(
            'LIFE_PROJECT_COMMAND_CONFLICT',
            'The command identifier was already used for a different action status.',
            { commandId, actionId },
          );
        }
        return { ...loaded, replayed: true, actionTracking: tracking };
      }

      if (requestedStatus === 'blocked'
        && (!Array.isArray(input.blockingReasons) || input.blockingReasons.length === 0)) {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_BLOCKING_REASON_REQUIRED',
          'A blocked action requires at least one blocking reason.',
          { actionId },
        );
      }

      try {
        tracking = transitionActionTracking(tracking, {
          eventId: commandId,
          to: requestedStatus,
          occurredAt: now,
          actor: actor(accountId),
          reason: input.reason,
        });
      } catch (error) {
        if (error instanceof ActionTrackingError) {
          throw new LifeProjectServiceError(error.code, error.message, error.details);
        }
        throw error;
      }

      tracking = createActionTrackingRecord({
        ...tracking,
        position: input.position ?? tracking.position,
        updatedAt: now,
      });

      const updatedItem = {
        ...item,
        title: input.title ?? item.title,
        description: input.description === undefined ? item.description : input.description,
        status: requestedStatus,
        dueAt: input.dueAt === undefined ? item.dueAt : input.dueAt,
        completedAt: requestedStatus === 'completed'
          ? (input.completedAt || item.completedAt || now)
          : null,
        evidenceIds: input.evidenceIds ?? item.evidenceIds,
        blockingReasons: requestedStatus === 'blocked'
          ? input.blockingReasons
          : (input.blockingReasons ?? []),
        provenance: userProvenance(accountId, now, input.provenanceNotes || null),
        updatedAt: now,
      };
      const replacementPlan = createActionPlan({
        ...plan,
        items: plan.items.map((entry) => entry.id === actionId ? updatedItem : entry),
        updatedAt: now,
      });
      const project = createLifeProject({
        ...loaded.project,
        actionPlans: loaded.project.actionPlans.map((entry) => (
          entry.id === planId ? replacementPlan : entry
        )),
        updatedAt: now,
      });
      const saved = await save(loaded, project, version);
      await trackingStore.save(accountId, tracking);
      return { ...saved, actionTracking: tracking };
    },
  };
};

module.exports = {
  LifeProjectServiceError,
  createLifeProjectService,
};
