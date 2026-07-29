'use strict';

const { deepFreeze } = require('../provenance');
const { ContentRegistryContractError } = require('./contracts');

const VERIFICATION_WORKFLOW_VERSION = 'makoki-content-verification-v1';
const VERIFICATION_STATES = Object.freeze([
  'draft',
  'reviewed',
  'verified',
  'stale',
  'withdrawn',
]);
const TRANSITIONS = Object.freeze({
  draft: Object.freeze(['reviewed', 'withdrawn']),
  reviewed: Object.freeze(['draft', 'verified', 'withdrawn']),
  verified: Object.freeze(['stale', 'withdrawn']),
  stale: Object.freeze(['reviewed', 'withdrawn']),
  withdrawn: Object.freeze([]),
});

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_FIELD_REQUIRED',
      `${field} must be a non-empty string.`,
      { field },
    );
  }
  return value.trim();
};

const isoTimestamp = (value, field) => {
  const text = requiredString(value, field);
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return parsed.toISOString();
};

const strings = (value, field, { required = false } = {}) => {
  if (!Array.isArray(value)
    || (required && value.length === 0)
    || value.some((entry) => typeof entry !== 'string' || entry.trim() === '')) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_ARRAY_INVALID',
      `${field} must be an array of non-empty strings.`,
      { field },
    );
  }
  return [...new Set(value.map((entry) => entry.trim()))];
};

const humanActor = (input = {}, field = 'actor') => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_HUMAN_REQUIRED',
      `${field} must identify a human or authority actor.`,
      { field },
    );
  }
  if (!['human', 'authority'].includes(input.kind)) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_HUMAN_REQUIRED',
      'A system actor cannot decide content verification.',
      { actorKind: input.kind },
    );
  }
  return {
    kind: input.kind,
    id: requiredString(input.id, `${field}.id`),
    role: requiredString(input.role, `${field}.role`),
  };
};

const workflow = (record) => {
  const current = record?.verification || {};
  const status = VERIFICATION_STATES.includes(current.status)
    ? current.status
    : 'draft';
  return {
    schemaVersion: VERIFICATION_WORKFLOW_VERSION,
    status,
    statusChangedAt: current.statusChangedAt,
    decisions: Array.isArray(current.decisions) ? [...current.decisions] : [],
    corrections: Array.isArray(current.corrections) ? [...current.corrections] : [],
    disagreements: Array.isArray(current.disagreements) ? [...current.disagreements] : [],
    reports: Array.isArray(current.reports) ? [...current.reports] : [],
  };
};

const ensureUniqueEvent = (current, eventId) => {
  const events = [
    ...current.decisions,
    ...current.corrections,
    ...current.disagreements,
    ...current.reports,
  ];
  if (events.some((entry) => entry.eventId === eventId)) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_EVENT_DUPLICATE',
      'Verification event identifiers are append-only and unique.',
      { eventId },
    );
  }
};

const withWorkflow = (record, next) => deepFreeze({
  ...record,
  verification: next,
});

const applyVerificationDecision = (record, input = {}) => {
  const current = workflow(record);
  const to = requiredString(input.to, 'decision.to');
  if (!VERIFICATION_STATES.includes(to)
    || !TRANSITIONS[current.status].includes(to)) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_TRANSITION_FORBIDDEN',
      `Transition ${current.status} -> ${to} is forbidden.`,
      { from: current.status, to, allowed: TRANSITIONS[current.status] },
    );
  }
  const eventId = requiredString(input.eventId, 'decision.eventId');
  ensureUniqueEvent(current, eventId);
  const decidedBy = humanActor(input.decidedBy, 'decision.decidedBy');
  const evidenceIds = strings(input.evidenceIds || [], 'decision.evidenceIds');
  if (to === 'verified' && evidenceIds.length === 0) {
    throw new ContentRegistryContractError(
      'CONTENT_VERIFICATION_EVIDENCE_REQUIRED',
      'Promotion to verified requires explicit evidence.',
    );
  }
  const decision = deepFreeze({
    eventId,
    eventType: 'status_transition',
    from: current.status,
    to,
    decidedBy,
    decidedAt: isoTimestamp(input.decidedAt, 'decision.decidedAt'),
    reason: requiredString(input.reason, 'decision.reason'),
    evidenceIds,
  });
  return withWorkflow(record, {
    ...current,
    status: to,
    statusChangedAt: decision.decidedAt,
    decisions: [...current.decisions, decision],
  });
};

const recordCorrection = (record, input = {}) => {
  const current = workflow(record);
  const eventId = requiredString(input.eventId, 'correction.eventId');
  ensureUniqueEvent(current, eventId);
  const correction = deepFreeze({
    eventId,
    eventType: 'correction',
    recordedBy: humanActor(input.recordedBy, 'correction.recordedBy'),
    recordedAt: isoTimestamp(input.recordedAt, 'correction.recordedAt'),
    fields: strings(input.fields, 'correction.fields', { required: true }),
    reason: requiredString(input.reason, 'correction.reason'),
    previousRevisionId: requiredString(
      input.previousRevisionId,
      'correction.previousRevisionId',
    ),
    replacementRevisionId: requiredString(
      input.replacementRevisionId,
      'correction.replacementRevisionId',
    ),
  });
  return withWorkflow(record, {
    ...current,
    status: current.status === 'verified' ? 'stale' : current.status,
    statusChangedAt: current.status === 'verified'
      ? correction.recordedAt
      : current.statusChangedAt,
    corrections: [...current.corrections, correction],
  });
};

const recordDisagreement = (record, input = {}) => {
  const current = workflow(record);
  const eventId = requiredString(input.eventId, 'disagreement.eventId');
  ensureUniqueEvent(current, eventId);
  const disagreement = deepFreeze({
    eventId,
    eventType: 'disagreement',
    recordedBy: humanActor(input.recordedBy, 'disagreement.recordedBy'),
    recordedAt: isoTimestamp(input.recordedAt, 'disagreement.recordedAt'),
    statement: requiredString(input.statement, 'disagreement.statement'),
    evidenceIds: strings(input.evidenceIds || [], 'disagreement.evidenceIds'),
    resolutionStatus: 'open',
  });
  return withWorkflow(record, {
    ...current,
    disagreements: [...current.disagreements, disagreement],
  });
};

const reportContentIssue = (record, input = {}) => {
  const current = workflow(record);
  const eventId = requiredString(input.eventId, 'report.eventId');
  ensureUniqueEvent(current, eventId);
  const report = deepFreeze({
    eventId,
    eventType: 'content_report',
    issueType: requiredString(input.issueType, 'report.issueType'),
    reportedBy: humanActor(input.reportedBy, 'report.reportedBy'),
    reportedAt: isoTimestamp(input.reportedAt, 'report.reportedAt'),
    description: requiredString(input.description, 'report.description'),
    evidenceIds: strings(input.evidenceIds || [], 'report.evidenceIds'),
    status: 'open',
  });
  return withWorkflow(record, {
    ...current,
    status: current.status === 'verified' ? 'stale' : current.status,
    statusChangedAt: current.status === 'verified'
      ? report.reportedAt
      : current.statusChangedAt,
    reports: [...current.reports, report],
  });
};

module.exports = {
  TRANSITIONS,
  VERIFICATION_STATES,
  VERIFICATION_WORKFLOW_VERSION,
  applyVerificationDecision,
  recordCorrection,
  recordDisagreement,
  reportContentIssue,
};
