'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  ALLOWED_EVENTS,
  summarizeCohort,
  validateMeasurementEvent,
} = require('../src/operations/impact-measurement');
const { createConsentLedger } = require('../src/operations/data-governance');
const {
  EVENT_CATALOG_VERSION,
  TELEMETRY_NOTICE_VERSION,
} = require('../src/operations/event-catalog');

const activeConsent = (accountId, eventId) => createConsentLedger({
  accountId,
  noticeVersion: TELEMETRY_NOTICE_VERSION,
  eventCatalogVersion: EVENT_CATALOG_VERSION,
  decidedAt: '2026-07-29T00:00:00.000Z',
  eventId,
});
const event = (overrides = {}) => ({
  name: 'journey.completed',
  cohort: 'pilot_1',
  accountId: 'account-1',
  participantId: 'pseudo_participant_0001',
  occurredAt: '2026-07-29T01:00:00.000Z',
  result: 'completed',
  source: { schemaVersion: 'life-project-v1', recordVersion: 12 },
  ...overrides,
});

test('shared event catalog excludes clicks and requires persisted active consent', () => {
  assert.equal(ALLOWED_EVENTS.has('button.clicked'), false);
  assert.throws(() => validateMeasurementEvent(event()), /TELEMETRY_CONSENT_REQUIRED/);
  const output = validateMeasurementEvent(event(), {
    consent: activeConsent('account-1', 'consent-1'),
  });
  assert.equal(output.eventCatalogVersion, EVENT_CATALOG_VERSION);
  assert.equal(output.unit, 'participant');
  assert.deepEqual(output.source, {
    system: 'makoki-api',
    schemaVersion: 'life-project-v1',
    recordVersion: 12,
  });
});

test('measurement omits direct identifiers and raw sensitive fields', () => {
  const output = validateMeasurementEvent(event({
    token: 'never',
    answers: ['never'],
    document: Buffer.from('never'),
  }), { consent: activeConsent('account-1', 'consent-2') });
  assert.doesNotMatch(JSON.stringify(output), /account-1|never|token|answers|document/);
});

test('cohort summary deduplicates people and separates people from events', () => {
  const consent1 = activeConsent('account-1', 'consent-3');
  const consent2 = activeConsent('account-2', 'consent-4');
  const first = validateMeasurementEvent(event(), { consent: consent1 });
  const repeated = validateMeasurementEvent(event({
    occurredAt: '2026-07-29T02:00:00.000Z',
  }), { consent: consent1 });
  const result = summarizeCohort({
    eligibleParticipants: [
      { accountId: 'account-1', participantId: 'pseudo_participant_0001', consent: consent1 },
      { accountId: 'account-1', participantId: 'pseudo_participant_0001', consent: consent1 },
      { accountId: 'account-2', participantId: 'pseudo_participant_0002', consent: consent2 },
    ],
    records: [first, repeated],
  });
  assert.equal(result.eligibleParticipantCount, 2);
  assert.equal(result.observedParticipantCount, 1);
  assert.equal(result.observedEventCount, 2);
  assert.equal(result.participantCountsByEvent['journey.completed'], 1);
  assert.equal(result.eventCounts['journey.completed'], 2);
  assert.equal(result.missingParticipantCount, 1);
  assert.equal(result.interpretation, 'descriptive_only_no_causal_claim');
});

test('records without provenance or outside the consented cohort fail closed', () => {
  const consent1 = activeConsent('account-1', 'consent-5');
  const valid = validateMeasurementEvent(event(), { consent: consent1 });
  const eligibleParticipants = [{
    accountId: 'account-1',
    participantId: 'pseudo_participant_0001',
    consent: consent1,
  }];
  assert.throws(
    () => summarizeCohort({ eligibleParticipants, records: [{ ...valid, source: null }] }),
    /MEASUREMENT_RECORD_INVALID/,
  );
  assert.throws(
    () => summarizeCohort({
      eligibleParticipants,
      records: [{ ...valid, participantId: 'pseudo_participant_9999' }],
    }),
    /MEASUREMENT_RECORD_INVALID/,
  );
});

test('empty cohorts do not fabricate a zero missing-data rate', () => {
  assert.equal(summarizeCohort({}).missingParticipantRate, null);
});
