'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  CONTENT_KINDS,
  CONTENT_REGISTRY_VERSION,
  ContentRegistryContractError,
  createContentRecord,
  createContentRelation,
  createEmptyContentRegistry,
} = require('../src/content-registry');
const { createFact, createHypothesis } = require('../src/provenance');

const at = (day) => `2026-07-${String(day).padStart(2, '0')}T08:00:00.000Z`;
const source = {
  id: 'source-fixture-1',
  level: 'international',
  title: 'Synthetic contract-test source',
  responsibleParty: 'Test fixture owner',
  authorityName: 'Synthetic test authority',
  uri: 'https://example.test/source',
  license: 'test-only',
  version: 'fixture-v1',
  retrievedAt: at(1),
};

const draftRecord = (overrides = {}) => ({
  id: 'content-fixture-1',
  kind: 'qualification',
  labels: [{ language: 'fr', value: 'Libellé de test non réel' }],
  descriptions: [],
  source,
  geographicScope: {
    level: 'unknown',
    codes: [],
    description: 'Périmètre inconnu dans cette fixture synthétique.',
  },
  languages: ['fr'],
  freshness: {
    status: 'unknown',
    checkedAt: at(1),
    notes: 'Aucune fraîcheur réelle déduite de cette fixture.',
  },
  verification: { status: 'draft', statusChangedAt: at(1), decisions: [] },
  trust: {
    level: 'unknown',
    reasons: ['Aucune confiance réelle ne peut être déduite d’une fixture.'],
  },
  assertions: { evidence: [], hypotheses: [], facts: [] },
  createdAt: at(1),
  ...overrides,
});

test('the registry covers every required content kind without shipping content', () => {
  assert.deepEqual(CONTENT_KINDS, [
    'country',
    'education_system',
    'qualification',
    'training',
    'institution',
    'occupation',
    'skill',
    'pathway',
    'authority',
    'regulated_profession',
  ]);
  assert.deepEqual(createEmptyContentRegistry(), {
    schemaVersion: CONTENT_REGISTRY_VERSION,
    records: [],
    relations: [],
    activationStatus: 'inactive',
  });
});

test('a content record requires source, date, scope, version, licence and verification status', () => {
  const record = createContentRecord(draftRecord());
  assert.equal(record.source.version, 'fixture-v1');
  assert.equal(record.source.license, 'test-only');
  assert.equal(record.geographicScope.level, 'unknown');
  assert.equal(record.verification.status, 'draft');
  assert.equal(record.trust.level, 'unknown');
  assert.equal(Object.isFrozen(record), true);

  for (const field of ['version', 'license', 'retrievedAt']) {
    assert.throws(
      () => createContentRecord(draftRecord({
        source: { ...source, [field]: undefined },
      })),
      (error) => error instanceof ContentRegistryContractError
        && error.code === 'CONTENT_REGISTRY_FIELD_REQUIRED',
    );
  }
});

test('local and national scopes require explicit geographic codes', () => {
  assert.throws(
    () => createContentRecord(draftRecord({
      geographicScope: {
        level: 'local',
        codes: [],
        description: 'Fixture locale incomplète.',
      },
    })),
    (error) => error.code === 'CONTENT_REGISTRY_GEOGRAPHY_REQUIRED',
  );
});

test('user statements cannot masquerade as authority sources', () => {
  assert.throws(
    () => createContentRecord(draftRecord({
      source: {
        ...source,
        level: 'user_statement',
        authorityName: 'Not allowed',
      },
    })),
    (error) => error.code === 'CONTENT_REGISTRY_USER_STATEMENT_AUTHORITY_FORBIDDEN',
  );
});

test('content cannot be created directly as verified', () => {
  assert.throws(
    () => createContentRecord(draftRecord({
      verification: { status: 'verified', decisions: [] },
    })),
    (error) => error.code === 'CONTENT_REGISTRY_VERIFICATION_WORKFLOW_REQUIRED',
  );
});

test('FactV1 and HypothesisV1 assertions must reference their content record', () => {
  const hypothesis = createHypothesis({
    id: 'hypothesis-fixture-1',
    subject: { type: 'content_record', id: 'other-content' },
    hypothesisType: 'content_interpretation',
    value: { note: 'Synthetic' },
    generator: { kind: 'human', id: 'fixture-author' },
    rationale: ['Contract fixture only.'],
    createdAt: at(1),
  });
  assert.throws(
    () => createContentRecord(draftRecord({
      assertions: { evidence: [], hypotheses: [hypothesis], facts: [] },
    })),
    (error) => error.code === 'CONTENT_REGISTRY_ASSERTION_SUBJECT_MISMATCH',
  );
});

test('evidence must reference the record', () => {
  assert.throws(
    () => createContentRecord(draftRecord({
      assertions: {
        evidence: [{
          id: 'evidence-other',
          evidenceType: 'document',
          subject: { type: 'content_record', id: 'other-content' },
          source: { type: 'document', id: 'document-fixture' },
          observedAt: at(1),
          scope: ['fixture'],
          createdAt: at(1),
        }],
        hypotheses: [],
        facts: [],
      },
    })),
    (error) => error.code === 'CONTENT_REGISTRY_ASSERTION_SUBJECT_MISMATCH',
  );
});

