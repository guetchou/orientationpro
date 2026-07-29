'use strict';

const crypto = require('node:crypto');
const {
  createActionPlan,
  createLifeProject,
  createLifeProjectScenario,
} = require('./contracts');
const { selectActiveScenario, transitionLifeProject } = require('./state-machine');

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
      return save(loaded, project, version);
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
      return save(loaded, project, version);
    },
  };
};

module.exports = {
  LifeProjectServiceError,
  createLifeProjectService,
};