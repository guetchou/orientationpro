'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  SCOPED_PREFIX,
  createScopedCriteriaStore,
  scopeDiagnosticCriteria,
} = require('../src/life-project/scoped-criteria-store');

const project = (id, criteria) => ({ id, criteria });

test('generated diagnostic criterion ids are deterministic and isolated by project', () => {
  const first = scopeDiagnosticCriteria(project('project-a', [
    { id: 'diagnostic-priority-interest', label: 'Intérêt' },
    { id: 'manual-criterion', label: 'Manuel' },
  ]));
  const repeated = scopeDiagnosticCriteria(first);
  const second = scopeDiagnosticCriteria(project('project-b', [
    { id: 'diagnostic-priority-interest', label: 'Intérêt' },
  ]));

  assert.match(first.criteria[0].id, new RegExp(`^${SCOPED_PREFIX}[a-f0-9]{32}$`));
  assert.equal(first.criteria[0].id, repeated.criteria[0].id);
  assert.notEqual(first.criteria[0].id, second.criteria[0].id);
  assert.equal(first.criteria[1].id, 'manual-criterion');
  assert.ok(first.criteria.every((criterion) => criterion.id.length <= 128));
});

test('scoped store transforms create and save without changing reads', async () => {
  const calls = [];
  const underlying = {
    async create(value) {
      calls.push(['create', value]);
      return { project: value, persistenceVersion: 1 };
    },
    async get(accountId, projectId) {
      calls.push(['get', accountId, projectId]);
      return { project: { id: projectId, criteria: [] }, persistenceVersion: 1 };
    },
    async list(accountId) {
      calls.push(['list', accountId]);
      return [];
    },
    async save(value, options) {
      calls.push(['save', value, options]);
      return { project: value, persistenceVersion: options.expectedVersion + 1 };
    },
  };
  const store = createScopedCriteriaStore(underlying);
  const input = project('project-a', [{ id: 'diagnostic-priority-cost', label: 'Coût' }]);

  const created = await store.create(input);
  const saved = await store.save(input, { expectedVersion: 1 });
  await store.get('account-a', 'project-a');
  await store.list('account-a');

  assert.match(created.project.criteria[0].id, new RegExp(`^${SCOPED_PREFIX}`));
  assert.equal(saved.persistenceVersion, 2);
  assert.deepEqual(calls.map(([name]) => name), ['create', 'save', 'get', 'list']);
});
