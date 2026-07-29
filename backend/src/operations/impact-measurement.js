'use strict';

const { assertActiveConsent, minimizeTelemetry } = require('./data-governance');
const { EVENT_CATALOG } = require('./event-catalog');

const MEASUREMENT_EVENTS = Object.freeze(Object.keys(EVENT_CATALOG).filter(
  (name) => EVENT_CATALOG[name].classification === 'consent_required',
));
const ALLOWED_EVENTS = new Set(MEASUREMENT_EVENTS);

const validateMeasurementEvent = (event, { consent } = {}) => {
  if (!event || !ALLOWED_EVENTS.has(event.name)) throw new Error('MEASUREMENT_EVENT_FORBIDDEN');
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(event.cohort || '')) {
    throw new Error('MEASUREMENT_COHORT_INVALID');
  }
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(event.participantId || '')) {
    throw new Error('MEASUREMENT_PARTICIPANT_INVALID');
  }
  assertActiveConsent({ consent, accountId: event.accountId });
  const minimized = minimizeTelemetry(event, { consent });
  return Object.freeze({
    schemaVersion: 'makoki.measurement-event.v2',
    eventCatalogVersion: minimized.schemaVersion,
    name: minimized.name,
    cohort: event.cohort,
    unit: 'participant',
    participantId: minimized.participantId,
    occurredAt: minimized.occurredAt,
    result: minimized.result,
    source: Object.freeze({ ...minimized.source }),
  });
};

const summarizeCohort = ({ eligibleParticipants = [], records = [] }) => {
  const eligible = new Set();
  for (const participant of eligibleParticipants) {
    assertActiveConsent({ consent: participant.consent, accountId: participant.accountId });
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(participant.participantId || '')) {
      throw new Error('MEASUREMENT_PARTICIPANT_INVALID');
    }
    eligible.add(participant.participantId);
  }
  const observed = new Set();
  const eventCounts = Object.fromEntries(MEASUREMENT_EVENTS.map((name) => [name, 0]));
  const participantsByEvent = Object.fromEntries(
    MEASUREMENT_EVENTS.map((name) => [name, new Set()]),
  );
  for (const record of records) {
    if (!ALLOWED_EVENTS.has(record.name) || record.unit !== 'participant'
      || !eligible.has(record.participantId) || !record.source?.schemaVersion
      || !Number.isSafeInteger(record.source.recordVersion)) {
      throw new Error('MEASUREMENT_RECORD_INVALID');
    }
    eventCounts[record.name] += 1;
    participantsByEvent[record.name].add(record.participantId);
    observed.add(record.participantId);
  }
  const eligibleParticipantCount = eligible.size;
  const observedParticipantCount = observed.size;
  const missingParticipantCount = eligibleParticipantCount - observedParticipantCount;
  return Object.freeze({
    unit: 'participant',
    eligibleParticipantCount,
    observedParticipantCount,
    observedEventCount: records.length,
    missingParticipantCount,
    missingParticipantRate: eligibleParticipantCount === 0
      ? null
      : missingParticipantCount / eligibleParticipantCount,
    eventCounts: Object.freeze(eventCounts),
    participantCountsByEvent: Object.freeze(Object.fromEntries(
      Object.entries(participantsByEvent).map(([name, participants]) => [name, participants.size]),
    )),
    interpretation: 'descriptive_only_no_causal_claim',
  });
};

module.exports = { ALLOWED_EVENTS, summarizeCohort, validateMeasurementEvent };
