'use strict';

const { createCvStore } = require('../cv/store');
const { createLifeProjectStore } = require('../life-project/store');
const { createRiasecStore } = require('../orientation/riasec/store');
const { createProfileStore } = require('../profile/store');
const { createDataRightsRouter } = require('./router');
const { createDataRightsService } = require('./service');

const createConfiguredDataRightsRouter = ({ authV1, env = process.env }) => {
  if (!authV1?.pool || !authV1?.authenticate) {
    throw new TypeError('DATA_RIGHTS_AUTH_V1_REQUIRED');
  }
  const pool = authV1.pool;
  return createDataRightsRouter({
    service: createDataRightsService({
      pool,
      profileStore: createProfileStore(pool),
      lifeProjectStore: createLifeProjectStore(pool),
      riasecStore: createRiasecStore(pool),
      cvStore: createCvStore(pool),
    }),
    authenticate: authV1.authenticate,
    cookieSecure: env.NODE_ENV === 'production',
  });
};

module.exports = { createConfiguredDataRightsRouter };
