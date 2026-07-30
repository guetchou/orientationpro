'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { decide } = require('./v5g-final-gate.cjs');

test('missing manual and formal decisions produce named NO-GO blockers', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'v5g-final-gate-'));
  try {
    const fixtures = {
      'manifest.json': { gitSha: 'candidate' },
      'business-load.json': { gitSha: 'candidate', isolation: { passed: true }, stages: [] },
      'dependency-matrix.json': {
        gitSha: 'candidate',
        findings: [{ decision: 'compensate', owner: 'owner', dueDate: '2026-08-05' }],
      },
      'manual-accessibility-gate.json': {
        results: [{ suite: 'safari-voiceover', status: 'missing' }],
      },
    };
    for (const [name, value] of Object.entries(fixtures)) {
      fs.writeFileSync(path.join(directory, name), JSON.stringify(value));
    }
    const result = decide(directory);
    assert.equal(result.decision, 'NO-GO');
    assert.ok(result.blockers.some((blocker) => blocker.includes('safari-voiceover')));
    assert.ok(result.blockers.some((blocker) => blocker.includes('risk acceptance')));
    assert.ok(result.blockers.some((blocker) => blocker.includes('maintainer')));
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});

test('empty approval files cannot lift the NO-GO', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'v5g-final-gate-empty-'));
  try {
    const fixtures = {
      'manifest.json': { gitSha: 'candidate' },
      'business-load.json': { gitSha: 'candidate', isolation: { passed: true }, stages: [] },
      'dependency-matrix.json': { gitSha: 'candidate', findings: [] },
      'manual-accessibility-gate.json': { results: [] },
      'risk-acceptance.json': {},
      'maintainer-decision.json': {},
    };
    for (const [name, value] of Object.entries(fixtures)) {
      fs.writeFileSync(path.join(directory, name), JSON.stringify(value));
    }
    const result = decide(directory);
    assert.equal(result.decision, 'NO-GO');
    assert.ok(result.blockers.some((blocker) => blocker.includes('risk acceptance invalid')));
    assert.ok(result.blockers.some((blocker) => blocker.includes('activation decision invalid')));
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
