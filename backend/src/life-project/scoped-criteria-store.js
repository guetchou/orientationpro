'use strict';

const crypto = require('node:crypto');

const GENERATED_PREFIX = 'diagnostic-priority-';
const SCOPED_PREFIX = 'diagnostic-priority-v2-';

const scopedCriterionId = (projectId, criterionId) => {
  if (criterionId.startsWith(SCOPED_PREFIX)) return criterionId;
  if (!criterionId.startsWith(GENERATED_PREFIX)) return criterionId;

  const priorityId = criterionId.slice(GENERATED_PREFIX.length);
  const digest = crypto
    .createHash('sha256')
    .update(projectId)
    .update('\0')
    .update(priorityId)
    .digest('hex')
    .slice(0, 32);

  return `${SCOPED_PREFIX}${digest}`;
};

const scopeDiagnosticCriteria = (project) => {
  const criteria = project.criteria.map((criterion) => ({
    ...criterion,
    id: scopedCriterionId(project.id, criterion.id),
  }));

  if (new Set(criteria.map((criterion) => criterion.id)).size !== criteria.length) {
    const error = new Error('Life-project criterion identifiers must remain unique after project scoping.');
    error.code = 'LIFE_PROJECT_CRITERION_ID_COLLISION';
    throw error;
  }

  return { ...project, criteria };
};

const createScopedCriteriaStore = (store) => {
  if (!store
    || typeof store.create !== 'function'
    || typeof store.get !== 'function'
    || typeof store.list !== 'function'
    || typeof store.save !== 'function') {
    throw new TypeError('A complete life-project store is required.');
  }

  return {
    create(project) {
      return store.create(scopeDiagnosticCriteria(project));
    },
    get(accountId, projectId) {
      return store.get(accountId, projectId);
    },
    list(accountId) {
      return store.list(accountId);
    },
    save(project, options) {
      return store.save(scopeDiagnosticCriteria(project), options);
    },
  };
};

module.exports = {
  GENERATED_PREFIX,
  SCOPED_PREFIX,
  createScopedCriteriaStore,
  scopeDiagnosticCriteria,
  scopedCriterionId,
};
