'use strict';

const { deepFreeze } = require('./contracts');

const RECOMMENDATION_ENGINE_VERSION = 'makoki-life-recommendation-v1';
const RECOMMENDATION_SCHEMA_VERSION = 'makoki-life-recommendation-output-v1';
const LOCAL_OPTION_SCHEMA_VERSION = 'makoki-local-option-v1';
const RECOMMENDATION_CATEGORIES = Object.freeze([
  'education', 'training', 'occupation', 'bridge', 'entrepreneurship',
]);
const CONFIDENCE_LEVELS = Object.freeze(['high', 'medium', 'low']);
const VERIFICATION_STATUSES = Object.freeze(['verified', 'to_confirm', 'obsolete']);

class LifeRecommendationContractError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeRecommendationContractError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const isPlainObject = (value) => Boolean(value)
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_FIELD_REQUIRED',
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

const stringArray = (value, field) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const objectArray = (value, field, mapper) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_ARRAY_INVALID',
      `${field} must be an array.`,
      { field },
    );
  }
  return value.map((entry, index) => mapper(entry, `${field}[${index}]`));
};

const plainObject = (value, field, fallback = {}) => {
  if (value === undefined || value === null) return { ...fallback };
  if (!isPlainObject(value)) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return { ...value };
};

const enumValue = (value, field, allowed, fallback = undefined) => {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) {
    return fallback;
  }
  if (!allowed.includes(value)) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_ENUM_INVALID',
      `${field} is invalid.`,
      { field, value, allowed },
    );
  }
  return value;
};

const boundedNumber = (value, field, minimum, maximum, fallback = undefined) => {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) {
    return fallback;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < minimum || numeric > maximum) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_NUMBER_INVALID',
      `${field} must be between ${minimum} and ${maximum}.`,
      { field, value },
    );
  }
  return numeric;
};

const positiveInteger = (value, field, fallback = undefined) => {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) {
    return fallback;
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_INTEGER_INVALID',
      `${field} must be a positive integer.`,
      { field, value },
    );
  }
  return numeric;
};

const isoTimestamp = (value, field, fallback = undefined) => {
  if ((value === undefined || value === null || value === '') && fallback !== undefined) {
    return fallback;
  }
  const text = requiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return date.toISOString();
};

const recommendationReason = (input = {}, field = 'reason') => {
  const value = plainObject(input, field);
  return deepFreeze({
    signal: requiredString(value.signal, `${field}.signal`),
    explanation: requiredString(value.explanation, `${field}.explanation`),
    score: boundedNumber(value.score, `${field}.score`, 0, 100, null),
  });
};

const sourceReference = (input = {}, field = 'sourceReference') => {
  const value = plainObject(input, field);
  return deepFreeze({
    id: requiredString(value.id, `${field}.id`),
    title: requiredString(value.title, `${field}.title`),
    kind: requiredString(value.kind, `${field}.kind`),
    url: optionalString(value.url, `${field}.url`),
    version: optionalString(value.version, `${field}.version`),
    verifiedAt: isoTimestamp(value.verifiedAt, `${field}.verifiedAt`, null),
    verificationStatus: enumValue(
      value.verificationStatus,
      `${field}.verificationStatus`,
      VERIFICATION_STATUSES,
      'to_confirm',
    ),
    scope: optionalString(value.scope, `${field}.scope`),
  });
};

const firstAction = (input = {}, field = 'firstAction') => {
  const value = plainObject(input, field);
  return deepFreeze({
    title: requiredString(value.title, `${field}.title`),
    deadlineDays: positiveInteger(value.deadlineDays, `${field}.deadlineDays`),
    expectedEvidence: requiredString(value.expectedEvidence, `${field}.expectedEvidence`),
  });
};

const localOpportunity = (input = {}, field = 'localOpportunity') => {
  const value = plainObject(input, field);
  return deepFreeze({
    id: requiredString(value.id, `${field}.id`),
    title: requiredString(value.title, `${field}.title`),
    organization: optionalString(value.organization, `${field}.organization`),
    zone: optionalString(value.zone, `${field}.zone`),
    sourceReferenceId: requiredString(
      value.sourceReferenceId,
      `${field}.sourceReferenceId`,
    ),
    status: enumValue(
      value.status,
      `${field}.status`,
      VERIFICATION_STATUSES,
      'to_confirm',
    ),
  });
};

