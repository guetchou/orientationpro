'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const requiredSuites = ['safari-voiceover', 'windows-nvda', 'keyboard-zoom'];
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const verify = (directory) => requiredSuites.map((suite) => {
  const recordPath = path.join(directory, `${suite}.json`);
  if (!fs.existsSync(recordPath)) return { suite, status: 'missing' };
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  const fields = ['gitSha', 'executedAt', 'executor', 'environment', 'result', 'artifact', 'artifactSha256'];
  const missing = fields.filter((field) => !record[field]);
  if (missing.length) return { suite, status: 'invalid', missing };
  const artifactPath = path.resolve(directory, record.artifact);
  if (!artifactPath.startsWith(`${path.resolve(directory)}${path.sep}`) || !fs.existsSync(artifactPath)) {
    return { suite, status: 'invalid', reason: 'artifact missing or outside evidence directory' };
  }
  if (sha256(artifactPath) !== record.artifactSha256) {
    return { suite, status: 'invalid', reason: 'artifact digest mismatch' };
  }
  return { suite, status: record.result === 'pass' ? 'pass' : 'fail', gitSha: record.gitSha };
});

if (require.main === module) {
  const directory = process.argv[2];
  if (!directory || !path.isAbsolute(directory) || directory.startsWith('/tmp/')) {
    process.stderr.write('A persistent absolute evidence directory outside /tmp is required\n');
    process.exit(2);
  }
  const results = verify(directory);
  process.stdout.write(`${JSON.stringify({ schemaVersion: 'makoki.v5g-manual-a11y-gate.v1', results }, null, 2)}\n`);
  if (results.some((item) => item.status !== 'pass')) process.exitCode = 1;
}

module.exports = { requiredSuites, verify };
