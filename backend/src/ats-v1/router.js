'use strict';

const express = require('express');
const { AtsWorkflowError } = require('./workflow');
const { AtsPersistenceError } = require('./store');
const { AtsServiceError } = require('./service');

const statusFor = (error) => {
  if (error instanceof AtsWorkflowError) {
    if (['ATS_TRANSITION_NOT_ALLOWED','ATS_TERMINAL_STATE','ATS_TRANSITION_NOOP'].includes(error.code)) return 409;
    return 400;
  }
  if (error instanceof AtsPersistenceError) {
    if (error.code === 'ATS_APPLICATION_NOT_FOUND') return 404;
    if (error.code === 'ATS_RESOURCE_FORBIDDEN') return 403;
    if (error.code === 'ATS_VERSION_CONFLICT') return 409;
    if (error.code === 'ATS_VERSION_REQUIRED') return 428;
    return 400;
  }
  if (error instanceof AtsServiceError) {
    if (error.code === 'ATS_APPLICATION_NOT_FOUND') return 404;
    if (error.code === 'ATS_RESOURCE_FORBIDDEN') return 403;
    return 400;
  }
  return null;
};

const route = (handler) => async (req, res, next) => {
  try { return await handler(req, res, next); }
  catch (error) {
    const status = statusFor(error);
    if (!status) return next(error);
    return res.status(status).json({ error: { code: error.code, message: error.message, details: error.details || {} } });
  }
};

const createAtsRouter = ({ service, authenticate }) => {
  if (!service || typeof authenticate !== 'function') throw new Error('ATS service and authentication are required.');
  const router = express.Router();
  router.use(authenticate);

  router.get('/applications/:applicationId', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    application: await service.getApplication(req.auth.account, req.params.applicationId),
  })));

  router.get('/applications/:applicationId/history', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    events: await service.listHistory(req.auth.account, req.params.applicationId),
  })));

  router.post('/applications/:applicationId/transitions', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    ...(await service.transition(req.auth.account, req.params.applicationId, req.body || {})),
  })));

  return router;
};

module.exports = { createAtsRouter, statusFor };
