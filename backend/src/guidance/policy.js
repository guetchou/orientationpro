'use strict';

const VERSION = 'makoki-guidance-policy-v1';
const PERMISSIONS = Object.freeze([
  'guidance.read_assigned',
  'guidance.comment',
  'guidance.propose_reformulation',
  'guidance.follow_up',
  'guidance.confirm',
  'guidance.reject',
]);
const DATA_SCOPES = Object.freeze(['life-project-guidance']);
const INTERVENTION_TYPES = Object.freeze([
  'comment',
  'reformulation_proposed',
  'confirmation',
  'rejection',
  'follow_up',
  'disagreement',
  'correction_requested',
]);
const INTERVENTION_PERMISSIONS = Object.freeze({
  comment: 'guidance.comment',
  reformulation_proposed: 'guidance.propose_reformulation',
  confirmation: 'guidance.confirm',
  rejection: 'guidance.reject',
  follow_up: 'guidance.follow_up',
  disagreement: 'guidance.comment',
  correction_requested: 'guidance.comment',
});
const INTERVENTION_DECISIONS = Object.freeze({
  confirmation: 'confirmed',
  rejection: 'rejected',
});

class GuidancePolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const req = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new GuidancePolicyError('GUIDANCE_FIELD_REQUIRED', `${field} required`);
  }
  return value.trim();
};

const timestamp = (value, field) => {
  const parsed = new Date(req(value, field));
  if (Number.isNaN(parsed.getTime())) {
    throw new GuidancePolicyError('GUIDANCE_TIMESTAMP_INVALID', `${field} must be ISO-8601`);
  }
  return parsed.toISOString();
};

const createConsentLedger = ({ beneficiaryAccountId, scope }) => freeze({
  schemaVersion: VERSION,
  beneficiaryAccountId: req(beneficiaryAccountId, 'beneficiaryAccountId'),
  scope: req(scope, 'scope'),
  revision: 0,
  events: [],
});

const appendConsentDecision = (ledger, input) => {
  if (input.actorAccountId !== ledger.beneficiaryAccountId) {
    throw new GuidancePolicyError(
      'GUIDANCE_CONSENT_OWNER_REQUIRED',
      'Only beneficiary can decide consent',
    );
  }
  if (!['granted', 'revoked'].includes(input.decision)) {
    throw new GuidancePolicyError('GUIDANCE_CONSENT_DECISION_INVALID', 'Invalid decision');
  }

  const eventId = req(input.eventId, 'eventId');
  const decidedAt = timestamp(input.decidedAt, 'decidedAt');
  const existing = ledger.events.find((event) => event.eventId === eventId);
  if (existing) {
    const replayed = existing.decision === input.decision
      && existing.actorAccountId === input.actorAccountId
      && existing.decidedAt === decidedAt
      && existing.reason === req(input.reason, 'reason');
    if (replayed) return ledger;
    throw new GuidancePolicyError(
      'GUIDANCE_EVENT_CONFLICT',
      'An event id cannot be reused with different consent data',
    );
  }

  const latest = ledger.events.at(-1);
  if (latest && decidedAt <= latest.decidedAt) {
    throw new GuidancePolicyError(
      'GUIDANCE_CONSENT_STALE',
      'A consent decision must be newer than the effective decision',
    );
  }

  const revision = Number(ledger.revision || 0) + 1;
  return freeze({
    ...ledger,
    revision,
    events: [...ledger.events, {
      eventId,
      revision,
      decision: input.decision,
      actorAccountId: input.actorAccountId,
      decidedAt,
      scope: ledger.scope,
      reason: req(input.reason, 'reason'),
    }],
  });
};

const authorizeGuidance = ({
  actor,
  beneficiaryAccountId,
  assignment,
  consent,
  permission,
  dataScope,
}) => {
  if (actor?.role === 'beneficiary') {
    const allowed = actor.accountId === beneficiaryAccountId;
    return freeze({ allowed, reason: allowed ? 'owner' : 'not_owner' });
  }
  if (!['advisor', 'coach'].includes(actor?.role)
    || !PERMISSIONS.includes(permission)
    || !DATA_SCOPES.includes(dataScope)) {
    return freeze({ allowed: false, reason: 'role_or_permission_unknown' });
  }
  if (assignment?.active !== true
    || assignment.actorAccountId !== actor.accountId
    || assignment.beneficiaryAccountId !== beneficiaryAccountId
    || assignment.role !== actor.role) {
    return freeze({ allowed: false, reason: 'not_assigned' });
  }
  if (!assignment.dataScopes?.includes(dataScope) || consent?.scope !== dataScope) {
    return freeze({ allowed: false, reason: 'data_scope_not_granted' });
  }
  if (!actor.permissions?.includes(permission)) {
    return freeze({ allowed: false, reason: 'permission_missing' });
  }
  if (consent?.beneficiaryAccountId !== beneficiaryAccountId
    || consent.events?.at(-1)?.decision !== 'granted') {
    return freeze({ allowed: false, reason: 'consent_missing_or_revoked' });
  }
  return freeze({ allowed: true, reason: 'assigned_permission_and_consent' });
};

const authorizeIntervention = (input) => {
  const permission = INTERVENTION_PERMISSIONS[input.type];
  if (!permission) {
    return freeze({ allowed: false, reason: 'intervention_unknown' });
  }
  return authorizeGuidance({ ...input, permission });
};

const appendIntervention = (journal, input) => {
  if (!['beneficiary', 'advisor', 'coach'].includes(input?.actorRole)) {
    throw new GuidancePolicyError('GUIDANCE_ROLE_INVALID', 'Invalid actor role');
  }
  if (!INTERVENTION_TYPES.includes(input?.type)) {
    throw new GuidancePolicyError('GUIDANCE_INTERVENTION_INVALID', 'Invalid intervention type');
  }
  const events = journal?.events || [];
  if (events.some((event) => event.eventId === input.eventId)) {
    throw new GuidancePolicyError('GUIDANCE_EVENT_DUPLICATE', 'Append-only ids');
  }
  return freeze({
    schemaVersion: VERSION,
    events: [...events, {
      eventId: req(input.eventId, 'eventId'),
      type: req(input.type, 'type'),
      actorAccountId: req(input.actorAccountId, 'actorAccountId'),
      actorRole: req(input.actorRole, 'actorRole'),
      beneficiaryAccountId: req(input.beneficiaryAccountId, 'beneficiaryAccountId'),
      subjectRef: req(input.subjectRef, 'subjectRef'),
      recordedAt: timestamp(input.recordedAt, 'recordedAt'),
      scope: req(input.scope, 'scope'),
      decision: INTERVENTION_DECISIONS[input.type] || null,
      reason: req(input.reason, 'reason'),
      text: req(input.text, 'text'),
      replacesUserStatement: false,
    }],
  });
};

module.exports = {
  VERSION,
  PERMISSIONS,
  INTERVENTION_TYPES,
  INTERVENTION_PERMISSIONS,
  DATA_SCOPES,
  GuidancePolicyError,
  appendConsentDecision,
  appendIntervention,
  authorizeGuidance,
  authorizeIntervention,
  createConsentLedger,
};
