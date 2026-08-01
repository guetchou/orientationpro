'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  APPLICATION_STATES,
  TRANSITIONS,
  REJECTION_REASON_CODES,
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
    reasonCode: null,
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
      reasonCode: 'not_qualified',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_REASON_REQUIRED',
  );

  assert.equal(validateTransition({
    from: 'under_review',
    to: 'rejected',
    actorRole: 'recruiter',
    reason: 'Expérience obligatoire non démontrée',
    reasonCode: 'not_qualified',
  }).reason, 'Expérience obligatoire non démontrée');
});

test('rejection also requires a controlled reason code, distinct from the free-text reason', () => {
  assert.deepEqual(REJECTION_REASON_CODES, [
    'not_qualified',
    'position_filled',
    'duplicate_application',
    'failed_assessment',
    'salary_expectation_mismatch',
    'candidate_unresponsive',
    'role_cancelled',
    'other',
  ]);

  assert.throws(
    () => validateTransition({
      from: 'under_review',
      to: 'rejected',
      actorRole: 'recruiter',
      reason: 'Profil non retenu.',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_REASON_CODE_REQUIRED',
  );

  assert.throws(
    () => validateTransition({
      from: 'under_review',
      to: 'rejected',
      actorRole: 'recruiter',
      reason: 'Profil non retenu.',
      reasonCode: 'not-a-real-code',
    }),
    (error) => error instanceof AtsWorkflowError && error.code === 'ATS_TRANSITION_REASON_CODE_INVALID',
  );

  const accepted = validateTransition({
    from: 'under_review',
    to: 'rejected',
    actorRole: 'recruiter',
    reason: 'Profil non retenu.',
    reasonCode: 'not_qualified',
  });
  assert.equal(accepted.reasonCode, 'not_qualified');

  // reasonCode is only meaningful on rejection: a non-rejecting transition
  // never carries it through, even if one is supplied by mistake.
  const advancing = validateTransition({
    from: 'under_review',
    to: 'shortlisted',
    actorRole: 'recruiter',
    reasonCode: 'not_qualified',
  });
  assert.equal(advancing.reasonCode, null);
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
    reasonCode: null,
    occurredAt: '2026-07-30T18:00:00.000Z',
    metadata: { interviewId: 'interview-1' },
  });
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.metadata), true);
});
