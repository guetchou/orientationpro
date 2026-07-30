'use strict';

const CONTRACT_VERSION = 'makoki-life-project-v1';
const LIFE_PROJECT_STATES = Object.freeze([
  'exploration', 'clarification', 'comparison', 'provisional_choice', 'preparation',
  'experimentation', 'action', 'follow_up', 'confirmation', 'reorientation',
]);

class LifeProjectContractError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeProjectContractError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const isPlainObject = (value) => Boolean(value)
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
};

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_FIELD_REQUIRED',
      `${field} must be a non-empty string.`,
      { field },
    );
  }
  return value.trim();
};

const optionalString = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  return requiredString(value, field);
};

const isoTimestamp = (value, field) => {
  const text = requiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return date.toISOString();
};

const stringArray = (value, field) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const plainObject = (value, field, fallback = {}) => {
  if (value === undefined) return { ...fallback };
  if (!isPlainObject(value)) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return { ...value };
};

const nullablePlainObject = (value, field) => {
  if (value === undefined || value === null) return null;
  return plainObject(value, field);
};

const enumValue = (value, field, allowed, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (!allowed.includes(value)) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_ENUM_INVALID',
      `${field} is invalid.`,
      { field, value, allowed },
    );
  }
  return value;
};

const uncertainty = (value = {}) => {
  const normalized = plainObject(value, 'uncertainty');
  const level = enumValue(
    normalized.level,
    'uncertainty.level',
    ['unknown', 'low', 'medium', 'high'],
    'unknown',
  );
  return {
    level,
    reasons: stringArray(normalized.reasons, 'uncertainty.reasons'),
  };
};

const provenance = (value = {}) => {
  const normalized = plainObject(value, 'provenance');
  return {
    sourceType: requiredString(
      normalized.sourceType || 'user_statement',
      'provenance.sourceType',
    ),
    sourceId: optionalString(normalized.sourceId, 'provenance.sourceId'),
    actorId: optionalString(normalized.actorId, 'provenance.actorId'),
    recordedAt: isoTimestamp(normalized.recordedAt, 'provenance.recordedAt'),
    notes: optionalString(normalized.notes, 'provenance.notes'),
  };
};

const decisionCriterion = (input = {}) => deepFreeze({
  schemaVersion: CONTRACT_VERSION,
  id: requiredString(input.id, 'criterion.id'),
  label: requiredString(input.label, 'criterion.label'),
  description: optionalString(input.description, 'criterion.description'),
  direction: enumValue(
    input.direction,
    'criterion.direction',
    ['maximize', 'minimize', 'target'],
    'maximize',
  ),
  importance: input.importance === undefined || input.importance === null
    ? null
    : (() => {
      if (!Number.isFinite(input.importance)
        || input.importance < 0
        || input.importance > 1) {
        throw new LifeProjectContractError(
          'LIFE_PROJECT_IMPORTANCE_INVALID',
          'criterion.importance must be between 0 and 1.',
          { importance: input.importance },
        );
      }
      return input.importance;
    })(),
  provenance: provenance(input.provenance),
});

const lifeProjectScenario = (input = {}) => deepFreeze({
  schemaVersion: CONTRACT_VERSION,
  id: requiredString(input.id, 'scenario.id'),
  title: requiredString(input.title, 'scenario.title'),
  description: optionalString(input.description, 'scenario.description'),
  horizon: optionalString(input.horizon, 'scenario.horizon'),
  status: enumValue(
    input.status,
    'scenario.status',
    ['exploring', 'candidate', 'active', 'paused', 'discarded'],
    'exploring',
  ),
  optionType: requiredString(input.optionType || 'mixed', 'scenario.optionType'),
  assumptions: stringArray(input.assumptions, 'scenario.assumptions'),
  barriers: stringArray(input.barriers, 'scenario.barriers'),
  supports: stringArray(input.supports, 'scenario.supports'),
  missingInformation: stringArray(
    input.missingInformation,
    'scenario.missingInformation',
  ),
  uncertainty: uncertainty(input.uncertainty),
  provenance: provenance(input.provenance),
  createdAt: isoTimestamp(input.createdAt, 'scenario.createdAt'),
  updatedAt: isoTimestamp(input.updatedAt || input.createdAt, 'scenario.updatedAt'),
});

const actionItem = (input = {}) => deepFreeze({
  schemaVersion: CONTRACT_VERSION,
  id: requiredString(input.id, 'actionItem.id'),
  title: requiredString(input.title, 'actionItem.title'),
  description: optionalString(input.description, 'actionItem.description'),
  status: enumValue(
    input.status,
    'actionItem.status',
    ['planned', 'in_progress', 'completed', 'blocked', 'cancelled'],
    'planned',
  ),
  dueAt: input.dueAt ? isoTimestamp(input.dueAt, 'actionItem.dueAt') : null,
  completedAt: input.completedAt
    ? isoTimestamp(input.completedAt, 'actionItem.completedAt')
    : null,
  evidenceIds: stringArray(input.evidenceIds, 'actionItem.evidenceIds'),
  blockingReasons: stringArray(
    input.blockingReasons,
    'actionItem.blockingReasons',
  ),
  provenance: provenance(input.provenance),
  createdAt: isoTimestamp(input.createdAt, 'actionItem.createdAt'),
  updatedAt: isoTimestamp(input.updatedAt || input.createdAt, 'actionItem.updatedAt'),
});

