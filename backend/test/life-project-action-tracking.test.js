'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ActionTrackingError,
  createActionTrackingRecord,
  summarizeActionProgress,
  transitionActionTracking,
} = require('../src/life-project/action-tracking');
const { createLifeProject } = require('../src/life-project/contracts');

const at = (minute) => `2026-07-29T08:${String(minute).padStart(2, '0')}:00.000Z`;

const record = () => createActionTrackingRecord({
  projectId: 'project-1',
  planId: 'plan-1',
  actionId: 'action-1',
  position: 2,
  statusHistory: [{
    eventId: 'event-1',
    from: null,
    to: 'planned',
    occurredAt: at(0),
    actor: { kind: 'user', id: 'account-1' },
    reason: 'Création',
  }],
  createdAt: at(0),
});

const project = () => createLifeProject({
  id: 'project-1',
  ownerAccountId: 'account-1',
  title: 'Projet',
  state: 'action',
  activeScenarioId: 'scenario-1',
  scenarios: [{
    id: 'scenario-1',
    title: 'Scénario',
    status: 'active',
    optionType: 'mixed',
    uncertainty: { level: 'low', reasons: [] },
    provenance: { sourceType: 'user_statement', actorId: 'account-1', recordedAt: at(0) },
    createdAt: at(0),
  }],
  actionPlans: [{
    id: 'plan-1',
    scenarioId: 'scenario-1',
    title: 'Plan',
    status: 'active',
    items: [{
      id: 'action-1',
      title: 'Première action',
      status: 'blocked',
      evidenceIds: ['evidence-1'],
      blockingReasons: ['Contact indisponible'],
      provenance: { sourceType: 'user_statement', actorId: 'account-1', recordedAt: at(0) },
      createdAt: at(0),
    }],
    provenance: { sourceType: 'user_statement', actorId: 'account-1', recordedAt: at(0) },
    createdAt: at(0),
  }],
  provenance: { sourceType: 'user_statement', actorId: 'account-1', recordedAt: at(0) },
  uncertainty: { level: 'low', reasons: [] },
  createdAt: at(0),
});

test('tracking record is versioned, immutable and serializable', () => {
  const value = record();
  assert.equal(value.schemaVersion, 'makoki-life-project-action-tracking-v1');
  assert.equal(value.position, 2);
  assert.equal(Object.isFrozen(value), true);
  assert.equal(JSON.parse(JSON.stringify(value)).actionId, 'action-1');
});

test('action transitions are explicit, reversible where allowed and idempotent', () => {
  const started = transitionActionTracking(record(), {
    eventId: 'event-2',
    to: 'in_progress',
    occurredAt: at(5),
    actor: { kind: 'user', id: 'account-1' },
    reason: 'Action démarrée',
  });
  assert.equal(started.statusHistory.at(-1).from, 'planned');
  assert.equal(started.statusHistory.at(-1).to, 'in_progress');
  assert.deepEqual(
    transitionActionTracking(started, {
      eventId: 'event-2',
      to: 'in_progress',
      occurredAt: at(5),
      actor: { kind: 'user', id: 'account-1' },
    }),
    started,
  );
  assert.throws(
    () => transitionActionTracking(started, {
      eventId: 'event-3',
      to: 'cancelled',
      occurredAt: at(4),
      actor: { kind: 'user', id: 'account-1' },
    }),
    (error) => error instanceof ActionTrackingError
      && error.code === 'ACTION_TRACKING_HISTORY_ORDER_INVALID',
  );
});

test('forbidden transitions and conflicting command ids fail closed', () => {
  const completed = transitionActionTracking(record(), {
    eventId: 'event-completed',
    to: 'completed',
    occurredAt: at(5),
    actor: { kind: 'user', id: 'account-1' },
  });
  assert.throws(
    () => transitionActionTracking(completed, {
      eventId: 'event-cancel',
      to: 'cancelled',
      occurredAt: at(6),
      actor: { kind: 'user', id: 'account-1' },
    }),
    (error) => error.code === 'ACTION_TRACKING_TRANSITION_FORBIDDEN',
  );
  assert.throws(
    () => transitionActionTracking(completed, {
      eventId: 'event-completed',
      to: 'planned',
      occurredAt: at(6),
      actor: { kind: 'user', id: 'account-1' },
    }),
    (error) => error.code === 'ACTION_TRACKING_COMMAND_CONFLICT',
  );
});

test('progress is descriptive, ordered and never expressed as a percentage', () => {
  const summary = summarizeActionProgress({ project: project(), trackingRecords: [record()] });
  assert.equal(summary.state, 'blocked');
  assert.equal(summary.counts.blocked, 1);
  assert.equal(summary.nextActions[0].position, 2);
  assert.equal(summary.nextActions[0].evidenceIds[0], 'evidence-1');
  assert.equal(JSON.stringify(summary).includes('%'), false);
});
