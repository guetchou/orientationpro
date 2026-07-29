'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  auditDefaultFlags,
  auditWorkflowPermissions,
} = require('./audit-repository.cjs');

test('discovers every enabled-style flag and rejects non-false defaults', () => {
  const failures = auditDefaultFlags([
    'AUTH_V1_ENABLED=false',
    'LIFE_PROJECT_API_ENABLED=true',
    'FEATURE_ANALYTICS=false',
  ].join('\n'));

  assert.deepEqual(failures, [
    'backend/.env.example: LIFE_PROJECT_API_ENABLED must remain disabled by default',
  ]);
});

test('requires explicit top-level read-only workflow permissions', () => {
  assert.deepEqual(
    auditWorkflowPermissions('name: CI\npermissions:\n  contents: read\njobs: {}\n', 'ci.yml'),
    [],
  );
  assert.deepEqual(
    auditWorkflowPermissions('name: CI\npermissions: write-all\njobs: {}\n', 'ci.yml'),
    ['ci.yml: permissions must be read-only'],
  );
});

test('rejects quoted and inline write permissions at workflow and job levels', () => {
  const failures = auditWorkflowPermissions([
    'name: CI',
    'permissions: { contents: read, id-token: "write" }',
    'jobs:',
    '  build:',
    "    permissions: { contents: 'write' }",
    '    runs-on: ubuntu-latest',
  ].join('\n'), 'ci.yml');

  assert.deepEqual(failures, [
    'ci.yml: permissions.id-token:write is not read-only',
    'ci.yml: jobs.build.permissions.contents:write is not read-only',
  ]);
});

test('resolves YAML aliases before validating permissions', () => {
  const failures = auditWorkflowPermissions([
    'name: CI',
    'x-permissions: &unsafe',
    '  contents: read',
    '  id-token: write',
    'permissions: *unsafe',
    'jobs: {}',
  ].join('\n'), 'ci.yml');

  assert.deepEqual(failures, [
    'ci.yml: permissions.id-token:write is not read-only',
  ]);
});

test('rejects pull_request_target even with read-only permissions', () => {
  const failures = auditWorkflowPermissions([
    'on: pull_request_target',
    'permissions:',
    '  contents: read',
  ].join('\n'), 'ci.yml');

  assert.deepEqual(failures, [
    'ci.yml: pull_request_target requires a dedicated threat review',
  ]);
});
