'use strict';

const { createAtsStore } = require('./store');
const { createJobStore } = require('./job-store');
const { createAtsAuthorizer } = require('./authorization');
const { createOrganizationStore } = require('./organization-store');
const { createEvaluationStore } = require('./evaluation-store');
const { createAtsService } = require('./service');
const { createAtsRouter } = require('./router');

const createConfiguredAtsRouter = ({ pool, authenticate }) => {
  if (!pool || typeof authenticate !== 'function') {
    throw new Error('A MySQL pool and an authenticate middleware are required for the ATS V1 router.');
  }
  const store = createAtsStore(pool);
  const jobStore = createJobStore(pool);
  const authorizer = createAtsAuthorizer(pool);
  const organizationStore = createOrganizationStore(pool);
  const evaluationStore = createEvaluationStore(pool);
  const service = createAtsService({ store, jobStore, authorizer, organizationStore, evaluationStore, pool });
  return createAtsRouter({ service, authenticate });
};

module.exports = { createConfiguredAtsRouter };
