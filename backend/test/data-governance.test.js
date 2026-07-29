'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  buildPortableExport,
  classifyTelemetry,
  minimizeTelemetry,
  pseudonymizeAccountId,
} = require('../src/operations/data-governance');

test('essential and consent telemetry are separated and unknown events fail closed', () => {
  assert.equal(classifyTelemetry('request.failed'), 'essential');
  assert.equal(classifyTelemetry('journey.completed'), 'consent_required');
  assert.equal(classifyTelemetry('button.clicked'), 'forbidden');
  assert.throws(
    () => minimizeTelemetry({ name: 'button.clicked', occurredAt: new Date() }),
    /TELEMETRY_EVENT_FORBIDDEN/,
  );
});

test('telemetry minimization excludes account, answers and document content', () => {
  const minimized = minimizeTelemetry({
    name: 'journey.blocked',
    occurredAt: '2026-07-29T00:00:00.000Z',
    cohort: 'pilot-internal',
    result: 'blocked',
    accountId: 'account-1',
    answers: ['private'],
    document: Buffer.from('private'),
  });
  assert.deepEqual(minimized, {
    name: 'journey.blocked',
    classification: 'consent_required',
    occurredAt: '2026-07-29T00:00:00.000Z',
    cohort: 'pilot-internal',
    result: 'blocked',
  });
});

test('pseudonyms are deterministic per protected salt and not reversible identifiers', () => {
  const input = { accountId: 'account-1', salt: 'a'.repeat(32) };
  const first = pseudonymizeAccountId(input);
  assert.equal(first, pseudonymizeAccountId(input));
  assert.notEqual(first, pseudonymizeAccountId({ ...input, salt: 'b'.repeat(32) }));
  assert.doesNotMatch(first, /account-1/);
});

test('portable export is versioned and detached from source objects', () => {
  const profile = { preferredName: 'A', skills: ['analysis'] };
  const output = buildPortableExport({
    account: { id: 'account-1', status: 'active', roles: ['user'], passwordHash: 'never' },
    profile,
    lifeProjects: [{ id: 'project-1', state: 'clarification' }],
    results: [{ id: 'result-1', algorithmVersion: 'v1' }],
  });
  profile.skills.push('later-change');
  assert.equal(output.schemaVersion, 'makoki.portable-export.v1');
  assert.equal(output.account.passwordHash, undefined);
  assert.deepEqual(output.profile.skills, ['analysis']);
});