const cost = (input = {}, field = 'cost') => {
  const value = plainObject(input, field);
  return deepFreeze({
    amount: boundedNumber(value.amount, `${field}.amount`, 0, Number.MAX_SAFE_INTEGER, null),
    currency: optionalString(value.currency, `${field}.currency`),
    fundingAvailable: value.fundingAvailable === true,
    status: enumValue(value.status, `${field}.status`, ['known', 'range', 'unknown'], 'unknown'),
  });
};

const calendar = (input = {}, field = 'calendar') => {
  const value = plainObject(input, field);
  return deepFreeze({
    status: enumValue(value.status, `${field}.status`, ['open', 'closed', 'unknown'], 'unknown'),
    nextStartAt: isoTimestamp(value.nextStartAt, `${field}.nextStartAt`, null),
    applicationDeadlineAt: isoTimestamp(
      value.applicationDeadlineAt,
      `${field}.applicationDeadlineAt`,
      null,
    ),
  });
};

const entryLevel = (input = {}, field = 'entryLevel') => {
  const value = plainObject(input, field);
  return deepFreeze({
    minimumRank: boundedNumber(value.minimumRank, `${field}.minimumRank`, 0, 20, null),
    label: optionalString(value.label, `${field}.label`),
    status: enumValue(value.status, `${field}.status`, ['verified', 'to_confirm'], 'to_confirm'),
  });
};

const createLocalOption = (input = {}) => {
  const value = plainObject(input, 'option');
  const references = objectArray(value.sourceReferences, 'option.sourceReferences', sourceReference);
  const opportunities = objectArray(
    value.localOpportunities,
    'option.localOpportunities',
    localOpportunity,
  );
  const referenceIds = new Set(references.map((reference) => reference.id));
  for (const opportunity of opportunities) {
    if (!referenceIds.has(opportunity.sourceReferenceId)) {
      throw new LifeRecommendationContractError(
        'LIFE_RECOMMENDATION_SOURCE_NOT_FOUND',
        'Every local opportunity must reference a declared source.',
        { opportunityId: opportunity.id, sourceReferenceId: opportunity.sourceReferenceId },
      );
    }
  }
  if (references.length === 0) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_SOURCE_REQUIRED',
      'A local option requires at least one source reference.',
      { optionId: value.id || null },
    );
  }

  return deepFreeze({
    schemaVersion: LOCAL_OPTION_SCHEMA_VERSION,
    id: requiredString(value.id, 'option.id'),
    title: requiredString(value.title, 'option.title'),
    category: enumValue(value.category, 'option.category', RECOMMENDATION_CATEGORIES),
    diversificationGroup: requiredString(
      value.diversificationGroup || value.category,
      'option.diversificationGroup',
    ),
    status: enumValue(value.status, 'option.status', ['available', 'conditional', 'unavailable'], 'conditional'),
    fallback: value.fallback === true,
    exploratory: value.exploratory === true,
    geographies: stringArray(value.geographies, 'option.geographies'),
    modes: stringArray(value.modes, 'option.modes'),
    entryLevel: entryLevel(value.entryLevel, 'option.entryLevel'),
    durationMonths: boundedNumber(value.durationMonths, 'option.durationMonths', 0, 240, null),
    cost: cost(value.cost, 'option.cost'),
    calendar: calendar(value.calendar, 'option.calendar'),
    interests: stringArray(value.interests, 'option.interests'),
    skills: stringArray(value.skills, 'option.skills'),
    preferences: stringArray(value.preferences, 'option.preferences'),
    requiredEquipment: stringArray(value.requiredEquipment, 'option.requiredEquipment'),
    regulatoryRequirements: stringArray(
      value.regulatoryRequirements,
      'option.regulatoryRequirements',
    ),
    requiredDocuments: stringArray(value.requiredDocuments, 'option.requiredDocuments'),
    conditions: stringArray(value.conditions, 'option.conditions'),
    risks: stringArray(value.risks, 'option.risks'),
    supports: stringArray(value.supports, 'option.supports'),
    experimentActions: objectArray(
      value.experimentActions,
      'option.experimentActions',
      firstAction,
    ),
    sourceReferences: references,
    localOpportunities: opportunities,
    verificationStatus: enumValue(
      value.verificationStatus,
      'option.verificationStatus',
      VERIFICATION_STATUSES,
      'to_confirm',
    ),
    reliabilityLevel: enumValue(
      value.reliabilityLevel,
      'option.reliabilityLevel',
      ['high', 'medium', 'low'],
      'low',
    ),
  });
};

