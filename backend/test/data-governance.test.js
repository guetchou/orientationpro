'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  appendConsentDecision,
  buildPortableExport,
  classifyTelemetry,
  createConsentLedger,
  minimizeTelemetry,
  pseudonymizeAccountId,
} = require('../src/operations/data-governance');
const {
  EVENT_CATALOG_VERSION,
  TELEMETRY_NOTICE_VERSION,
} = require('../src/operations/event-catalog');

const consent = () => createConsentLedger({
  accountId: 'account-1',
  noticeVersion: TELEMETRY_NOTICE_VERSION,
  eventCatalogVersion: EVENT_CATALOG_VERSION,
  decidedAt: '2026-07-29T00:00:00.000Z',
  eventId: 'consent-1',
});

test('unknown telemetry fails closed and consent-required events require active consent', () => {
  assert.equal(classifyTelemetry('request.failed'), 'essential');
  assert.equal(classifyTelemetry('journey.completed'), 'consent_required');
  assert.equal(classifyTelemetry('button.clicked'), 'forbidden');
  assert.throws(
    () => minimizeTelemetry({ name: 'button.clicked', occurredAt: new Date() }),
    /TELEMETRY_EVENT_FORBIDDEN/,
  );
  assert.throws(
    () => minimizeTelemetry({
      name: 'journey.completed', accountId: 'account-1', occurredAt: new Date(),
    }),
    /TELEMETRY_CONSENT_REQUIRED/,
  );
});

test('revocation is versioned and blocks telemetry while event replay is refused', () => {
  const granted = consent();
  const revoked = appendConsentDecision(granted, {
    accountId: 'account-1',
    expectedRevision: 1,
    decision: 'revoked',
    occurredAt: '2026-07-29T01:00:00.000Z',
    eventId: 'consent-2',
  });
  assert.equal(revoked.revision, 2);
  assert.equal(revoked.status, 'revoked');
  assert.throws(
    () => minimizeTelemetry({
      name: 'journey.blocked',
      accountId: 'account-1',
      occurredAt: '2026-07-29T02:00:00.000Z',
    }, { consent: revoked }),
    /TELEMETRY_CONSENT_REQUIRED/,
  );
  assert.throws(
    () => appendConsentDecision(granted, {
      accountId: 'account-1',
      expectedRevision: 1,
      decision: 'granted',
      occurredAt: '2026-07-29T02:00:00.000Z',
      eventId: 'consent-1',
    }),
    /TELEMETRY_CONSENT_EVENT_REPLAYED/,
  );
});

test('telemetry uses shared catalog provenance and excludes sensitive payloads', () => {
  const minimized = minimizeTelemetry({
    name: 'journey.blocked',
    accountId: 'account-1',
    participantId: 'participant-pseudonym',
    occurredAt: '2026-07-29T00:30:00.000Z',
    result: 'blocked',
    source: { schemaVersion: 'life-project-v1', recordVersion: 12 },
    token: 'never',
    answers: ['private'],
    document: Buffer.from('private'),
  }, { consent: consent() });
  assert.deepEqual(minimized, {
    schemaVersion: EVENT_CATALOG_VERSION,
    name: 'journey.blocked',
    classification: 'consent_required',
    unit: 'participant',
    occurredAt: '2026-07-29T00:30:00.000Z',
    participantId: 'participant-pseudonym',
    result: 'blocked',
    source: { system: 'makoki-api', schemaVersion: 'life-project-v1', recordVersion: 12 },
  });
});

test('pseudonyms are deterministic per protected salt and not reversible identifiers', () => {
  const input = { accountId: 'account-1', salt: 'a'.repeat(32) };
  const first = pseudonymizeAccountId(input);
  assert.equal(first, pseudonymizeAccountId(input));
  assert.notEqual(first, pseudonymizeAccountId({ ...input, salt: 'b'.repeat(32) }));
  assert.doesNotMatch(first, /account-1/);
});

test('portable export enforces ownership and strict allowlists for every entity type', () => {
  const output = buildPortableExport({
    requesterAccountId: 'account-1',
    account: { id: 'account-1', status: 'active', roles: ['user'], passwordHash: 'never' },
    profile: {
      id: 'profile-1',
      ownerAccountId: 'account-1',
      preferredName: 'A',
      skills: ['analysis'],
      internalNotes: 'never',
      token: 'never',
      document: Buffer.from('never'),
    },
    lifeProjects: [{
      id: 'project-1',
      ownerAccountId: 'account-1',
      title: 'Projet',
      state: 'clarification',
      rawDocument: 'never',
      internalVersion: 99,
    }],
    results: [{
      id: 'result-1',
      ownerAccountId: 'account-1',
      instrumentId: 'riasec',
      algorithmVersion: 'v1',
      completedAt: '2026-07-29T00:00:00.000Z',
      token: 'never',
      answers: ['never'],
    }],
    clock: () => new Date('2026-07-29T03:00:00.000Z'),
  });
  const serialized = JSON.stringify(output);
  assert.equal(output.schemaVersion, 'makoki.portable-export.v2');
  assert.doesNotMatch(
    serialized,
    /passwordHash|internalNotes|rawDocument|internalVersion|token|answers|never/,
  );
  assert.equal(output.profile.preferredName, 'A');
  assert.equal(output.lifeProjects[0].title, 'Projet');
  assert.equal(output.orientationResults[0].algorithmVersion, 'v1');
});

test('portable export rejects cross-account roots before serialization', () => {
  assert.throws(
    () => buildPortableExport({
      requesterAccountId: 'account-1',
      account: { id: 'account-1' },
      profile: { id: 'profile-2', ownerAccountId: 'account-2' },
    }),
    /PORTABLE_EXPORT_PROFILE_OWNERSHIP_INVALID/,
  );
});
