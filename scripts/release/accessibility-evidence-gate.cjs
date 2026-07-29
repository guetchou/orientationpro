'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_EVIDENCE = Object.freeze([
  Object.freeze({ file: 'firefox.json', kind: 'browser', target: 'firefox' }),
  Object.freeze({ file: 'webkit.json', kind: 'browser', target: 'webkit-safari' }),
  Object.freeze({ file: 'screen-reader.json', kind: 'assistive-technology', target: 'screen-reader' }),
  Object.freeze({ file: 'keyboard-zoom-contrast.json', kind: 'manual', target: 'keyboard-zoom-contrast' }),
]);

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
  if (typeof evidence?.executor !== 'string' || evidence.executor.trim().length < 2) failures.push('executor is required');
  if (typeof evidence?.environment !== 'string' || evidence.environment.trim().length < 2) failures.push('environment is required');
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
