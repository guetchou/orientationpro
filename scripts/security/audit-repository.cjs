'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const failures = [];
const warnings = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

for (const flag of [
  'AUTH_V1_ENABLED',
  'LEGACY_AUTH_ENABLED',
  'RIASEC_API_ENABLED',
  'CAREER_API_ENABLED',
  'CV_API_V1_ENABLED',
  'FEATURE_CHATBOT',
  'FEATURE_ANALYTICS',
]) {
  if (!new RegExp(`^${flag}=false$`, 'm').test(read('backend/.env.example'))) {
    failures.push(`backend/.env.example: ${flag} must remain disabled by default`);
  }
}

for (const workflow of fs.readdirSync(path.join(root, '.github', 'workflows'))) {
  const file = `.github/workflows/${workflow}`;
  const source = read(file);
  if (!/^permissions:\s*\n\s+contents:\s+read\s*$/m.test(source)) {
    failures.push(`${file}: top-level workflow permissions must be read-only`);
  }
  if (/\bpull_request_target\b/.test(source)) {
    failures.push(`${file}: pull_request_target requires a dedicated threat review`);
  }
}

const server = read('backend/src/server.js');
if (/app\.use\('\/api\/(?:cv|candidates|jobs|ats|appointments|messaging|applications|matching|communication)'/.test(server)) {
  warnings.push('legacy API surfaces remain mounted outside the v1 feature flags');
}
if (!/rateLimit|rateLimiter|limiter/.test(server)) {
  warnings.push('no central rate limiter is wired into backend/src/server.js');
}
if (/console\.error/.test(server)) {
  warnings.push('central errors are not yet routed through the redaction helper');
}

const result = {
  status: failures.length ? 'failed' : 'passed-with-known-risks',
  failures,
  warnings,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
