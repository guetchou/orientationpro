'use strict';

const PROVENANCE_CONTRACT_VERSION = 'makoki-provenance-v1';
const UNCERTAINTY_LEVELS = Object.freeze(['unknown', 'low', 'medium', 'high']);
const HYPOTHESIS_STATUSES = Object.freeze([
  'proposed', 'confirmed', 'rejected', 'superseded',
]);

class ProvenanceContractError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ProvenanceContractError';
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
    throw new ProvenanceContractError(
      'PROVENANCE_FIELD_REQUIRED',
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
    throw new ProvenanceContractError(
      'PROVENANCE_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return date.toISOString();
};

const stringArray = (value, field, { required = false } = {}) => {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value)
    || (required && value.length === 0)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new ProvenanceContractError(
      'PROVENANCE_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const enumValue = (value, field, allowed, fallback) => {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new ProvenanceContractError(
      'PROVENANCE_FIELD_REQUIRED',
      `${field} is required.`,
      { field },
    );
  }
  if (!allowed.includes(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_ENUM_INVALID',
      `${field} is invalid.`,
      { field, value, allowed },
    );
  }
  return value;
};

const jsonValue = (value, field) => {
  if (value === undefined) {
    throw new ProvenanceContractError(
      'PROVENANCE_VALUE_REQUIRED',
      `${field} is required.`,
      { field },
    );
  }
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError('not JSON serializable');
    return JSON.parse(serialized);
  } catch {
    throw new ProvenanceContractError(
      'PROVENANCE_VALUE_INVALID',
      `${field} must be JSON serializable.`,
      { field },
    );
  }
};

const entityReference = (value = {}, field = 'subject') => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return {
    type: requiredString(value.type, `${field}.type`),
    id: requiredString(value.id, `${field}.id`),
  };
};

const actor = (value = {}, field = 'actor') => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      `${field} must be a plain object.`,
      { field },
    );
  }
  return {
    kind: enumValue(value.kind, `${field}.kind`, ['human', 'authority', 'system']),
    id: requiredString(value.id, `${field}.id`),
    role: optionalString(value.role, `${field}.role`),
  };
};

const source = (value = {}) => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      'source must be a plain object.',
      { field: 'source' },
    );
  }
  const type = enumValue(value.type, 'source.type', [
    'user_statement',
    'document',
    'observation',
    'external_authority',
    'assessment',
    'system_derivation',
    'human_decision',
  ]);
  const result = {
    type,
    id: requiredString(value.id, 'source.id'),
    version: optionalString(value.version, 'source.version'),
    authorityName: optionalString(value.authorityName, 'source.authorityName'),
    retrievedAt: value.retrievedAt
      ? isoTimestamp(value.retrievedAt, 'source.retrievedAt')
      : null,
    uri: optionalString(value.uri, 'source.uri'),
  };
  if (type === 'external_authority'
    && (!result.authorityName || !result.retrievedAt || !result.version)) {
    throw new ProvenanceContractError(
      'PROVENANCE_AUTHORITY_INCOMPLETE',
      'An external authority source requires authorityName, retrievedAt and version.',
      { sourceId: result.id },
    );
  }
  return result;
};

const uncertainty = (value = {}) => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      'uncertainty must be a plain object.',
      { field: 'uncertainty' },
    );
  }
  if ('confidencePercent' in value || 'probability' in value) {
    throw new ProvenanceContractError(
      'PROVENANCE_FALSE_PRECISION_FORBIDDEN',
      'Use a descriptive uncertainty level and reasons instead of an unsupported percentage.',
    );
  }
  return {
    level: enumValue(
      value.level,
      'uncertainty.level',
      UNCERTAINTY_LEVELS,
      'unknown',
    ),
    reasons: stringArray(value.reasons, 'uncertainty.reasons'),
  };
};

const access = (value = {}) => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      'access must be a plain object.',
      { field: 'access' },
    );
  }
  return {
    classification: enumValue(
      value.classification,
      'access.classification',
      ['public', 'account_private', 'delegated', 'restricted'],
      'account_private',
    ),
    allowedRoles: stringArray(value.allowedRoles, 'access.allowedRoles'),
    restrictions: stringArray(value.restrictions, 'access.restrictions'),
  };
};

