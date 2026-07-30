'use strict';

const fs = require('node:fs');
const path = require('node:path');

const read = (directory, file) => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const exists = (directory, file) => fs.existsSync(path.join(directory, file));
const populated = (value) => (
  typeof value === 'string' ? value.trim().length > 0
    : Array.isArray(value) ? value.length > 0
      : value && typeof value === 'object' ? Object.keys(value).length > 0
        : value === true
);

const decide = (directory) => {
  const manifest = read(directory, 'manifest.json');
  const load = read(directory, 'business-load.json');
  const manual = read(directory, 'manual-accessibility-gate.json');
  const dependencies = read(directory, 'dependency-matrix.json');
  const blockers = [];
  if (manifest.gitSha !== load.gitSha || dependencies.gitSha !== manifest.gitSha) {
    blockers.push('evidence is not attached to one Git SHA');
  }
  if (!load.isolation?.passed) blockers.push('authenticated account isolation failed under controlled load');
  if (load.stages?.some((stage) => stage.errorRate > 0.01 || stage.p95Ms > 1000)) {
    blockers.push('functional load threshold exceeded');
  }
  for (const result of manual.results || []) {
    if (result.status !== 'pass') blockers.push(`manual accessibility suite ${result.suite}: ${result.status}`);
    else if (result.gitSha !== manifest.gitSha) blockers.push(`manual accessibility suite ${result.suite}: wrong SHA`);
  }
  if (dependencies.findings?.some((finding) => !finding.owner || !finding.dueDate || !finding.decision)) {
    blockers.push('dependency finding without owner, due date or disposition');
  }
  if (!exists(directory, 'risk-acceptance.json')) {
    blockers.push('formal residual dependency risk acceptance missing');
  } else {
    const acceptance = read(directory, 'risk-acceptance.json');
    const required = ['gitSha', 'acceptedAt', 'acceptedBy', 'businessRole', 'acceptedRisks', 'rationale'];
    if (acceptance.gitSha !== manifest.gitSha
      || acceptance.explicitAcceptance !== true
      || required.some((field) => !populated(acceptance[field]))) {
      blockers.push('formal residual dependency risk acceptance invalid or attached to another SHA');
    }
  }
  if (!exists(directory, 'maintainer-decision.json')) {
    blockers.push('explicit maintainer activation decision missing');
  } else {
    const decision = read(directory, 'maintainer-decision.json');
    const required = [
      'gitSha', 'decidedAt', 'maintainer', 'decision', 'flags', 'cohort',
      'duration', 'stopThresholds', 'owner', 'rollbackProcedure',
    ];
    if (decision.gitSha !== manifest.gitSha
      || decision.explicitApproval !== true
      || !['GO', 'GO LIMITÉ'].includes(decision.decision)
      || required.some((field) => !populated(decision[field]))) {
      blockers.push('explicit maintainer activation decision invalid or incomplete');
    }
  }
  const approvedDecision = exists(directory, 'maintainer-decision.json')
    ? read(directory, 'maintainer-decision.json').decision
    : null;
  return {
    schemaVersion: 'makoki.v5g-final-gate.v1',
    generatedAt: new Date().toISOString(),
    gitSha: manifest.gitSha,
    decision: blockers.length ? 'NO-GO' : approvedDecision,
    blockers,
    invariant: 'Wave 5 feature flags remain disabled by default',
    limitation: 'A passing technical gate does not itself authorize public activation.',
  };
};

if (require.main === module) {
  try {
    const directory = process.argv[2];
    if (!directory || !path.isAbsolute(directory) || directory.startsWith('/tmp/')) {
      throw new Error('persistent absolute evidence directory outside /tmp required');
    }
    process.stdout.write(`${JSON.stringify(decide(directory), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`V5-G final gate failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { decide };
