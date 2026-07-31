'use strict';

const express = require('express');
const { createCapabilityRegistry } = require('../capabilities/registry');
const { LifeProjectContractError } = require('./contracts');
const { LifeDiagnosticContractError } = require('./diagnostic-contracts');
const { LifeRecommendationContractError } = require('./recommendation-contracts');
const { ActionTrackingError } = require('./action-tracking');
const { ActionTrackingPersistenceError } = require('./action-tracking-store');
const {
  LifeProjectOrchestrationError,
  createAdaptiveOrchestration,
} = require('./orchestration');
const { LifeProjectPersistenceError } = require('./store');
const { LifeProjectServiceError } = require('./service');

const RIASEC_DIMENSIONS = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C']);

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

const parseModuleIds = (value) => String(value || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

const normalizedRiasecScore = (result, dimension) => {
  const value = Number(result?.scores?.[dimension]?.normalized);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
};

const verifiedRiasecProfile = (result) => ({
  resultId: result.id,
  attemptId: result.attemptId,
  instrumentId: result.instrumentId,
  algorithmVersion: result.algorithmVersion,
  primaryCode: result.primaryCode || null,
  displayCode: result.displayCode,
  scores: Object.fromEntries(RIASEC_DIMENSIONS.map((dimension) => [
    dimension,
    normalizedRiasecScore(result, dimension),
  ])),
  ranking: Array.isArray(result?.ranking?.ordered)
    ? result.ranking.ordered
      .filter((entry) => RIASEC_DIMENSIONS.includes(entry.dimension))
      .map((entry) => ({
        dimension: entry.dimension,
        score: Number.isFinite(Number(entry.score)) ? Number(entry.score) : 0,
      }))
    : [],
  completedAt: new Date(result.createdAt).toISOString(),
});

const errorStatus = (error) => {
  if (error instanceof LifeProjectContractError
    || error instanceof LifeDiagnosticContractError
    || error instanceof LifeRecommendationContractError
    || error instanceof ActionTrackingError
    || error instanceof LifeProjectOrchestrationError) return 400;
  if (error instanceof LifeProjectServiceError) {
    if (error.code === 'LIFE_PROJECT_NOT_FOUND'
      || error.code === 'LIFE_PROJECT_ACTION_PLAN_NOT_FOUND'
      || error.code === 'LIFE_PROJECT_ACTION_NOT_FOUND'
      || error.code === 'LIFE_PROJECT_RIASEC_RESULT_NOT_FOUND') return 404;
    if (error.code === 'LIFE_PROJECT_COMMAND_CONFLICT'
      || error.code === 'LIFE_PROJECT_GENERATED_SCENARIO_CONFLICT') return 409;
    if (error.code === 'LIFE_PROJECT_API_VERSION_REQUIRED') return 428;
    if (error.code === 'ACTION_TRACKING_UNAVAILABLE'
      || error.code === 'LIFE_PROJECT_RIASEC_VERIFICATION_UNAVAILABLE') return 503;
    return 400;
  }
  if (error instanceof LifeProjectPersistenceError) {
    if (error.code === 'LIFE_PROJECT_VERSION_CONFLICT'
      || error.code === 'LIFE_PROJECT_ALREADY_EXISTS') return 409;
    if (error.code === 'LIFE_PROJECT_VERSION_REQUIRED') return 428;
    return 400;
  }
  if (error instanceof ActionTrackingPersistenceError) {
    if (error.code === 'ACTION_TRACKING_PROJECT_NOT_FOUND') return 404;
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

const createLifeProjectRouter = ({
  service,
  authenticate,
  riasecStore = null,
  capabilityRegistry = createCapabilityRegistry(process.env),
  clock = () => new Date(),
} = {}) => {
  if (!service || typeof authenticate !== 'function') {
    throw new Error('Life-project service and authentication are required.');
  }

  const resolveDiagnosticInput = async (accountId, projectId, input = {}) => {
    const sanitized = { ...input };
    delete sanitized.riasecResultId;
    delete sanitized.riasecProfile;

    const resultId = input.riasecResultId || input.riasecProfile?.resultId || null;
    if (resultId) {
      if (!riasecStore || typeof riasecStore.getResult !== 'function') {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_RIASEC_VERIFICATION_UNAVAILABLE',
          'The RIASEC result cannot be verified in this environment.',
        );
      }
      const result = await riasecStore.getResult({ accountId, resultId });
      if (!result || result.resultType !== 'riasec') {
        throw new LifeProjectServiceError(
          'LIFE_PROJECT_RIASEC_RESULT_NOT_FOUND',
          'The RIASEC result does not exist for this account.',
          { resultId },
        );
      }
      return {
        ...sanitized,
        riasecProfile: verifiedRiasecProfile(result),
      };
    }

    const loaded = await service.get(accountId, projectId);
    const existingProfile = loaded.project.diagnostic?.riasecProfile || null;
    return existingProfile
      ? { ...sanitized, riasecProfile: existingProfile }
      : sanitized;
  };

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

  router.put('/:projectId/diagnostic', route(async (req, res) => sendProject(
    res,
    await service.replaceDiagnostic(
      req.auth.account.id,
      req.params.projectId,
      await resolveDiagnosticInput(
        req.auth.account.id,
        req.params.projectId,
        req.body || {},
      ),
      parseExpectedVersion(req),
    ),
  )));

  router.post('/:projectId/recommendations', route(async (req, res) => sendProject(
    res,
    await service.generateRecommendations(
      req.auth.account.id,
      req.params.projectId,
      req.body || {},
      parseExpectedVersion(req),
    ),
  )));

  router.get('/:projectId/orchestration', route(async (req, res) => {
    const loaded = await service.get(req.auth.account.id, req.params.projectId);
    const orchestration = createAdaptiveOrchestration({
      project: loaded.project,
      capabilityRegistry,
      generatedAt: clock().toISOString(),
      completedModuleIds: parseModuleIds(req.query.completed),
      skippedModuleIds: parseModuleIds(req.query.skipped),
    });
    res.set('ETag', `"${loaded.persistenceVersion}"`);
    return res.status(200).json({
      schemaVersion: 'makoki-life-project-orchestration-api-v1',
      persistenceVersion: loaded.persistenceVersion,
      orchestration,
    });
  }));

  router.get('/:projectId/progress', route(async (req, res) => {
    const result = await service.getProgress(req.auth.account.id, req.params.projectId);
    if (result?.persistenceVersion) res.set('ETag', `"${result.persistenceVersion}"`);
    return res.status(200).json(result);
  }));

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

  router.patch('/:projectId/action-plans/:planId/actions/:actionId', route(async (req, res) => sendProject(
    res,
    await service.updateActionItem(
      req.auth.account.id,
      req.params.projectId,
      req.params.planId,
      req.params.actionId,
      req.body || {},
      parseExpectedVersion(req),
    ),
  )));

  return router;
};

module.exports = {
  createLifeProjectRouter,
  parseExpectedVersion,
  verifiedRiasecProfile,
};