const confirmation = (value = {}) => {
  if (!isPlainObject(value)) {
    throw new ProvenanceContractError(
      'PROVENANCE_OBJECT_INVALID',
      'confirmation must be a plain object.',
      { field: 'confirmation' },
    );
  }
  const confirmedBy = actor(value.confirmedBy, 'confirmation.confirmedBy');
  if (!['human', 'authority'].includes(confirmedBy.kind)) {
    throw new ProvenanceContractError(
      'PROVENANCE_AUTOMATIC_CONFIRMATION_FORBIDDEN',
      'A fact cannot be confirmed solely by a system actor.',
      { actorKind: confirmedBy.kind },
    );
  }
  return {
    method: requiredString(value.method, 'confirmation.method'),
    confirmedBy,
    confirmedAt: isoTimestamp(value.confirmedAt, 'confirmation.confirmedAt'),
    evidenceIds: stringArray(value.evidenceIds, 'confirmation.evidenceIds'),
    notes: optionalString(value.notes, 'confirmation.notes'),
  };
};

const createEvidence = (input = {}) => {
  const evidenceSource = source(input.source);
  const verificationStatus = enumValue(
    input.verificationStatus,
    'evidence.verificationStatus',
    ['unverified', 'reported', 'verified'],
    'unverified',
  );
  if (verificationStatus === 'verified'
    && evidenceSource.type !== 'external_authority') {
    throw new ProvenanceContractError(
      'PROVENANCE_VERIFICATION_SOURCE_INVALID',
      'Verified external evidence requires a complete external_authority source.',
      { sourceType: evidenceSource.type },
    );
  }
  return deepFreeze({
    schemaVersion: PROVENANCE_CONTRACT_VERSION,
    id: requiredString(input.id, 'evidence.id'),
    evidenceType: enumValue(input.evidenceType, 'evidence.evidenceType', [
      'user_statement',
      'document',
      'registry_record',
      'observation',
      'assessment_result',
      'interview_note',
      'other',
    ]),
    subject: input.subject
      ? entityReference(input.subject, 'evidence.subject')
      : null,
    source: evidenceSource,
    observedAt: isoTimestamp(input.observedAt, 'evidence.observedAt'),
    scope: stringArray(input.scope, 'evidence.scope', { required: true }),
    verificationStatus,
    integrity: {
      algorithm: optionalString(
        input.integrity?.algorithm,
        'evidence.integrity.algorithm',
      ),
      digest: optionalString(input.integrity?.digest, 'evidence.integrity.digest'),
    },
    reference: optionalString(input.reference, 'evidence.reference'),
    access: access(input.access),
    createdAt: isoTimestamp(input.createdAt, 'evidence.createdAt'),
  });
};

const createFact = (input = {}) => {
  const validFrom = input.validFrom
    ? isoTimestamp(input.validFrom, 'fact.validFrom')
    : null;
  const validUntil = input.validUntil
    ? isoTimestamp(input.validUntil, 'fact.validUntil')
    : null;
  if (validFrom && validUntil && validUntil < validFrom) {
    throw new ProvenanceContractError(
      'PROVENANCE_VALIDITY_INTERVAL_INVALID',
      'fact.validUntil cannot be earlier than fact.validFrom.',
      { validFrom, validUntil },
    );
  }
  return deepFreeze({
    schemaVersion: PROVENANCE_CONTRACT_VERSION,
    id: requiredString(input.id, 'fact.id'),
    subject: entityReference(input.subject, 'fact.subject'),
    predicate: requiredString(input.predicate, 'fact.predicate'),
    value: jsonValue(input.value, 'fact.value'),
    source: source(input.source),
    confirmation: confirmation(input.confirmation),
    observedAt: isoTimestamp(input.observedAt, 'fact.observedAt'),
    validFrom,
    validUntil,
    uncertainty: uncertainty(input.uncertainty),
    access: access(input.access),
    createdAt: isoTimestamp(input.createdAt, 'fact.createdAt'),
  });
};

const decision = (input = {}) => {
  const decidedBy = actor(input.decidedBy, 'decision.decidedBy');
  if (decidedBy.kind !== 'human') {
    throw new ProvenanceContractError(
      'PROVENANCE_HUMAN_DECISION_REQUIRED',
      'Hypothesis decisions require a human actor.',
      { actorKind: decidedBy.kind },
    );
  }
  return deepFreeze({
    eventId: requiredString(input.eventId, 'decision.eventId'),
    outcome: enumValue(
      input.outcome,
      'decision.outcome',
      ['confirmed', 'rejected', 'superseded'],
    ),
    decidedBy,
    decidedAt: isoTimestamp(input.decidedAt, 'decision.decidedAt'),
    reason: requiredString(input.reason, 'decision.reason'),
    evidenceIds: stringArray(input.evidenceIds, 'decision.evidenceIds'),
  });
};

