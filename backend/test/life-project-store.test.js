'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createStateHistoryEntry } = require('../src/life-project/contracts');
const {
  LifeProjectPersistenceError,
  assertHistoryAppendOnly,
  assertHistoryChronology,
} = require('../src/life-project/store');

const provenance = (recordedAt) => ({
  sourceType: 'user_statement',
  sourceId: 'test-source',
  actorId: 'account-test',
  recordedAt,
  notes: null,
});

const event = ({ id, from, to, occurredAt, reason = null }) => createStateHistoryEntry({
  eventType: 'state_transition',
  eventId: id,
  from,
  to,
  occurredAt,
  actor: { kind: 'user', id: 'account-test' },
  reason,
  provenance: provenance(occurredAt),
});

test('history accepts an unchanged prefix followed by new events', () => {
  const first = event({
    id: 'event-1',
    from: 'exploration',
    to: 'clarification',
    occurredAt: '2026-07-29T08:00:00.000Z',
  });
  const second = event({
    id: 'event-2',
    from: 'clarification',
    to: 'comparison',
    occurredAt: '2026-07-29T08:05:00.000Z',
  });

  assert.doesNotThrow(() => assertHistoryAppendOnly([first], [first, second]));
  assert.doesNotThrow(() => assertHistoryChronology([first, second]));
});

test('history refuses truncation, replacement and reverse chronology', () => {
  const first = event({
    id: 'event-1',
    from: 'exploration',
    to: 'clarification',
    occurredAt: '2026-07-29T08:00:00.000Z',
  });
  const replacement = event({
    id: 'event-1',
    from: 'exploration',
    to: 'clarification',
    occurredAt: '2026-07-29T08:00:00.000Z',
    reason: 'réécriture interdite',
  });
  const earlier = event({
    id: 'event-2',
    from: 'clarification',
    to: 'comparison',
    occurredAt: '2026-07-29T07:59:00.000Z',
  });

  assert.throws(
    () => assertHistoryAppendOnly([first], []),
    (error) => error instanceof LifeProjectPersistenceError
      && error.code === 'LIFE_PROJECT_HISTORY_REWRITE',
  );
  assert.throws(
    () => assertHistoryAppendOnly([first], [replacement]),
    (error) => error instanceof LifeProjectPersistenceError
      && error.code === 'LIFE_PROJECT_HISTORY_REWRITE',
  );
  assert.throws(
    () => assertHistoryChronology([first, earlier]),
    (error) => error instanceof LifeProjectPersistenceError
      && error.code === 'LIFE_PROJECT_HISTORY_ORDER_INVALID',
  );
});