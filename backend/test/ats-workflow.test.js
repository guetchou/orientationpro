'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  APPLICATION_STATES,
  TRANSITIONS,
  AtsWorkflowError,
  validateTransition,
  createTransitionEvent,
} = require('../src/ats-v1/workflow');

test('ATS workflow exposes a closed state set and terminal states have no outgoing transitions', () => {
  assert.deepEqual(APPLICATION_STATES, [
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
  assert.deepEqual(TRANSITIONS.hired, []);
  assert.deepEqual(TRANSITIONS.rejected, []);
  assert.deepEqual(TRANSITIONS.withdrawn, []);
});

test('recruiter may advance a submitted application to review', () => {
  assert.deepEqual(validateTransition({
    from: 'submitted',
    to: 'under_review',
    actorRole: 'recruiter',
  }), {
    from: 'submitted',
    to: 'under_review',
    actorRole: 'recruiter',
    reason: null,
  });
});

test('candidate may withdraw but cannot shortlist an application', () => {
  assert.equal(validateTransition({
    from: 'submitted',
    to: 'withdrawn',
    actorRole: 'candidate',
  }).to, 'withdrawn');

  assert.throws(
    () => validateTransition({
      from: 'under_review',
      to: 'shortlisted',
      actorRole: 'candidate',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_FORBIDDEN',
  );
});

test('unknown states and arbitrary status values are rejected', () => {
  assert.throws(
    () => validateTransition({
      from: 'submitted',
      to: 'maybe_hired',
      actorRole: 'admin',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_STATE_INVALID',
  );
});

test('invalid graph transition is rejected even for admin', () => {
  assert.throws(
    () => validateTransition({
      from: 'submitted',
      to: 'hired',
      actorRole: 'admin',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_NOT_ALLOWED',
  );
});

test('rejection requires a non-empty reason', () => {
  assert.throws(
    () => validateTransition({
      from: 'under_review',
      to: 'rejected',
      actorRole: 'recruiter',
      reason: '   ',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_REASON_REQUIRED',
  );

  assert.equal(validateTransition({
    from: 'under_review',
    to: 'rejected',
    actorRole: 'recruiter',
    reason: 'Expérience obligatoire non démontrée',
  }).reason, 'Expérience obligatoire non démontrée');
});

test('terminal states cannot be reopened silently', () => {
  assert.throws(
    () => validateTransition({
      from: 'rejected',
      to: 'under_review',
      actorRole: 'admin',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TERMINAL_STATE',
  );
});

test('transition event is append-only shaped and uses server time supplied by caller', () => {
  const event = createTransitionEvent({
    applicationId: 'application-1',
    from: 'shortlisted',
    to: 'interview_planned',
    actorAccountId: 'recruiter-1',
    actorRole: 'recruiter',
    occurredAt: new Date('2026-07-30T18:00:00.000Z'),
    metadata: { interviewId: 'interview-1' },
  });

  assert.deepEqual(event, {
    schemaVersion: 'makoki-ats-workflow-event-v1',
    applicationId: 'application-1',
    eventType: 'application.transitioned',
    from: 'shortlisted',
    to: 'interview_planned',
    actorAccountId: 'recruiter-1',
    actorRole: 'recruiter',
    reason: null,
    occurredAt: '2026-07-30T18:00:00.000Z',
    metadata: { interviewId: 'interview-1' },
  });
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.metadata), true);
});
