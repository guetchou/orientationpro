'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_EVIDENCE = Object.freeze([
  Object.freeze({ file: 'firefox.json', kind: 'browser', target: 'firefox-playwright' }),
  Object.freeze({ file: 'webkit.json', kind: 'browser', target: 'webkit-playwright' }),
  Object.freeze({ file: 'safari-macos.json', kind: 'browser', target: 'safari-macos' }),
  Object.freeze({ file: 'screen-reader.json', kind: 'assistive-technology', target: 'screen-reader' }),
  Object.freeze({ file: 'keyboard-zoom-contrast.json', kind: 'manual', target: 'keyboard-zoom-contrast' }),
]);

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 1;

const validateEvidence = (evidence, expected) => {
  const failures = [];
  if (!evidence || typeof evidence !== 'object') failures.push('evidence must be an object');
  if (evidence?.schemaVersion !== 'makoki.accessibility-evidence.v1') failures.push('schemaVersion is invalid');
  if (evidence?.kind !== expected.kind) failures.push(`kind must be ${expected.kind}`);
  if (evidence?.target !== expected.target) failures.push(`target must be ${expected.target}`);
  if (evidence?.result !== 'pass') failures.push('result must be pass');
  if (!Array.isArray(evidence?.scenarios) || evidence.scenarios.length === 0) failures.push('scenarios are required');
  if (!Array.isArray(evidence?.defects)) failures.push('defects must be an array');
  if (evidence?.defects?.some((defect) => defect?.severity === 'blocking' && defect?.status !== 'resolved')) {
    failures.push('unresolved blocking defect');
  }
  const executedAt = new Date(evidence?.executedAt);
  if (Number.isNaN(executedAt.getTime())) failures.push('executedAt must be an ISO timestamp');
  if (!isNonEmptyString(evidence?.executor)) failures.push('executor is required');
  if (!/^[0-9a-f]{40}$/.test(evidence?.commitSha ?? '')) failures.push('commitSha must be a full Git SHA');
  if (!isNonEmptyString(evidence?.command)) failures.push('command is required');
  if (!isNonEmptyString(evidence?.environment?.name)) failures.push('environment.name is required');
  if (!isNonEmptyString(evidence?.environment?.os)) failures.push('environment.os is required');
  if (!isNonEmptyString(evidence?.versions?.application)) failures.push('versions.application is required');
  if (!isNonEmptyString(evidence?.versions?.target)) failures.push('versions.target is required');
  if (!isNonEmptyString(evidence?.threshold)) failures.push('threshold is required');
  if (!Array.isArray(evidence?.limitations)) failures.push('limitations must be an array');
  if (!isNonEmptyString(evidence?.artifact?.path)) failures.push('artifact.path is required');
  if (!/^[0-9a-f]{64}$/.test(evidence?.artifact?.sha256 ?? '')) failures.push('artifact.sha256 must be a SHA-256 digest');
  return failures;
};

const evaluateDirectory = (directory) => {
  const results = [];
  for (const expected of REQUIRED_EVIDENCE) {
    const filePath = path.join(directory, expected.file);
    if (!fs.existsSync(filePath)) {
      results.push({ file: expected.file, status: 'missing', failures: ['evidence file is missing'] });
      continue;
    }
    try {
      const evidence = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const failures = validateEvidence(evidence, expected);
      results.push({ file: expected.file, status: failures.length ? 'failed' : 'passed', failures });
    } catch (error) {
      results.push({ file: expected.file, status: 'failed', failures: [`invalid JSON: ${error.message}`] });
    }
  }
  return {
    schemaVersion: 'makoki.accessibility-gate-result.v1',
    decision: results.every((result) => result.status === 'passed') ? 'passed' : 'no-go',
    results,
  };
};

if (require.main === module) {
  const directory = process.argv[2];
  if (!directory) {
    process.stderr.write('Usage: node scripts/release/accessibility-evidence-gate.cjs EVIDENCE_DIRECTORY\n');
    process.exitCode = 2;
  } else {
    const result = evaluateDirectory(path.resolve(directory));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.decision !== 'passed') process.exitCode = 1;
  }
}

module.exports = { REQUIRED_EVIDENCE, evaluateDirectory, validateEvidence };
