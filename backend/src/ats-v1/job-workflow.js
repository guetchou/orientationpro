'use strict';

const JOB_STATES = Object.freeze(['draft', 'published', 'closed']);

const JOB_TRANSITIONS = Object.freeze({
  draft: Object.freeze(['published']),
  published: Object.freeze(['closed']),
  closed: Object.freeze([]),
});

const REQUIRED_JOB_FIELDS = Object.freeze(['title', 'description']);

class AtsJobWorkflowError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsJobWorkflowError';
    this.code = code;
    this.details = details;
  }
}

const assertJobState = (state, field = 'state') => {
  if (!JOB_STATES.includes(state)) {
    throw new AtsJobWorkflowError(
      'ATS_JOB_STATE_INVALID',
      `Unknown ATS job ${field}.`,
      { field, state, allowed: JOB_STATES },
    );
  }
  return state;
};

const validateJobTransition = ({ from, to }) => {
  assertJobState(from, 'from');
  assertJobState(to, 'to');
  if (!JOB_TRANSITIONS[from].includes(to)) {
    throw new AtsJobWorkflowError(
      'ATS_JOB_TRANSITION_NOT_ALLOWED',
      'This ATS job transition is not allowed.',
      { from, to, allowed: JOB_TRANSITIONS[from] },
    );
  }
  return Object.freeze({ from, to });
};

const assertJobPublishable = (job) => {
  const missing = REQUIRED_JOB_FIELDS.filter((field) => !String(job[field] || '').trim());
  if (missing.length > 0) {
    throw new AtsJobWorkflowError(
      'ATS_JOB_FIELDS_MISSING',
      'Required job fields are missing for publication.',
      { missing },
    );
  }
};

const createJobEvent = ({
  jobId,
  eventType,
  actorAccountId,
  actorRole,
  occurredAt = new Date(),
  metadata = {},
}) => {
  if (!String(jobId || '').trim()) {
    throw new AtsJobWorkflowError('ATS_JOB_ID_REQUIRED', 'Job id is required.');
  }
  if (!String(actorAccountId || '').trim()) {
    throw new AtsJobWorkflowError('ATS_ACTOR_ID_REQUIRED', 'Actor account id is required.');
  }
  const timestamp = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
  if (Number.isNaN(timestamp.getTime())) {
    throw new AtsJobWorkflowError('ATS_EVENT_TIME_INVALID', 'Job event time is invalid.');
  }
  const safeMetadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata)
    ? { ...metadata }
    : {};

  return Object.freeze({
    schemaVersion: 'makoki-ats-job-event-v1',
    jobId: String(jobId),
    eventType,
    actorAccountId: String(actorAccountId),
    actorRole,
    occurredAt: timestamp.toISOString(),
    metadata: Object.freeze(safeMetadata),
  });
};

module.exports = {
  JOB_STATES,
  JOB_TRANSITIONS,
  AtsJobWorkflowError,
  assertJobState,
  validateJobTransition,
  assertJobPublishable,
  createJobEvent,
};
