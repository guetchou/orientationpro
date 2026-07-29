'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ROOT = path.resolve(__dirname, '..', '..');
const FEATURE_FLAG_NAME = /^(?:[A-Z0-9_]+_ENABLED|FEATURE_[A-Z0-9_]+)$/;

const auditDefaultFlags = (source, file = 'backend/.env.example') => {
  const flags = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    })
    .filter(([name]) => FEATURE_FLAG_NAME.test(name));

  if (flags.length === 0) {
    return [`${file}: no feature flags discovered`];
  }

  return flags
    .filter(([, value]) => value !== 'false')
    .map(([name]) => `${file}: ${name} must remain disabled by default`);
};

const auditWorkflowPermissions = (source, file) => {
  const failures = [];
  const lines = source.split(/\r?\n/);
  let topLevelPermissionsFound = false;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(\s*)permissions:\s*(.*?)\s*$/);
    if (!match) continue;

    const baseIndent = match[1].length;
    const inlineValue = match[2].replace(/\s+#.*$/, '').trim();
    if (baseIndent === 0) topLevelPermissionsFound = true;

    if (inlineValue) {
      if (!['read-all', '{}'].includes(inlineValue)) {
        failures.push(`${file}:${index + 1}: permissions must be read-only`);
      }
      continue;
    }

    let entries = 0;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      if (!line.trim() || line.trimStart().startsWith('#')) continue;
      const indent = line.match(/^\s*/)[0].length;
      if (indent <= baseIndent) break;

      const permission = line.trim().match(/^([a-z-]+):\s*([a-z-]+)\s*(?:#.*)?$/);
      if (!permission) continue;
      entries += 1;
      if (!['read', 'none'].includes(permission[2])) {
        failures.push(
          `${file}:${cursor + 1}: ${permission[1]}:${permission[2]} is not read-only`,
        );
      }
    }

    if (entries === 0) {
      failures.push(`${file}:${index + 1}: permissions mapping must be explicit`);
    }
  }

  if (!topLevelPermissionsFound) {
    failures.push(`${file}: top-level workflow permissions are required`);
  }
  if (/\bpull_request_target\b/.test(source)) {
    failures.push(`${file}: pull_request_target requires a dedicated threat review`);
  }

  return failures;
};

const inspectRepository = (root = DEFAULT_ROOT) => {
  const failures = [];
  const warnings = [];
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

  failures.push(...auditDefaultFlags(read('backend/.env.example')));

  for (const workflow of fs.readdirSync(path.join(root, '.github', 'workflows'))) {
    const file = `.github/workflows/${workflow}`;
    failures.push(...auditWorkflowPermissions(read(file), file));
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

  return {
    status: failures.length ? 'failed' : 'passed-with-known-risks',
    failures,
    warnings,
  };
};

if (require.main === module) {
  const result = inspectRepository();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.failures.length) process.exitCode = 1;
}

module.exports = {
  auditDefaultFlags,
  auditWorkflowPermissions,
  inspectRepository,
};
