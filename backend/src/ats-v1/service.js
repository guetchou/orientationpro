'use strict';

const { AtsPersistenceError } = require('./store');

class AtsServiceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsServiceError';
    this.code = code;
    this.details = details;
  }
}

const createAtsService = ({ store, authorizer }) => {
  if (!store || !authorizer) throw new Error('ATS store and authorizer are required.');

  const getApplication = async (account, applicationId) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    if (!await authorizer.canReadApplication({ account, application })) {
      throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS application access denied.');
    }
    return application;
  };

  const listHistory = async (account, applicationId) => {
    await getApplication(account, applicationId);
    return store.listHistory(applicationId);
  };

  const transition = async (account, applicationId, command = {}) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    const decision = await authorizer.canTransition({ account, application, to: command.to });
    if (!decision.allowed) throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS transition access denied.');
    try {
      return await store.transition({
        applicationId,
        expectedVersion: Number(command.expectedVersion),
        to: command.to,
        actorAccountId: account.id,
        actorRole: decision.actorRole,
        reason: command.reason,
        metadata: {},
        authorize: async () => true,
      });
    } catch (error) {
      if (error instanceof AtsPersistenceError) throw error;
      throw error;
    }
  };

  return Object.freeze({ getApplication, listHistory, transition });
};

module.exports = { AtsServiceError, createAtsService };
