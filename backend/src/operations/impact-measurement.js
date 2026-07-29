'use strict';

const ALLOWED_EVENTS = new Set([
  'journey.started',
  'journey.completed',
  'journey.resumed',
  'action.created',
  'action.completed',
  'journey.blocked',
  'journey.reoriented',
  'human.support.requested',
  'human.correction.recorded',
]);

const validateMeasurementEvent = (event) => {
  if (!event || !ALLOWED_EVENTS.has(event.name)) {
    throw new Error('MEASUREMENT_EVENT_FORBIDDEN');
  }
  if (event.consent !== true) throw new Error('MEASUREMENT_CONSENT_REQUIRED');
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(event.cohort || '')) {
    throw new Error('MEASUREMENT_COHORT_INVALID');
  }
  const occurredAt = new Date(event.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) throw new Error('MEASUREMENT_TIME_INVALID');
  return Object.freeze({
    schemaVersion: 'makoki.measurement-event.v1',
    name: event.name,
    cohort: event.cohort,
    occurredAt: occurredAt.toISOString(),
  });
};

const summarizeCohort = ({ eligibleCount, records }) => {
  if (!Number.isSafeInteger(eligibleCount) || eligibleCount < 0) {
    throw new Error('ELIGIBLE_COUNT_INVALID');
  }
  const counts = Object.fromEntries([...ALLOWED_EVENTS].map((name) => [name, 0]));
  for (const record of records || []) {
    if (!ALLOWED_EVENTS.has(record.name)) throw new Error('MEASUREMENT_EVENT_FORBIDDEN');
    counts[record.name] += 1;
  }
  const observedCount = records?.length || 0;
  const missingCount = Math.max(eligibleCount - observedCount, 0);
  return Object.freeze({
    eligibleCount,
    observedEventCount: observedCount,
    missingCount,
    missingRate: eligibleCount === 0 ? null : missingCount / eligibleCount,
    counts,
    interpretation: 'descriptive_only_no_causal_claim',
  });
};

module.exports = { ALLOWED_EVENTS, summarizeCohort, validateMeasurementEvent };
