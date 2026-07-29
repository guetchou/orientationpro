'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PROVENANCE_CONTRACT_VERSION,
  ProvenanceContractError,
  applyHypothesisDecision,
  createEvidence,
  createFact,
  createHypothesis,
  promoteHypothesisToFact,
} = require('../src/provenance');

const at = (day) => `2026-07-${String(day).padStart(2, '0')}T08:00:00.000Z`;
const subject = { type: 'person_profile', id: 'profile-1' };
const human = { kind: 'human', id: 'account-1', role: 'owner' };

const proposed = () => createHypothesis({
  id: 'hypothesis-1',
  subject,
  hypothesisType: 'career_interest',
  value: { code: 'S', label: 'Social' },
  generator: {
    kind: 'system',
    id: 'profile-hypothesis-engine',
    version: 'v1',
  },
  rationale: ['Several confirmed profile signals point to this possibility.'],
  evidenceIds: ['evidence-1'],
  uncertainty: { level: 'medium', reasons: ['Requires user confirmation'] },
  access: { classification: 'account_private' },
  createdAt: at(1),
});

test('evidence is versioned, serializable and deeply immutable', () => {
  const evidence = createEvidence({
    id: 'evidence-1',
    evidenceType: 'user_statement',
    subject,
    source: { type: 'user_statement', id: 'answer-1' },
    observedAt: at(1),
    scope: ['career_interest'],
    access: { classification: 'account_private' },
    createdAt: at(1),
  });
  assert.equal(evidence.schemaVersion, PROVENANCE_CONTRACT_VERSION);
  assert.equal(JSON.parse(JSON.stringify(evidence)).id, evidence.id);
  assert.equal(Object.isFrozen(evidence), true);
  assert.equal(Object.isFrozen(evidence.source), true);
  assert.throws(() => { evidence.verificationStatus = 'verified'; }, TypeError);
});

test('verified external evidence requires authority, retrieval date and version', () => {
  assert.throws(
    () => createEvidence({
      id: 'evidence-external',
      evidenceType: 'registry_record',
      source: { type: 'external_authority', id: 'registry-1' },
      observedAt: at(1),
      scope: ['qualification'],
      verificationStatus: 'verified',
      createdAt: at(1),
    }),
    (error) => error.code === 'PROVENANCE_AUTHORITY_INCOMPLETE',
  );

  const verified = createEvidence({
    id: 'evidence-external',
    evidenceType: 'registry_record',
    source: {
      type: 'external_authority',
      id: 'registry-1',
      authorityName: 'Competent authority',
      retrievedAt: at(1),
      version: '2026-07',
    },
    observedAt: at(1),
    scope: ['qualification'],
    verificationStatus: 'verified',
    createdAt: at(1),
  });
  assert.equal(verified.verificationStatus, 'verified');
});

test('a hypothesis cannot be created directly as confirmed', () => {
  assert.throws(
    () => createHypothesis({ ...proposed(), status: 'confirmed' }),
    (error) => error instanceof ProvenanceContractError
      && error.code === 'PROVENANCE_DECISION_REQUIRED',
  );
});

test('hypothesis confirmation requires a human decision and is append-only', () => {
  assert.throws(
    () => applyHypothesisDecision(proposed(), {
      eventId: 'decision-system',
      outcome: 'confirmed',
      decidedBy: { kind: 'system', id: 'auto' },
      decidedAt: at(2),
      reason: 'Automatic score',
    }),
    (error) => error.code === 'PROVENANCE_HUMAN_DECISION_REQUIRED',
  );

  const original = proposed();
  const confirmed = applyHypothesisDecision(original, {
    eventId: 'decision-1',
    outcome: 'confirmed',
    decidedBy: human,
    decidedAt: at(2),
    reason: 'The person confirms this interpretation.',
    evidenceIds: ['evidence-1'],
  });

  assert.equal(original.status, 'proposed');
  assert.equal(original.decisions.length, 0);
  assert.equal(confirmed.status, 'confirmed');
  assert.equal(confirmed.decisions.length, 1);
  assert.equal(confirmed.decisions[0].decidedBy.kind, 'human');
});