const normalizeHypothesis = (input = {}, { allowDecided = false } = {}) => {
  const decisions = Array.isArray(input.decisions)
    ? input.decisions.map(decision)
    : [];
  const eventIds = decisions.map((entry) => entry.eventId);
  if (new Set(eventIds).size !== eventIds.length) {
    throw new ProvenanceContractError(
      'PROVENANCE_DUPLICATE_DECISION',
      'Hypothesis decision event ids must be unique.',
    );
  }
  const status = enumValue(
    input.status,
    'hypothesis.status',
    HYPOTHESIS_STATUSES,
    'proposed',
  );
  if (!allowDecided && status !== 'proposed') {
    throw new ProvenanceContractError(
      'PROVENANCE_DECISION_REQUIRED',
      'A hypothesis must be created as proposed and decided through an explicit human event.',
      { status },
    );
  }
  if (status === 'proposed' && decisions.length > 0) {
    throw new ProvenanceContractError(
      'PROVENANCE_STATUS_HISTORY_MISMATCH',
      'A proposed hypothesis cannot already contain decisions.',
    );
  }
  if (status !== 'proposed' && decisions.at(-1)?.outcome !== status) {
    throw new ProvenanceContractError(
      'PROVENANCE_STATUS_HISTORY_MISMATCH',
      'Hypothesis status must match the latest decision outcome.',
      { status },
    );
  }
  return deepFreeze({
    schemaVersion: PROVENANCE_CONTRACT_VERSION,
    id: requiredString(input.id, 'hypothesis.id'),
    subject: entityReference(input.subject, 'hypothesis.subject'),
    hypothesisType: requiredString(
      input.hypothesisType,
      'hypothesis.hypothesisType',
    ),
    value: jsonValue(input.value, 'hypothesis.value'),
    generator: {
      kind: enumValue(
        input.generator?.kind,
        'hypothesis.generator.kind',
        ['human', 'system', 'import'],
      ),
      id: requiredString(input.generator?.id, 'hypothesis.generator.id'),
      version: optionalString(
        input.generator?.version,
        'hypothesis.generator.version',
      ),
    },
    rationale: stringArray(
      input.rationale,
      'hypothesis.rationale',
      { required: true },
    ),
    evidenceIds: stringArray(input.evidenceIds, 'hypothesis.evidenceIds'),
    status,
    decisions,
    uncertainty: uncertainty(input.uncertainty),
    access: access(input.access),
    createdAt: isoTimestamp(input.createdAt, 'hypothesis.createdAt'),
    updatedAt: isoTimestamp(
      input.updatedAt || input.createdAt,
      'hypothesis.updatedAt',
    ),
  });
};

const createHypothesis = (input = {}) => normalizeHypothesis(input);

const applyHypothesisDecision = (hypothesisInput, decisionInput = {}) => {
  const hypothesis = normalizeHypothesis(
    hypothesisInput,
    { allowDecided: true },
  );
  const nextDecision = decision(decisionInput);
  if (hypothesis.decisions.some((entry) => entry.eventId === nextDecision.eventId)) {
    throw new ProvenanceContractError(
      'PROVENANCE_DUPLICATE_DECISION',
      'Hypothesis decision event ids must be unique.',
      { eventId: nextDecision.eventId },
    );
  }
  const allowed = hypothesis.status === 'proposed'
    ? ['confirmed', 'rejected']
    : ['superseded'];
  if (!allowed.includes(nextDecision.outcome)) {
    throw new ProvenanceContractError(
      'PROVENANCE_DECISION_FORBIDDEN',
      `Decision ${nextDecision.outcome} is not allowed from ${hypothesis.status}.`,
      { status: hypothesis.status, allowed },
    );
  }
  return normalizeHypothesis({
    ...hypothesis,
    status: nextDecision.outcome,
    decisions: [...hypothesis.decisions, nextDecision],
    updatedAt: nextDecision.decidedAt,
  }, { allowDecided: true });
};

const promoteHypothesisToFact = (hypothesisInput, factInput = {}) => {
  const hypothesis = normalizeHypothesis(
    hypothesisInput,
    { allowDecided: true },
  );
  if (hypothesis.status !== 'confirmed') {
    throw new ProvenanceContractError(
      'PROVENANCE_HYPOTHESIS_NOT_CONFIRMED',
      'Only a confirmed hypothesis can be promoted to a fact.',
      { status: hypothesis.status },
    );
  }
  return createFact({
    ...factInput,
    value: factInput.value === undefined ? hypothesis.value : factInput.value,
    source: factInput.source || {
      type: 'human_decision',
      id: hypothesis.decisions.at(-1).eventId,
      version: PROVENANCE_CONTRACT_VERSION,
    },
  });
};

module.exports = {
  HYPOTHESIS_STATUSES,
  PROVENANCE_CONTRACT_VERSION,
  ProvenanceContractError,
  UNCERTAINTY_LEVELS,
  applyHypothesisDecision,
  createEvidence,
  createFact,
  createHypothesis,
  deepFreeze,
  promoteHypothesisToFact,
};
