'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

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
  let workflow;
  try {
    workflow = YAML.parse(source, {
      maxAliasCount: 100,
      merge: true,
      prettyErrors: false,
    });
  } catch (error) {
    return [`${file}: invalid YAML: ${error.message}`];
  }

  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) {
    return [`${file}: workflow must be a YAML mapping`];
  }

  const validatePermissions = (permissions, location) => {
    if (permissions === 'read-all') return;
    if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
      failures.push(`${file}: ${location} must be read-only`);
      return;
    }
    for (const [scope, access] of Object.entries(permissions)) {
      if (!['read', 'none'].includes(access)) {
        failures.push(`${file}: ${location}.${scope}:${String(access)} is not read-only`);
      }
    }
  };

  if (!Object.prototype.hasOwnProperty.call(workflow, 'permissions')) {
    failures.push(`${file}: top-level workflow permissions are required`);
  } else {
    validatePermissions(workflow.permissions, 'permissions');
  }

  if (workflow.jobs && typeof workflow.jobs === 'object' && !Array.isArray(workflow.jobs)) {
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      if (job && typeof job === 'object' && !Array.isArray(job)
        && Object.prototype.hasOwnProperty.call(job, 'permissions')) {
        validatePermissions(job.permissions, `jobs.${jobName}.permissions`);
      }
    }
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
