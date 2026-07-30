'use strict';

const APPLICATION_STATES = Object.freeze([
  'submitted',
  'under_review',
  'shortlisted',
  'interview_planned',
  'interview_completed',
  'offer_proposed',
  'hired',
  'rejected',
  'withdrawn',
]);

const TERMINAL_STATES = Object.freeze(new Set(['hired', 'rejected', 'withdrawn']));

const TRANSITIONS = Object.freeze({
  submitted: Object.freeze(['under_review', 'withdrawn']),
  under_review: Object.freeze(['shortlisted', 'rejected', 'withdrawn']),
  shortlisted: Object.freeze(['interview_planned', 'rejected', 'withdrawn']),
  interview_planned: Object.freeze(['interview_completed', 'rejected', 'withdrawn']),
  interview_completed: Object.freeze(['offer_proposed', 'rejected', 'withdrawn']),
  offer_proposed: Object.freeze(['hired', 'rejected', 'withdrawn']),
  hired: Object.freeze([]),
  rejected: Object.freeze([]),
  withdrawn: Object.freeze([]),
});

const ACTOR_RULES = Object.freeze({
  candidate: Object.freeze({
    transitions: Object.freeze(['withdrawn']),
  }),
  recruiter: Object.freeze({
    transitions: Object.freeze([
      'under_review',
      'shortlisted',
      'interview_planned',
      'interview_completed',
      'offer_proposed',
      'rejected',
    ]),
  }),
  recruitment_manager: Object.freeze({
    transitions: Object.freeze([
      'under_review',
      'shortlisted',
      'interview_planned',
      'interview_completed',
      'offer_proposed',
      'hired',
      'rejected',
    ]),
  }),
  admin: Object.freeze({
    transitions: Object.freeze([
      'under_review',
      'shortlisted',
      'interview_planned',
      'interview_completed',
      'offer_proposed',
      'hired',
      'rejected',
    ]),
  }),
});

class AtsWorkflowError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsWorkflowError';
    this.code = code;
    this.details = details;
  }
}

const assertState = (state, field = 'state') => {
  if (!APPLICATION_STATES.includes(state)) {
    throw new AtsWorkflowError(
      'ATS_STATE_INVALID',
      `Unknown ATS application ${field}.`,
      { field, state, allowed: APPLICATION_STATES },
    );
  }
  return state;
};

const assertActorRole = (role) => {
  if (!Object.hasOwn(ACTOR_RULES, role)) {
    throw new AtsWorkflowError(
      'ATS_ACTOR_ROLE_INVALID',
      'Actor role is not authorized for ATS transitions.',
      { role, allowed: Object.keys(ACTOR_RULES) },
    );
  }
  return role;
};

const requiresReason = ({ to }) => to === 'rejected';

const validateTransition = ({ from, to, actorRole, reason }) => {
  assertState(from, 'from');
  assertState(to, 'to');
  assertActorRole(actorRole);

  if (from === to) {
    throw new AtsWorkflowError(
      'ATS_TRANSITION_NOOP',
      'A transition must change the application state.',
      { from, to },
    );
  }

  if (TERMINAL_STATES.has(from)) {
    throw new AtsWorkflowError(
      'ATS_TERMINAL_STATE',
      'Terminal ATS application states cannot be changed.',
      { from, to },
    );
  }

  if (!TRANSITIONS[from].includes(to)) {
    throw new AtsWorkflowError(
      'ATS_TRANSITION_NOT_ALLOWED',
      'This ATS application transition is not allowed.',
      { from, to, allowed: TRANSITIONS[from] },
    );
  }

  if (!ACTOR_RULES[actorRole].transitions.includes(to)) {
    throw new AtsWorkflowError(
      'ATS_TRANSITION_FORBIDDEN',
      'The actor role cannot perform this ATS transition.',
      { actorRole, from, to },
    );
  }

  if (actorRole === 'candidate' && to !== 'withdrawn') {
    throw new AtsWorkflowError(
      'ATS_TRANSITION_FORBIDDEN',
      'Candidates may only withdraw their own application.',
      { actorRole, from, to },
    );
  }

  if (requiresReason({ to }) && !String(reason || '').trim()) {
    throw new AtsWorkflowError(
      'ATS_TRANSITION_REASON_REQUIRED',
      'A rejection reason is required.',
      { from, to },
    );
  }

  return Object.freeze({
    from,
    to,
    actorRole,
    reason: String(reason || '').trim() || null,
  });
};

const createTransitionEvent = ({
  applicationId,
  from,
  to,
  actorAccountId,
  actorRole,
  reason,
  occurredAt = new Date(),
  metadata = {},
}) => {
  if (!String(applicationId || '').trim()) {
    throw new AtsWorkflowError('ATS_APPLICATION_ID_REQUIRED', 'Application id is required.');
  }
  if (!String(actorAccountId || '').trim()) {
    throw new AtsWorkflowError('ATS_ACTOR_ID_REQUIRED', 'Actor account id is required.');
  }

  const transition = validateTransition({ from, to, actorRole, reason });
  const timestamp = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
  if (Number.isNaN(timestamp.getTime())) {
    throw new AtsWorkflowError('ATS_EVENT_TIME_INVALID', 'Transition event time is invalid.');
  }

  const safeMetadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? { ...metadata }
    : {};

  return Object.freeze({
    schemaVersion: 'makoki-ats-workflow-event-v1',
    applicationId: String(applicationId),
    eventType: 'application.transitioned',
    from: transition.from,
    to: transition.to,
    actorAccountId: String(actorAccountId),
    actorRole: transition.actorRole,
    reason: transition.reason,
    occurredAt: timestamp.toISOString(),
    metadata: Object.freeze(safeMetadata),
  });
};

module.exports = {
  APPLICATION_STATES,
  TERMINAL_STATES,
  TRANSITIONS,
  ACTOR_RULES,
  AtsWorkflowError,
  assertState,
  requiresReason,
  validateTransition,
  createTransitionEvent,
};
