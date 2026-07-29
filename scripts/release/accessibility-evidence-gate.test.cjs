'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { REQUIRED_EVIDENCE, evaluateDirectory } = require('./accessibility-evidence-gate.cjs');

const createEvidence = (entry, overrides = {}) => ({
  schemaVersion: 'makoki.accessibility-evidence.v1',
  kind: entry.kind,
  target: entry.target,
  result: 'pass',
  scenarios: ['login', 'parcours', 'error-recovery'],
  defects: [],
  executedAt: '2026-07-29T00:00:00.000Z',
  executor: 'named-reviewer',
  environment: 'isolated-preproduction-build',
  ...overrides,
});

const withDirectory = async (operation) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-a11y-'));
  try {
    await operation(directory);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
};

test('gate is no-go when Firefox, WebKit or assistive evidence is missing', async () => {
  await withDirectory(async (directory) => {
    const result = evaluateDirectory(directory);
    assert.equal(result.decision, 'no-go');
    assert.equal(result.results.every((entry) => entry.status === 'missing'), true);
  });
});

test('gate passes only when every required evidence file passes', async () => {
  await withDirectory(async (directory) => {
    for (const entry of REQUIRED_EVIDENCE) {
      fs.writeFileSync(path.join(directory, entry.file), JSON.stringify(createEvidence(entry)));
    }
    const result = evaluateDirectory(directory);
    assert.equal(result.decision, 'passed');
    assert.equal(result.results.every((entry) => entry.status === 'passed'), true);
  });
});

test('unresolved blocking defects force no-go even when result claims pass', async () => {
  await withDirectory(async (directory) => {
    for (const entry of REQUIRED_EVIDENCE) {
      const overrides = entry.file === 'screen-reader.json'
        ? { defects: [{ severity: 'blocking', status: 'open', description: 'focus lost' }] }
        : {};
      fs.writeFileSync(path.join(directory, entry.file), JSON.stringify(createEvidence(entry, overrides)));
    }
    const result = evaluateDirectory(directory);
    assert.equal(result.decision, 'no-go');
    assert.equal(result.results.find((entry) => entry.file === 'screen-reader.json').status, 'failed');
  });
});