const actionPlan = (input = {}) => {
  const items = Array.isArray(input.items) ? input.items.map(actionItem) : [];
  const ids = new Set(items.map((item) => item.id));
  if (ids.size !== items.length) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_DUPLICATE_ID',
      'actionPlan.items contains duplicate ids.',
      { field: 'actionPlan.items' },
    );
  }
  return deepFreeze({
    schemaVersion: CONTRACT_VERSION,
    id: requiredString(input.id, 'actionPlan.id'),
    scenarioId: requiredString(input.scenarioId, 'actionPlan.scenarioId'),
    title: requiredString(input.title, 'actionPlan.title'),
    status: enumValue(
      input.status,
      'actionPlan.status',
      ['draft', 'active', 'completed', 'paused', 'cancelled'],
      'draft',
    ),
    items,
    missingInformation: stringArray(
      input.missingInformation,
      'actionPlan.missingInformation',
    ),
    provenance: provenance(input.provenance),
    createdAt: isoTimestamp(input.createdAt, 'actionPlan.createdAt'),
    updatedAt: isoTimestamp(input.updatedAt || input.createdAt, 'actionPlan.updatedAt'),
  });
};

const stateHistoryEntry = (input = {}) => deepFreeze({
  eventType: enumValue(
    input.eventType,
    'stateHistory.eventType',
    ['state_transition', 'scenario_selection'],
    'state_transition',
  ),
  eventId: requiredString(input.eventId, 'stateHistory.eventId'),
  from: input.from === null ? null : requiredString(input.from, 'stateHistory.from'),
  to: requiredString(input.to, 'stateHistory.to'),
  occurredAt: isoTimestamp(input.occurredAt, 'stateHistory.occurredAt'),
  actor: {
    kind: requiredString(input.actor?.kind, 'stateHistory.actor.kind'),
    id: optionalString(input.actor?.id, 'stateHistory.actor.id'),
  },
  reason: optionalString(input.reason, 'stateHistory.reason'),
  provenance: provenance(input.provenance),
});

const ensureUniqueIds = (items, field) => {
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_DUPLICATE_ID',
      `${field} contains duplicate ids.`,
      { field },
    );
  }
};

const lifeProject = (input = {}) => {
  const scenarios = Array.isArray(input.scenarios)
    ? input.scenarios.map(lifeProjectScenario)
    : [];
  const criteria = Array.isArray(input.criteria)
    ? input.criteria.map(decisionCriterion)
    : [];
  const actionPlans = Array.isArray(input.actionPlans)
    ? input.actionPlans.map(actionPlan)
    : [];
  const stateHistory = Array.isArray(input.stateHistory)
    ? input.stateHistory.map(stateHistoryEntry)
    : [];

  ensureUniqueIds(scenarios, 'lifeProject.scenarios');
  ensureUniqueIds(criteria, 'lifeProject.criteria');
  ensureUniqueIds(actionPlans, 'lifeProject.actionPlans');
  ensureUniqueIds(
    stateHistory.map((entry) => ({ id: entry.eventId })),
    'lifeProject.stateHistory',
  );

  const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));
  const activeScenarioId = optionalString(
    input.activeScenarioId,
    'lifeProject.activeScenarioId',
  );
  if (activeScenarioId && !scenarioIds.has(activeScenarioId)) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_SCENARIO_NOT_FOUND',
      'activeScenarioId must reference a scenario in the project.',
      { activeScenarioId },
    );
  }
  for (const plan of actionPlans) {
    if (!scenarioIds.has(plan.scenarioId)) {
      throw new LifeProjectContractError(
        'LIFE_PROJECT_SCENARIO_NOT_FOUND',
        'Every action plan must reference a scenario in the project.',
        { actionPlanId: plan.id, scenarioId: plan.scenarioId },
      );
    }
  }

  return deepFreeze({
    schemaVersion: CONTRACT_VERSION,
    id: requiredString(input.id, 'lifeProject.id'),
    ownerAccountId: requiredString(
      input.ownerAccountId,
      'lifeProject.ownerAccountId',
    ),
    title: requiredString(input.title, 'lifeProject.title'),
    purpose: optionalString(input.purpose, 'lifeProject.purpose'),
    state: enumValue(
      input.state,
      'lifeProject.state',
      LIFE_PROJECT_STATES,
      'exploration',
    ),
    activeScenarioId,
    scenarios,
    criteria,
    actionPlans,
    stateHistory,
    diagnostic: nullablePlainObject(input.diagnostic, 'lifeProject.diagnostic'),
    recommendation: nullablePlainObject(input.recommendation, 'lifeProject.recommendation'),
    missingInformation: stringArray(
      input.missingInformation,
      'lifeProject.missingInformation',
    ),
    uncertainty: uncertainty(input.uncertainty),
    provenance: provenance(input.provenance),
    createdAt: isoTimestamp(input.createdAt, 'lifeProject.createdAt'),
    updatedAt: isoTimestamp(input.updatedAt || input.createdAt, 'lifeProject.updatedAt'),
  });
};

module.exports = {
  CONTRACT_VERSION,
  LIFE_PROJECT_STATES,
  LifeProjectContractError,
  deepFreeze,
  createActionItem: actionItem,
  createActionPlan: actionPlan,
  createDecisionCriterion: decisionCriterion,
  createLifeProject: lifeProject,
  createLifeProjectScenario: lifeProjectScenario,
  createStateHistoryEntry: stateHistoryEntry,
};
