'use strict';

const fs = require('node:fs');

const severityRank = Object.freeze({ low: 1, moderate: 2, high: 3, critical: 4 });

const normalizeVia = (via = []) => via.map((entry) => {
  if (typeof entry === 'string') return entry;
  return entry?.source ? `${entry.source}:${entry.title || 'advisory'}` : entry?.title || 'advisory';
});

const summarizeAudit = (audit, scope) => {
  const rows = Object.entries(audit?.vulnerabilities || {}).map(([name, vulnerability]) => ({
    scope,
    dependency: name,
    severity: vulnerability.severity || 'unknown',
    direct: Boolean(vulnerability.isDirect),
    range: vulnerability.range || null,
    via: normalizeVia(vulnerability.via),
    effects: [...(vulnerability.effects || [])],
    nodes: [...(vulnerability.nodes || [])],
    fixAvailable: vulnerability.fixAvailable === true
      ? { available: true, breaking: false }
      : vulnerability.fixAvailable && typeof vulnerability.fixAvailable === 'object'
        ? {
          available: true,
          name: vulnerability.fixAvailable.name || name,
          version: vulnerability.fixAvailable.version || null,
          breaking: Boolean(vulnerability.fixAvailable.isSemVerMajor),
        }
        : { available: false, breaking: false },
    decision: 'unreviewed',
    owner: null,
    dueDate: null,
    compensatingControls: [],
  }));
  rows.sort((left, right) => (
    (severityRank[right.severity] || 0) - (severityRank[left.severity] || 0)
    || Number(right.direct) - Number(left.direct)
    || left.dependency.localeCompare(right.dependency)
  ));
  return rows;
};

const buildReport = (inputs) => {
  const vulnerabilities = inputs.flatMap(({ scope, audit }) => summarizeAudit(audit, scope));
  const counts = vulnerabilities.reduce((result, item) => {
    result[item.severity] = (result[item.severity] || 0) + 1;
    return result;
  }, {});
  return {
    schemaVersion: 'makoki.dependency-risk-report.v1',
    generatedAt: new Date().toISOString(),
    interpretation: 'inventory_only_no_risk_acceptance',
    counts,
    vulnerabilities,
  };
};

const parseArguments = (argv) => {
  const inputs = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== '--input') throw new Error(`Unsupported argument: ${argv[index]}`);
    const value = argv[index + 1];
    if (!value || !value.includes('=')) throw new Error('--input requires scope=path');
    const [scope, ...pathParts] = value.split('=');
    inputs.push({ scope, path: pathParts.join('=') });
    index += 1;
  }
  if (inputs.length === 0) throw new Error('At least one --input scope=path is required');
  return inputs;
};

if (require.main === module) {
  try {
    const inputs = parseArguments(process.argv.slice(2)).map(({ scope, path }) => ({
      scope,
      audit: JSON.parse(fs.readFileSync(path, 'utf8')),
    }));
    process.stdout.write(`${JSON.stringify(buildReport(inputs), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Dependency report failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { buildReport, parseArguments, summarizeAudit };
