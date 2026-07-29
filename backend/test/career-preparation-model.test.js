'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PREPARATION_ADAPTER_VERSION,
  frameworkForOnetVersion,
  resolvePreparationReference,
} = require('../src/career/preparation-model');

test('O*NET 30.1 and earlier use the historical five-level framework', () => {
  const framework = frameworkForOnetVersion('30.1');
  assert.equal(framework.adapterVersion, PREPARATION_ADAPTER_VERSION);
  assert.equal(framework.frameworkKind, 'five_level');
  assert.deepEqual(framework.validZones, [1, 2, 3, 4, 5]);
  const reference = resolvePreparationReference({ sourceVersion: '30.1', jobZone: 1 });
  assert.equal(reference.available, true);
  assert.equal(reference.requiredRank, 2);
});

test('O*NET 30.2 and later use the four-level framework where value 2 represents Job Zone 1-2', () => {
  const framework = frameworkForOnetVersion('30.3');
  assert.equal(framework.frameworkKind, 'four_level');
  assert.deepEqual(framework.validZones, [2, 3, 4, 5]);
  const reference = resolvePreparationReference({ sourceVersion: '30.3', jobZone: 2 });
  assert.equal(reference.available, true);
  assert.equal(reference.zoneLabel, 'Job Zone 1-2');
  assert.equal(reference.requiredRank, 3);
  assert.equal(resolvePreparationReference({ sourceVersion: '30.3', jobZone: 1 }).reason, 'unsupported_job_zone');
});

test('unknown O*NET versions are not guessed', () => {
  const reference = resolvePreparationReference({ sourceVersion: 'fixture-latest', jobZone: 4 });
  assert.equal(reference.available, false);
  assert.equal(reference.reason, 'unknown_onet_version');
  assert.equal(reference.frameworkId, null);
});
