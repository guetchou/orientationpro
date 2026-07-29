'use strict';

const express = require('express');
const { LifeProjectContractError } = require('./contracts');
const { LifeProjectPersistenceError } = require('./store');
const { LifeProjectServiceError } = require('./service');

const parseExpectedVersion = (req) => {
  const header = req.get('if-match');
  const candidate = header
    ? header.replace(/^W\//u, '').replace(/^"|"$/gu, '')
    : req.body?.expectedVersion;
  if (candidate === undefined || candidate === null || candidate === '') {
    throw new LifeProjectServiceError(
      'LIFE_PROJECT_API_VERSION_REQUIRED',
      'If-Match or expectedVersion is required for this mutation.',
    );
  }
  return Number(candidate);
};

const errorStatus = (error) => {
  if (error instanceof LifeProjectContractError) return 400;
  if (error instanceof LifeProjectServiceError) {
    if (error.code === 'LIFE_PROJECT_NOT_FOUND'
      || error.code === 'LIFE_PROJECT_ACTION_PLAN_NOT_FOUND') return 404;
    if (error.code === 'LIFE_PROJECT_COMMAND_CONFLICT') return 409;
    if (error.code === 'LIFE_PROJECT_API_VERSION_REQUIRED') return 428;
    return 400;
  }
  if (error instanceof LifeProjectPersistenceError) {
    if (error.code === 'LIFE_PROJECT_VERSION_CONFLICT'
      || error.code === 'LIFE_PROJECT_ALREADY_EXISTS') return 409;
    if (error.code === 'LIFE_PROJECT_VERSION_REQUIRED') return 428;
    return 400;
  }
  return null;
};

const route = (handler) => async (req, res, next) => {
  try {
    return await handler(req, res, next);
  } catch (error) {
    const status = errorStatus(error);
    if (!status) return next(error);
    return res.status(status).json({
      error: {
        code: error.code || 'LIFE_PROJECT_INPUT_INVALID',
        message: error.message,
        details: error.details || {},
      },
    });
  }
};

const sendProject = (res, result, status = 200) => {
  if (result?.persistenceVersion) {
    res.set('ETag', `"${result.persistenceVersion}"`);
  }
  return res.status(status).json({
    schemaVersion: 'makoki-life-project-api-v1',
    ...result,
  });
};

const createLifeProjectRouter = ({ service, authenticate } = {}) => {
  if (!service || typeof authenticate !== 'function') {
    throw new Error('Life-project service and authentication are required.');
  }

  const router = express.Router();
  router.use(authenticate);

  router.get('/', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-life-project-api-v1',
    projects: await service.list(req.auth.account.id),
  })));

  router.post('/', route(async (req, res) => sendProject(
    res,
    await service.create(req.auth.account.id, req.body || {}),
    201,
  )));

  router.get('/:projectId', route(async (req, res) => sendProject(
    res,
    await service.get(req.auth.account.id, req.params.projectId),
  )));

  router.post('/:projectId/scenarios', route(async (req, res) => sendProject(
    res,
    await service.addScenario(
      req.auth.account.id,
      req.params.projectId,
      req.body || {},
      parseExpectedVersion(req),
    ),
    201,
  )));

  router.post('/:projectId/scenarios/:scenarioId/select', route(async (req, res) => sendProject(
    res,
    await service.selectScenario(
      req.auth.account.id,
      req.params.projectId,
      req.params.scenarioId,
      req.body || {},
      parseExpectedVersion(req),
    ),
  )));

  router.post('/:projectId/transitions', route(async (req, res) => sendProject(
    res,
    await service.transition(
      req.auth.account.id,
      req.params.projectId,
      req.body || {},
      parseExpectedVersion(req),
    ),
  )));

  router.post('/:projectId/action-plans', route(async (req, res) => sendProject(
    res,
    await service.createActionPlan(
      req.auth.account.id,
      req.params.projectId,
      req.body || {},
      parseExpectedVersion(req),
    ),
    201,
  )));

  router.put('/:projectId/action-plans/:planId', route(async (req, res) => sendProject(
    res,
    await service.replaceActionPlan(
      req.auth.account.id,
      req.params.projectId,
      req.params.planId,
      req.body || {},
      parseExpectedVersion(req),
    ),
  )));

  return router;
};

module.exports = {
  createLifeProjectRouter,
  parseExpectedVersion,
};