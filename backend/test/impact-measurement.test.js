'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  ALLOWED_EVENTS,
  summarizeCohort,
  validateMeasurementEvent,
} = require('../src/operations/impact-measurement');

test('event vocabulary measures journeys and actions, never clicks', () => {
  assert.equal(ALLOWED_EVENTS.has('button.clicked'), false);
  assert.equal(ALLOWED_EVENTS.has('journey.completed'), true);
  assert.throws(
    () => validateMeasurementEvent({
      name: 'button.clicked',
      consent: true,
      cohort: 'pilot_1',
      occurredAt: new Date(),
    }),
    /MEASUREMENT_EVENT_FORBIDDEN/,
  );
});

test('measurement requires consent and bounded cohort identifiers', () => {
  assert.throws(
    () => validateMeasurementEvent({
      name: 'journey.started',
      consent: false,
      cohort: 'pilot_1',
      occurredAt: new Date(),
    }),
    /MEASUREMENT_CONSENT_REQUIRED/,
  );
  assert.deepEqual(validateMeasurementEvent({
    name: 'journey.started',
    consent: true,
    cohort: 'pilot_1',
    occurredAt: '2026-07-29T00:00:00.000Z',
    accountId: 'excluded',
    answers: ['excluded'],
  }), {
    schemaVersion: 'makoki.measurement-event.v1',
    name: 'journey.started',
    cohort: 'pilot_1',
    occurredAt: '2026-07-29T00:00:00.000Z',
  });
});

test('cohort summary reports missingness and descriptive-only interpretation', () => {
  const result = summarizeCohort({
    eligibleCount: 5,
    records: [
      { name: 'journey.started' },
      { name: 'journey.completed' },
      { name: 'action.created' },
    ],
  });
  assert.equal(result.missingCount, 2);
  assert.equal(result.missingRate, 0.4);
  assert.equal(result.counts['journey.completed'], 1);
  assert.equal(result.interpretation, 'descriptive_only_no_causal_claim');
});

test('empty cohorts do not fabricate a zero missing-data rate', () => {
  assert.equal(summarizeCohort({ eligibleCount: 0, records: [] }).missingRate, null);
});
