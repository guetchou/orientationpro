'use strict';

const { createAtsStore } = require('./store');
const { createJobStore } = require('./job-store');
const { createAtsAuthorizer } = require('./authorization');
const { createAtsService } = require('./service');
const { createAtsRouter } = require('./router');

const createConfiguredAtsRouter = ({ pool, authenticate }) => {
  if (!pool || typeof authenticate !== 'function') {
    throw new Error('A MySQL pool and an authenticate middleware are required for the ATS V1 router.');
  }
  const store = createAtsStore(pool);
  const jobStore = createJobStore(pool);
  const authorizer = createAtsAuthorizer(pool);
  const service = createAtsService({ store, jobStore, authorizer, pool });
  return createAtsRouter({ service, authenticate });
};

module.exports = { createConfiguredAtsRouter };