test('a final decision can only be replaced by an explicit superseding event', () => {
  const confirmed = applyHypothesisDecision(proposed(), {
    eventId: 'decision-1',
    outcome: 'confirmed',
    decidedBy: human,
    decidedAt: at(2),
    reason: 'Confirmed by the person.',
  });
  assert.throws(
    () => applyHypothesisDecision(confirmed, {
      eventId: 'decision-2',
      outcome: 'rejected',
      decidedBy: human,
      decidedAt: at(3),
      reason: 'Overwrite attempt.',
    }),
    (error) => error.code === 'PROVENANCE_DECISION_FORBIDDEN',
  );
  const superseded = applyHypothesisDecision(confirmed, {
    eventId: 'decision-3',
    outcome: 'superseded',
    decidedBy: human,
    decidedAt: at(3),
    reason: 'A newer hypothesis now represents the situation.',
  });
  assert.equal(superseded.status, 'superseded');
  assert.equal(superseded.decisions.length, 2);
});

test('promotion to fact requires a confirmed hypothesis and human confirmation', () => {
  assert.throws(
    () => promoteHypothesisToFact(proposed(), {}),
    (error) => error.code === 'PROVENANCE_HYPOTHESIS_NOT_CONFIRMED',
  );
  const confirmed = applyHypothesisDecision(proposed(), {
    eventId: 'decision-1',
    outcome: 'confirmed',
    decidedBy: human,
    decidedAt: at(2),
    reason: 'Confirmed by the person.',
  });
  const fact = promoteHypothesisToFact(confirmed, {
    id: 'fact-1',
    subject,
    predicate: 'has_confirmed_career_interest',
    confirmation: {
      method: 'human_review',
      confirmedBy: human,
      confirmedAt: at(2),
      evidenceIds: ['evidence-1'],
    },
    observedAt: at(2),
    uncertainty: { level: 'low', reasons: ['Direct confirmation'] },
    access: { classification: 'account_private' },
    createdAt: at(2),
  });
  assert.equal(fact.value.code, 'S');
  assert.equal(fact.source.type, 'human_decision');
});

test('facts cannot be confirmed solely by a system actor', () => {
  assert.throws(
    () => createFact({
      id: 'fact-system',
      subject,
      predicate: 'has_diploma',
      value: true,
      source: { type: 'system_derivation', id: 'engine-1', version: 'v1' },
      confirmation: {
        method: 'automatic',
        confirmedBy: { kind: 'system', id: 'engine-1' },
        confirmedAt: at(1),
      },
      observedAt: at(1),
      createdAt: at(1),
    }),
    (error) => error.code === 'PROVENANCE_AUTOMATIC_CONFIRMATION_FORBIDDEN',
  );
});

test('unsupported confidence percentages are rejected as false precision', () => {
  assert.throws(
    () => createHypothesis({
      ...proposed(),
      id: 'hypothesis-percent',
      uncertainty: { confidencePercent: 87, reasons: [] },
    }),
    (error) => error.code === 'PROVENANCE_FALSE_PRECISION_FORBIDDEN',
  );
});

test('required enum fields fail closed instead of becoming null', () => {
  assert.throws(
    () => createEvidence({
      id: 'evidence-no-type',
      evidenceType: 'document',
      source: { id: 'source-1' },
      observedAt: at(1),
      scope: ['qualification'],
      createdAt: at(1),
    }),
    (error) => error.code === 'PROVENANCE_FIELD_REQUIRED',
  );
});

test('fact validity intervals cannot run backwards', () => {
  assert.throws(
    () => createFact({
      id: 'fact-dates',
      subject,
      predicate: 'has_status',
      value: 'active',
      source: { type: 'user_statement', id: 'answer-1' },
      confirmation: {
        method: 'human_review',
        confirmedBy: human,
        confirmedAt: at(2),
      },
      observedAt: at(2),
      validFrom: at(3),
      validUntil: at(2),
      createdAt: at(2),
    }),
    (error) => error.code === 'PROVENANCE_VALIDITY_INTERVAL_INVALID',
  );
});
