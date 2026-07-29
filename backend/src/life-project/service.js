'use strict';

const crypto = require('node:crypto');
const {
  createActionPlan,
  createLifeProject,
  createLifeProjectScenario,
} = require('./contracts');
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

const createLifeProjectService = ({
  store,
  actionTrackingStore = null,
  idFactory = crypto.randomUUID,
  clock = () => new Date(),
} = {}) => {
  if (!store || typeof store.create !== 'function' || typeof store.save !== 'function') {
    throw new TypeError('A life-project store is required.');
  }

  const timestamp = () => clock().toISOString();
  const userProvenance = (accountId, recordedAt, notes = null) => ({
    sourceType: 'user_statement',
    sourceId: null,
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
