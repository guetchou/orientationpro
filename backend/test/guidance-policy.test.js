'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  appendConsentDecision,
  appendIntervention,
  authorizeGuidance,
  authorizeIntervention,
  createConsentLedger,
} = require('../src/guidance');

const owner = 'beneficiary-1';
const allPermissions = [
  'guidance.read_assigned',
  'guidance.comment',
  'guidance.propose_reformulation',
  'guidance.follow_up',
  'guidance.confirm',
  'guidance.reject',
];
const advisor = { accountId: 'advisor-1', role: 'advisor', permissions: allPermissions };
const assignment = {
  active: true,
  actorAccountId: 'advisor-1',
  beneficiaryAccountId: owner,
  role: 'advisor',
  dataScopes: ['life-project-guidance'],
};
const consent = () => appendConsentDecision(
  createConsentLedger({ beneficiaryAccountId: owner, scope: 'life-project-guidance' }),
  {
    eventId: 'grant-1',
    decision: 'granted',
    actorAccountId: owner,
    decidedAt: '2026-07-29T08:00:00Z',
    reason: 'Fixture consent',
  },
);

test('only beneficiary decides consent', () => assert.throws(
  () => appendConsentDecision(consent(), {
    eventId: 'revoke-1',
    decision: 'revoked',
    actorAccountId: 'advisor-1',
    decidedAt: '2026-07-29T09:00:00Z',
    reason: 'No',
  }),
  (error) => error.code === 'GUIDANCE_CONSENT_OWNER_REQUIRED',
));

test('assignment permission and active consent are all required', () => {
  assert.equal(authorizeGuidance({
    actor: advisor,
    beneficiaryAccountId: owner,
    assignment,
    consent: consent(),
    permission: 'guidance.read_assigned',
    dataScope: 'life-project-guidance',
  }).allowed, true);
  assert.equal(authorizeGuidance({
    actor: advisor,
    beneficiaryAccountId: owner,
    assignment: { ...assignment, active: false },
    consent: consent(),
    permission: 'guidance.read_assigned',
    dataScope: 'life-project-guidance',
  }).allowed, false);
});

test('revocation immediately closes access and a stale grant cannot reopen it', () => {
  const revoked = appendConsentDecision(consent(), {
    eventId: 'revoke-1',
    decision: 'revoked',
    actorAccountId: owner,
    decidedAt: '2026-07-29T12:00:00Z',
    reason: 'Withdrawn',
  });
  assert.equal(authorizeGuidance({
    actor: advisor,
    beneficiaryAccountId: owner,
    assignment,
    consent: revoked,
    permission: 'guidance.read_assigned',
    dataScope: 'life-project-guidance',
  }).allowed, false);
  assert.throws(
    () => appendConsentDecision(revoked, {
      eventId: 'stale-grant',
      decision: 'granted',
      actorAccountId: owner,
      decidedAt: '2026-07-29T11:00:00Z',
      reason: 'Delayed replay',
    }),
    (error) => error.code === 'GUIDANCE_CONSENT_STALE',
  );
});

test('an exact consent replay is idempotent and a conflicting reuse is rejected', () => {
  const granted = consent();
  const replayed = appendConsentDecision(granted, {
    eventId: 'grant-1',
    decision: 'granted',
    actorAccountId: owner,
    decidedAt: '2026-07-29T08:00:00Z',
    reason: 'Fixture consent',
  });
  assert.equal(replayed, granted);
  assert.throws(
    () => appendConsentDecision(granted, {
      eventId: 'grant-1',
      decision: 'revoked',
      actorAccountId: owner,
      decidedAt: '2026-07-29T08:00:00Z',
      reason: 'Conflicting replay',
    }),
    (error) => error.code === 'GUIDANCE_EVENT_CONFLICT',
  );
});

test('consent history preserves actor, date, scope, decision and reason', () => {
  assert.deepEqual(consent().events[0], {
    eventId: 'grant-1',
    revision: 1,
    decision: 'granted',
    actorAccountId: owner,
    decidedAt: '2026-07-29T08:00:00.000Z',
    scope: 'life-project-guidance',
    reason: 'Fixture consent',
  });
});

test('all required intervention types use assignment permission scope and active consent', () => {
  const cases = [
    ['comment', 'guidance.comment'],
    ['reformulation_proposed', 'guidance.propose_reformulation'],
    ['confirmation', 'guidance.confirm'],
    ['rejection', 'guidance.reject'],
    ['follow_up', 'guidance.follow_up'],
  ];
  for (const [type, permission] of cases) {
    assert.equal(authorizeIntervention({
      type,
      actor: advisor,
      beneficiaryAccountId: owner,
      assignment,
      consent: consent(),
      dataScope: 'life-project-guidance',
    }).allowed, true, `${type} should be authorized`);
    assert.equal(authorizeIntervention({
      type,
      actor: { ...advisor, permissions: advisor.permissions.filter((entry) => entry !== permission) },
      beneficiaryAccountId: owner,
      assignment,
      consent: consent(),
      dataScope: 'life-project-guidance',
    }).allowed, false, `${type} should require ${permission}`);
  }
});

test('human confirmation and rejection preserve auditable decisions', () => {
  let journal = { events: [] };
  for (const type of ['confirmation', 'rejection']) {
    journal = appendIntervention(journal, {
      eventId: `event-${type}`,
      type,
      actorAccountId: 'advisor-1',
      actorRole: 'advisor',
      beneficiaryAccountId: owner,
      subjectRef: 'life-project:fixture',
      recordedAt: type === 'confirmation'
        ? '2026-07-29T10:00:00Z'
        : '2026-07-29T10:01:00Z',
      scope: 'life-project-guidance',
      reason: `${type} reason recorded by the human actor`,
      text: `${type} recorded as a separate intervention`,
    });
  }
  assert.deepEqual(journal.events.map((event) => event.replacesUserStatement), [false, false]);
  assert.deepEqual(
    journal.events.map((event) => ({
      actorAccountId: event.actorAccountId,
      recordedAt: event.recordedAt,
      scope: event.scope,
      decision: event.decision,
      reason: event.reason,
    })),
    [
      {
        actorAccountId: 'advisor-1',
        recordedAt: '2026-07-29T10:00:00.000Z',
        scope: 'life-project-guidance',
        decision: 'confirmed',
        reason: 'confirmation reason recorded by the human actor',
      },
      {
        actorAccountId: 'advisor-1',
        recordedAt: '2026-07-29T10:01:00.000Z',
        scope: 'life-project-guidance',
        decision: 'rejected',
        reason: 'rejection reason recorded by the human actor',
      },
    ],
  );
  assert.equal(Object.isFrozen(journal.events[0]), true);
});

test('another beneficiary cannot reuse assignment and consent', () => assert.equal(
  authorizeGuidance({
    actor: advisor,
    beneficiaryAccountId: 'beneficiary-2',
    assignment,
    consent: consent(),
    permission: 'guidance.read_assigned',
    dataScope: 'life-project-guidance',
  }).allowed,
  false,
));
