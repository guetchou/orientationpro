'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { build } = require('./v5g-dependency-matrix.cjs');

const audit = (name, vulnerability) => ({
  metadata: { vulnerabilities: { high: 1, total: 1 } },
  vulnerabilities: { [name]: vulnerability },
});
const empty = { metadata: { vulnerabilities: { total: 0 } }, vulnerabilities: {} };

test('keeps advisory, dependency path, reachability and accountable disposition', () => {
  const report = build({
    rootAll: audit('vite', {
      severity: 'high',
      isDirect: true,
      range: '<8',
      nodes: ['node_modules/vite'],
      via: [{ source: 42, title: 'test advisory', url: 'https://example.test/42', range: '<8' }],
      fixAvailable: { name: 'vite', version: '8.1.5', isSemVerMajor: true },
    }),
    rootProduction: audit('vite', {}),
    backendAll: empty,
    backendProduction: empty,
    gitSha: 'abc',
  });
  const [finding] = report.findings;
  assert.equal(finding.advisory[0].id, 'npm:42');
  assert.deepEqual(finding.dependencyPath, ['node_modules/vite']);
  assert.equal(finding.scope, 'production-graph');
  assert.equal(finding.decision, 'compensate');
  assert.ok(finding.owner);
  assert.ok(finding.dueDate);
  assert.match(report.interpretation, /business decision-maker/);
});

test('does not call a development-only package production', () => {
  const report = build({
    rootAll: audit('eslint', { severity: 'high', nodes: ['node_modules/eslint'], via: [], fixAvailable: true }),
    rootProduction: empty,
    backendAll: empty,
    backendProduction: empty,
    gitSha: 'abc',
  });
  assert.equal(report.findings[0].scope, 'development-graph');
  assert.equal(report.findings[0].reachability, 'development-or-ci-only');
});

test('resolves an advisory through the vulnerable dependency chain', () => {
  const rootAll = {
    metadata: { vulnerabilities: { high: 2, total: 2 } },
    vulnerabilities: {
      parent: { severity: 'high', nodes: ['node_modules/parent'], via: ['child'], fixAvailable: false },
      child: {
        severity: 'high',
        nodes: ['node_modules/child'],
        via: [{ source: 99, title: 'nested advisory', url: 'https://example.test/99' }],
        fixAvailable: false,
      },
    },
  };
  const report = build({
    rootAll,
    rootProduction: empty,
    backendAll: empty,
    backendProduction: empty,
    gitSha: 'abc',
  });
  assert.equal(report.findings.find(({ dependency }) => dependency === 'parent').advisory[0].id, 'npm:99');
});
