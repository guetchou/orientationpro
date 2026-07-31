'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  JOB_STATES,
  JOB_TRANSITIONS,
  AtsJobWorkflowError,
  validateJobTransition,
  assertJobPublishable,
  createJobEvent,
} = require('../src/ats-v1/job-workflow');

test('ATS job workflow exposes a closed state set and a linear, one-way lifecycle', () => {
  assert.deepEqual(JOB_STATES, ['draft', 'published', 'closed']);
  assert.deepEqual(JOB_TRANSITIONS.draft, ['published']);
  assert.deepEqual(JOB_TRANSITIONS.published, ['closed']);
  assert.deepEqual(JOB_TRANSITIONS.closed, []);
});

test('draft to published is allowed, closed cannot be reopened and draft cannot skip to closed', () => {
  assert.deepEqual(validateJobTransition({ from: 'draft', to: 'published' }), { from: 'draft', to: 'published' });

  assert.throws(
    () => validateJobTransition({ from: 'draft', to: 'closed' }),
    (error) => error instanceof AtsJobWorkflowError && error.code === 'ATS_JOB_TRANSITION_NOT_ALLOWED',
  );
  assert.throws(
    () => validateJobTransition({ from: 'closed', to: 'published' }),
    (error) => error instanceof AtsJobWorkflowError && error.code === 'ATS_JOB_TRANSITION_NOT_ALLOWED',
  );
});

test('unknown job states are rejected', () => {
  assert.throws(
    () => validateJobTransition({ from: 'draft', to: 'archived' }),
    (error) => error instanceof AtsJobWorkflowError && error.code === 'ATS_JOB_STATE_INVALID',
  );
});

test('publication is refused when required fields are missing', () => {
  assert.throws(
    () => assertJobPublishable({ title: '', description: 'x' }),
    (error) => error instanceof AtsJobWorkflowError
      && error.code === 'ATS_JOB_FIELDS_MISSING'
      && error.details.missing.includes('title'),
  );
  assert.throws(
    () => assertJobPublishable({ title: 'Développeur', description: '   ' }),
    (error) => error instanceof AtsJobWorkflowError
      && error.code === 'ATS_JOB_FIELDS_MISSING'
      && error.details.missing.includes('description'),
  );
  assert.doesNotThrow(() => assertJobPublishable({ title: 'Développeur', description: 'Construire des services.' }));
});

test('job event is append-only shaped and uses the supplied server time', () => {
  const event = createJobEvent({
    jobId: 'job-1',
    eventType: 'job.published',
    actorAccountId: 'owner-1',
    actorRole: 'recruiter',
    occurredAt: new Date('2026-07-31T09:00:00.000Z'),
    metadata: { published: true },
  });

  assert.deepEqual(event, {
    schemaVersion: 'makoki-ats-job-event-v1',
    jobId: 'job-1',
    eventType: 'job.published',
    actorAccountId: 'owner-1',
    actorRole: 'recruiter',
    occurredAt: '2026-07-31T09:00:00.000Z',
    metadata: { published: true },
  });
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.metadata), true);
});