const createRecommendationScenario = (input = {}) => {
  const value = plainObject(input, 'scenario');
  return deepFreeze({
    id: requiredString(value.id, 'scenario.id'),
    optionId: requiredString(value.optionId, 'scenario.optionId'),
    title: requiredString(value.title, 'scenario.title'),
    category: enumValue(value.category, 'scenario.category', RECOMMENDATION_CATEGORIES),
    positioning: enumValue(
      value.positioning,
      'scenario.positioning',
      ['priority', 'adjacent', 'alternative', 'fallback', 'exploratory'],
      'alternative',
    ),
    rank: positiveInteger(value.rank, 'scenario.rank'),
    fitScore: boundedNumber(value.fitScore, 'scenario.fitScore', 0, 100),
    confidence: enumValue(value.confidence, 'scenario.confidence', CONFIDENCE_LEVELS),
    reasons: objectArray(value.reasons, 'scenario.reasons', recommendationReason),
    strengths: stringArray(value.strengths, 'scenario.strengths'),
    conditions: stringArray(value.conditions, 'scenario.conditions'),
    risks: stringArray(value.risks, 'scenario.risks'),
    blockingFactors: stringArray(value.blockingFactors, 'scenario.blockingFactors'),
    missingInformation: stringArray(
      value.missingInformation,
      'scenario.missingInformation',
    ),
    localOpportunities: objectArray(
      value.localOpportunities,
      'scenario.localOpportunities',
      localOpportunity,
    ),
    sourceReferences: objectArray(
      value.sourceReferences,
      'scenario.sourceReferences',
      sourceReference,
    ),
    firstActions: objectArray(value.firstActions, 'scenario.firstActions', firstAction),
    alternatives: stringArray(value.alternatives, 'scenario.alternatives'),
    scoreBreakdown: plainObject(value.scoreBreakdown, 'scenario.scoreBreakdown'),
    penalties: plainObject(value.penalties, 'scenario.penalties'),
    generatedAt: isoTimestamp(value.generatedAt, 'scenario.generatedAt'),
    engineVersion: enumValue(
      value.engineVersion,
      'scenario.engineVersion',
      [RECOMMENDATION_ENGINE_VERSION],
    ),
  });
};

const createNonPrioritizedOption = (input = {}) => {
  const value = plainObject(input, 'nonPrioritizedOption');
  return deepFreeze({
    optionId: requiredString(value.optionId, 'nonPrioritizedOption.optionId'),
    title: requiredString(value.title, 'nonPrioritizedOption.title'),
    reasons: stringArray(value.reasons, 'nonPrioritizedOption.reasons'),
  });
};

const createRecommendationOutput = (input = {}) => {
  const value = plainObject(input, 'recommendationOutput');
  const scenarios = objectArray(
    value.scenarios,
    'recommendationOutput.scenarios',
    createRecommendationScenario,
  );
  const complete = scenarios.length >= 3 && scenarios.length <= 5;
  if (value.status === 'complete' && !complete) {
    throw new LifeRecommendationContractError(
      'LIFE_RECOMMENDATION_SCENARIO_COUNT_INVALID',
      'A complete recommendation must contain between three and five scenarios.',
      { scenarioCount: scenarios.length },
    );
  }
  return deepFreeze({
    schemaVersion: RECOMMENDATION_SCHEMA_VERSION,
    engineVersion: enumValue(
      value.engineVersion,
      'recommendationOutput.engineVersion',
      [RECOMMENDATION_ENGINE_VERSION],
    ),
    status: enumValue(
      value.status,
      'recommendationOutput.status',
      ['complete', 'insufficient_options'],
      complete ? 'complete' : 'insufficient_options',
    ),
    generatedAt: isoTimestamp(value.generatedAt, 'recommendationOutput.generatedAt'),
    diagnosticSummary: plainObject(
      value.diagnosticSummary,
      'recommendationOutput.diagnosticSummary',
    ),
    scenarios,
    nonPrioritized: objectArray(
      value.nonPrioritized,
      'recommendationOutput.nonPrioritized',
      createNonPrioritizedOption,
    ),
    missingInformation: stringArray(
      value.missingInformation,
      'recommendationOutput.missingInformation',
    ),
  });
};

module.exports = {
  CONFIDENCE_LEVELS,
  LOCAL_OPTION_SCHEMA_VERSION,
  LifeRecommendationContractError,
  RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_ENGINE_VERSION,
  RECOMMENDATION_SCHEMA_VERSION,
  VERIFICATION_STATUSES,
  createLocalOption,
  createRecommendationOutput,
  createRecommendationScenario,
  createSourceReference: sourceReference,
};
