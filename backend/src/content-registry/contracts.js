'use strict';

const {
  createEvidence,
  createFact,
  createHypothesis,
  deepFreeze,
} = require('../provenance');

const CONTENT_REGISTRY_VERSION = 'makoki-content-registry-v1';
const CONTENT_KINDS = Object.freeze([
  'country',
  'education_system',
  'qualification',
  'training',
  'institution',
  'occupation',
  'skill',
  'pathway',
  'authority',
  'regulated_profession',
]);
const SOURCE_LEVELS = Object.freeze([
  'international',
  'national',
  'local',
  'user_statement',
]);
const GEOGRAPHIC_LEVELS = Object.freeze([
  'international',
  'national',
  'subnational',
  'local',
  'unknown',
]);
const RELATION_TYPES = Object.freeze([
  'equivalence',
  'recognition',
  'admission',
  'licensing',
  'part_of',
  'related_to',
]);

class ContentRegistryContractError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ContentRegistryContractError';
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
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_FIELD_REQUIRED',
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

const enumValue = (value, field, allowed) => {
  if (!allowed.includes(value)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_ENUM_INVALID',
      `${field} is invalid.`,
      { field, value, allowed },
    );
  }
  return value;
};

const isoTimestamp = (value, field) => {
  const text = requiredString(value, field);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return parsed.toISOString();
};

const stringArray = (value, field, { required = false } = {}) => {
  if (!Array.isArray(value)
    || (required && value.length === 0)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const localizedText = (input = {}, field) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return {
    language: requiredString(input.language, `${field}.language`),
    value: requiredString(input.value, `${field}.value`),
  };
};

const source = (input = {}) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      'source must be a plain object.',
      { field: 'source' },
    );
  }
  const level = enumValue(input.level, 'source.level', SOURCE_LEVELS);
  const responsibleParty = requiredString(
    input.responsibleParty,
    'source.responsibleParty',
  );
  if (level === 'user_statement' && input.authorityName) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_USER_STATEMENT_AUTHORITY_FORBIDDEN',
      'A user statement cannot be represented as an authority source.',
    );
  }
  return {
    id: requiredString(input.id, 'source.id'),
    level,
    title: requiredString(input.title, 'source.title'),
    responsibleParty,
    authorityName: optionalString(input.authorityName, 'source.authorityName'),
    uri: optionalString(input.uri, 'source.uri'),
    license: requiredString(input.license, 'source.license'),
    version: requiredString(input.version, 'source.version'),
    retrievedAt: isoTimestamp(input.retrievedAt, 'source.retrievedAt'),
  };
};

const geographicScope = (input = {}) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      'geographicScope must be a plain object.',
      { field: 'geographicScope' },
    );
  }
  const level = enumValue(
    input.level,
    'geographicScope.level',
    GEOGRAPHIC_LEVELS,
  );
  const codes = stringArray(input.codes || [], 'geographicScope.codes');
  if (['national', 'subnational', 'local'].includes(level) && codes.length === 0) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_GEOGRAPHY_REQUIRED',
      'A national, subnational or local scope requires explicit geographic codes.',
      { level },
    );
  }
  return {
    level,
    codes,
    description: requiredString(
      input.description,
      'geographicScope.description',
    ),
  };
};

const freshness = (input = {}) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      'freshness must be a plain object.',
      { field: 'freshness' },
    );
  }
  return {
    status: enumValue(
      input.status,
      'freshness.status',
      ['current', 'stale', 'unknown'],
    ),
    checkedAt: isoTimestamp(input.checkedAt, 'freshness.checkedAt'),
    nextReviewAt: input.nextReviewAt
      ? isoTimestamp(input.nextReviewAt, 'freshness.nextReviewAt')
      : null,
    notes: requiredString(input.notes, 'freshness.notes'),
  };
};

const initialVerification = (input = {}) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      'verification must be a plain object.',
      { field: 'verification' },
    );
  }
  if (input.status !== 'draft' || (input.decisions?.length || 0) !== 0) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_VERIFICATION_WORKFLOW_REQUIRED',
      'Content must be created as draft and promoted only through the human verification workflow.',
      { status: input.status },
    );
  }
  return { status: 'draft', decisions: [] };
};