test('regulated relations stay unknown or proposed without authority confirmation', () => {
  const relation = createContentRelation({
    id: 'relation-fixture-unknown',
    relationType: 'equivalence',
    sourceId: 'qualification-a',
    targetId: 'qualification-b',
    status: 'unknown',
    notes: 'No authority decision is available.',
    createdAt: at(1),
  });
  assert.equal(relation.status, 'unknown');
  assert.throws(
    () => createContentRelation({ ...relation, id: 'direct-confirmation', status: 'confirmed' }),
    (error) => error.code === 'CONTENT_REGISTRY_FACT_REQUIRED',
  );
});

test('a regulated relation requires a matching FactV1 confirmed by an authority', () => {
  const fact = createFact({
    id: 'fact-relation-fixture',
    subject: { type: 'content_record', id: 'qualification-a' },
    predicate: 'has_authority_relation',
    value: { relationType: 'equivalence', targetId: 'qualification-b' },
    source: {
      type: 'external_authority',
      id: 'authority-record-fixture',
      authorityName: 'Synthetic test authority',
      retrievedAt: at(2),
      version: 'fixture-v1',
    },
    confirmation: {
      method: 'authority_record_review',
      confirmedBy: { kind: 'authority', id: 'authority-fixture' },
      confirmedAt: at(2),
      evidenceIds: ['evidence-fixture'],
    },
    observedAt: at(2),
    createdAt: at(2),
  });
  const confirmed = createContentRelation({
    id: 'relation-fixture-confirmed',
    relationType: 'equivalence',
    sourceId: 'qualification-a',
    targetId: 'qualification-b',
    status: 'confirmed',
    fact,
    authorityRef: {
      authorityContentId: 'authority-fixture',
      jurisdiction: { level: 'unknown', codes: [], description: 'Juridiction synthétique.' },
      competenceTypes: ['equivalence'],
      evidenceIds: ['evidence-fixture'],
    },
    notes: 'Synthetic authority-confirmed contract fixture.',
    createdAt: at(2),
  });
  assert.equal(confirmed.fact.confirmation.confirmedBy.kind, 'authority');

  const humanFact = createFact({
    id: 'fact-human-relation-fixture',
    subject: { type: 'content_record', id: 'qualification-a' },
    predicate: 'has_human_reviewed_relation',
    value: { relationType: 'equivalence', targetId: 'qualification-b' },
    source: { type: 'human_decision', id: 'decision-fixture', version: 'v1' },
    confirmation: {
      method: 'human_review',
      confirmedBy: { kind: 'human', id: 'reviewer-fixture' },
      confirmedAt: at(2),
    },
    observedAt: at(2),
    createdAt: at(2),
  });
  assert.throws(
    () => createContentRelation({
      id: 'relation-human-only',
      relationType: 'equivalence',
      sourceId: 'qualification-a',
      targetId: 'qualification-b',
      status: 'confirmed',
      fact: humanFact,
      authorityRef: {
        authorityContentId: 'reviewer-fixture',
        jurisdiction: { level: 'unknown', codes: [], description: 'Juridiction synthétique.' },
        competenceTypes: ['equivalence'],
        evidenceIds: ['evidence-fixture'],
      },
      notes: 'Must fail without an authority FactV1.',
      createdAt: at(2),
    }),
    (error) => error.code === 'CONTENT_REGISTRY_AUTHORITY_CONFIRMATION_REQUIRED',
  );
});

test('an authority label alone cannot confirm a regulated relation', () => {
  const weakFact = createFact({
    id: 'fact-weak-authority',
    subject: { type: 'content_record', id: 'qualification-a' },
    predicate: 'has_authority_relation',
    value: { relationType: 'equivalence', targetId: 'qualification-b' },
    source: { type: 'human_decision', id: 'decision-weak', version: 'v1' },
    confirmation: {
      method: 'declared_authority',
      confirmedBy: { kind: 'authority', id: 'authority-fixture' },
      confirmedAt: at(2),
      evidenceIds: [],
    },
    observedAt: at(2),
    createdAt: at(2),
  });
  assert.throws(
    () => createContentRelation({
      id: 'relation-weak-authority',
      relationType: 'equivalence',
      sourceId: 'qualification-a',
      targetId: 'qualification-b',
      status: 'confirmed',
      fact: weakFact,
      authorityRef: {
        authorityContentId: 'authority-fixture',
        jurisdiction: { level: 'unknown', codes: [], description: 'Fixture synthétique.' },
        competenceTypes: ['equivalence'],
        evidenceIds: ['evidence-fixture'],
      },
      notes: 'Must fail without external authority evidence.',
      createdAt: at(2),
    }),
    (error) => error.code === 'CONTENT_REGISTRY_AUTHORITY_CONFIRMATION_REQUIRED',
  );
});
