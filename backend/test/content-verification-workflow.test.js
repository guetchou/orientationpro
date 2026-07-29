'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  applyVerificationDecision,
  createContentRecord,
  recordCorrection,
  recordDisagreement,
  reportContentIssue,
} = require('../src/content-registry');

const at = (day) => `2026-07-${String(day).padStart(2, '0')}T08:00:00.000Z`;
const actor = { kind: 'human', id: 'reviewer-fixture', role: 'content_reviewer' };

const draft = () => createContentRecord({
  id: 'content-workflow-fixture',
  kind: 'training',
  labels: [{ language: 'fr', value: 'Formation synthétique de test' }],
  source: {
    id: 'source-workflow-fixture',
    level: 'international',
    title: 'Synthetic workflow source',
    responsibleParty: 'Fixture owner',
    license: 'test-only',
    version: 'fixture-v1',
    retrievedAt: at(1),
  },
  geographicScope: {
    level: 'unknown',
    codes: [],
    description: 'Périmètre volontairement inconnu dans la fixture.',
  },
  languages: ['fr'],
  freshness: {
    status: 'unknown',
    checkedAt: at(1),
    notes: 'Fixture sans assertion de fraîcheur.',
  },
  verification: {
    status: 'draft',
    statusChangedAt: at(1),
    decisions: [],
  },
  trust: {
    status: 'unknown',
    reasons: ['Fixture sans évaluation de confiance.'],
  },
  assertions: { evidence: [], hypotheses: [], facts: [] },
  createdAt: at(1),
});

const decide = (record, eventId, to, day, evidenceIds = []) =>
  applyVerificationDecision(record, {
    eventId,
    to,
    decidedBy: actor,
    decidedAt: at(day),
    reason: `Transition synthétique vers ${to}.`,
    evidenceIds,
  });

test('verification follows draft -> reviewed -> verified with append-only human decisions', () => {
  const reviewed = decide(draft(), 'decision-reviewed', 'reviewed', 2);
  const verified = decide(
    reviewed,
    'decision-verified',
    'verified',
    3,
    ['evidence-fixture'],
  );
  assert.equal(verified.verification.status, 'verified');
  assert.equal(verified.verification.statusChangedAt, at(3));
  assert.deepEqual(
    verified.verification.decisions.map((entry) => entry.to),
    ['reviewed', 'verified'],
  );
  assert.equal(Object.isFrozen(verified.verification), true);
});

test('a system actor cannot review or verify content', () => {
  assert.throws(
    () => applyVerificationDecision(draft(), {
      eventId: 'decision-system',
      to: 'reviewed',
      decidedBy: { kind: 'system', id: 'automation', role: 'system' },
      decidedAt: at(2),
      reason: 'Automatic review attempt.',
    }),
    (error) => error.code === 'CONTENT_VERIFICATION_HUMAN_REQUIRED',
  );
});

test('verified promotion requires evidence and cannot skip review', () => {
  assert.throws(
    () => decide(draft(), 'decision-skip', 'verified', 2, ['evidence-fixture']),
    (error) => error.code === 'CONTENT_VERIFICATION_TRANSITION_FORBIDDEN',
  );
  const reviewed = decide(draft(), 'decision-reviewed', 'reviewed', 2);
  assert.throws(
    () => decide(reviewed, 'decision-no-evidence', 'verified', 3),
    (error) => error.code === 'CONTENT_VERIFICATION_EVIDENCE_REQUIRED',
  );
});

test('corrections preserve revisions and make verified content stale', () => {
  const verified = decide(
    decide(draft(), 'decision-reviewed', 'reviewed', 2),
    'decision-verified',
    'verified',
    3,
    ['evidence-fixture'],
  );
  const corrected = recordCorrection(verified, {
    eventId: 'correction-fixture',
    recordedBy: actor,
    recordedAt: at(4),
    fields: ['labels'],
    reason: 'A label requires a documented correction.',
    previousRevisionId: 'revision-1',
    replacementRevisionId: 'revision-2',
  });
  assert.equal(corrected.verification.status, 'stale');
  assert.equal(corrected.verification.statusChangedAt, at(4));
  assert.equal(corrected.verification.corrections[0].previousRevisionId, 'revision-1');
});

test('disagreements are recorded without overwriting the current statement', () => {
  const disputed = recordDisagreement(draft(), {
    eventId: 'disagreement-fixture',
    recordedBy: actor,
    recordedAt: at(2),
    statement: 'The source does not establish lived accessibility.',
    evidenceIds: [],
  });
  assert.equal(disputed.verification.status, 'draft');
  assert.equal(disputed.verification.disagreements[0].resolutionStatus, 'open');
});

test('an obsolete or erroneous report is visible and invalidates verified freshness', () => {
  const verified = decide(
    decide(draft(), 'decision-reviewed', 'reviewed', 2),
    'decision-verified',
    'verified',
    3,
    ['evidence-fixture'],
  );
  const reported = reportContentIssue(verified, {
    eventId: 'report-fixture',
    issueType: 'possibly_obsolete',
    reportedBy: actor,
    reportedAt: at(4),
    description: 'The verification date may no longer represent the current situation.',
  });
  assert.equal(reported.verification.status, 'stale');
  assert.equal(reported.verification.reports[0].status, 'open');
});

test('event identifiers cannot be reused across decision and report histories', () => {
  const reviewed = decide(draft(), 'event-shared', 'reviewed', 2);
  assert.throws(
    () => reportContentIssue(reviewed, {
      eventId: 'event-shared',
      issueType: 'incorrect',
      reportedBy: actor,
      reportedAt: at(3),
      description: 'Duplicate event id attempt.',
    }),
    (error) => error.code === 'CONTENT_VERIFICATION_EVENT_DUPLICATE',
  );
});
