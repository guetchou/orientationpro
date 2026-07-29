'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { buildReport, parseArguments, summarizeAudit } = require('./dependency-report.cjs');

test('audit summary orders critical and high dependencies before lower severities', () => {
  const rows = summarizeAudit({
    vulnerabilities: {
      indirect: { severity: 'high', isDirect: false, via: ['parent'], effects: [], nodes: ['node_modules/indirect'], fixAvailable: false },
      direct: { severity: 'critical', isDirect: true, via: [{ source: 123, title: 'prototype pollution' }], effects: ['indirect'], nodes: ['node_modules/direct'], range: '<2', fixAvailable: { name: 'direct', version: '2.0.0', isSemVerMajor: true } },
    },
  }, 'root-production');
  assert.equal(rows[0].dependency, 'direct');
  assert.equal(rows[0].severity, 'critical');
  assert.deepEqual(rows[0].fixAvailable, { available: true, name: 'direct', version: '2.0.0', breaking: true });
  assert.equal(rows[0].decision, 'unreviewed');
  assert.equal(rows[1].dependency, 'indirect');
});

test('report never converts inventory into automatic risk acceptance', () => {
  const report = buildReport([{
    scope: 'backend-production',
    audit: { vulnerabilities: { dependency: { severity: 'high', isDirect: true, via: [], effects: [], nodes: [], fixAvailable: true } } },
  }]);
  assert.equal(report.interpretation, 'inventory_only_no_risk_acceptance');
  assert.deepEqual(report.counts, { high: 1 });
  assert.equal(report.vulnerabilities[0].decision, 'unreviewed');
  assert.equal(report.vulnerabilities[0].owner, null);
});

test('argument parser requires explicit scope and path pairs', () => {
  assert.deepEqual(parseArguments(['--input', 'root=/tmp/root.json', '--input', 'backend=/tmp/backend.json']), [
    { scope: 'root', path: '/tmp/root.json' },
    { scope: 'backend', path: '/tmp/backend.json' },
  ]);
  assert.throws(() => parseArguments([]), /At least one/);
  assert.throws(() => parseArguments(['--input', 'missing-separator']), /scope=path/);
});