const assertions = (input = {}, contentId) => {
  if (!isPlainObject(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_OBJECT_INVALID',
      'assertions must be a plain object.',
      { field: 'assertions' },
    );
  }
  const evidence = (input.evidence || []).map(createEvidence);
  const hypotheses = (input.hypotheses || []).map(createHypothesis);
  const facts = (input.facts || []).map(createFact);
  for (const assertion of [...hypotheses, ...facts]) {
    if (assertion.subject.id !== contentId) {
      throw new ContentRegistryContractError(
        'CONTENT_REGISTRY_ASSERTION_SUBJECT_MISMATCH',
        'Every hypothesis and fact must reference its content record.',
        { contentId, assertionId: assertion.id },
      );
    }
  }
  return { evidence, hypotheses, facts };
};

const createContentRecord = (input = {}) => {
  const id = requiredString(input.id, 'content.id');
  const labels = Array.isArray(input.labels)
    ? input.labels.map((entry, index) => localizedText(entry, `labels[${index}]`))
    : [];
  if (labels.length === 0) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_LABEL_REQUIRED',
      'At least one sourced language label is required.',
    );
  }
  return deepFreeze({
    schemaVersion: CONTENT_REGISTRY_VERSION,
    id,
    kind: enumValue(input.kind, 'content.kind', CONTENT_KINDS),
    labels,
    descriptions: Array.isArray(input.descriptions)
      ? input.descriptions.map(
        (entry, index) => localizedText(entry, `descriptions[${index}]`),
      )
      : [],
    source: source(input.source),
    geographicScope: geographicScope(input.geographicScope),
    languages: stringArray(input.languages, 'languages', { required: true }),
    freshness: freshness(input.freshness),
    verification: initialVerification(input.verification),
    assertions: assertions(input.assertions, id),
    createdAt: isoTimestamp(input.createdAt, 'content.createdAt'),
  });
};

const authorityConfirmedRelation = (fact, relationType, sourceId, targetId) => {
  if (!fact
    || fact.confirmation?.confirmedBy?.kind !== 'authority'
    || fact.subject?.id !== sourceId
    || fact.value?.targetId !== targetId
    || fact.value?.relationType !== relationType) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_AUTHORITY_CONFIRMATION_REQUIRED',
      'A confirmed equivalence, recognition, admission or licensing relation requires a matching FactV1 confirmed by an authority.',
      { relationType, sourceId, targetId },
    );
  }
};

const createContentRelation = (input = {}) => {
  const relationType = enumValue(
    input.relationType,
    'relation.relationType',
    RELATION_TYPES,
  );
  const status = enumValue(
    input.status,
    'relation.status',
    ['unknown', 'proposed', 'confirmed', 'withdrawn'],
  );
  const sourceId = requiredString(input.sourceId, 'relation.sourceId');
  const targetId = requiredString(input.targetId, 'relation.targetId');
  const hypothesis = input.hypothesis ? createHypothesis(input.hypothesis) : null;
  const fact = input.fact ? createFact(input.fact) : null;
  const regulated = ['equivalence', 'recognition', 'admission', 'licensing']
    .includes(relationType);

  if (status === 'proposed' && !hypothesis) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_HYPOTHESIS_REQUIRED',
      'A proposed relation requires a HypothesisV1.',
    );
  }
  if (status === 'confirmed') {
    if (!fact) {
      throw new ContentRegistryContractError(
        'CONTENT_REGISTRY_FACT_REQUIRED',
        'A confirmed relation requires a FactV1.',
      );
    }
    if (regulated) {
      authorityConfirmedRelation(fact, relationType, sourceId, targetId);
    }
  }
  if (status === 'unknown' && (hypothesis || fact)) {
    throw new ContentRegistryContractError(
      'CONTENT_REGISTRY_UNKNOWN_ASSERTION_FORBIDDEN',
      'An unknown relation cannot silently carry an assertion.',
    );
  }

  return deepFreeze({
    schemaVersion: CONTENT_REGISTRY_VERSION,
    id: requiredString(input.id, 'relation.id'),
    relationType,
    sourceId,
    targetId,
    status,
    hypothesis,
    fact,
    notes: requiredString(input.notes, 'relation.notes'),
    createdAt: isoTimestamp(input.createdAt, 'relation.createdAt'),
  });
};

const createEmptyContentRegistry = () => deepFreeze({
  schemaVersion: CONTENT_REGISTRY_VERSION,
  records: [],
  relations: [],
  activationStatus: 'inactive',
});

module.exports = {
  CONTENT_KINDS,
  CONTENT_REGISTRY_VERSION,
  GEOGRAPHIC_LEVELS,
  RELATION_TYPES,
  SOURCE_LEVELS,
  ContentRegistryContractError,
  createContentRecord,
  createContentRelation,
  createEmptyContentRegistry,
};
