'use strict';

const { resolveRequestId } = require('./correlation');
const { normalizeRoute } = require('./metrics');

const V1_ROUTE_TEMPLATES = Object.freeze([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/session',
  '/api/v1/profile',
  '/api/v1/profile/syntheses',
  '/api/v1/life-projects',
  '/api/v1/life-projects/:projectId',
  '/api/v1/life-projects/:projectId/orchestration',
  '/api/v1/life-projects/:projectId/progress',
  '/api/v1/life-projects/:projectId/scenarios',
  '/api/v1/life-projects/:projectId/scenarios/:scenarioId/select',
  '/api/v1/life-projects/:projectId/transitions',
  '/api/v1/life-projects/:projectId/action-plans',
  '/api/v1/orientation/riasec/instrument',
  '/api/v1/orientation/riasec/attempts',
  '/api/v1/orientation/results',
  '/api/v1/career/occupations',
  '/api/v1/career/matches/:resultId',
  '/api/v1/cv/analyses',
  '/api/v1/cv/analyses/:analysisId',
  '/api/v1/capabilities',
]);

const createHttpObservability = ({
  logger,
  metrics,
  routeTemplates = [],
  clock = () => Date.now(),
}) => {
  if (!logger || typeof logger.write !== 'function') throw new TypeError('OBSERVABILITY_LOGGER_REQUIRED');
  if (!metrics || typeof metrics.recordRequest !== 'function') throw new TypeError('OBSERVABILITY_METRICS_REQUIRED');

  const requestMiddleware = (request, response, next) => {
    const startedAt = clock();
    const requestId = resolveRequestId(request.get?.('x-request-id') || request.headers?.['x-request-id']);
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    response.once('finish', () => {
      const durationMs = Math.max(clock() - startedAt, 0);
      const route = normalizeRoute(
        request.route?.path || request.path || request.originalUrl,
        routeTemplates,
      );
      metrics.recordRequest({
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationMs,
      });
      logger.write({
        event: 'request.completed',
        requestId,
        method: request.method,
        route,
        statusCode: response.statusCode,
        durationMs,
      });
    });
    next();
  };

  const logError = ({ request, error, statusCode = 500 }) => {
    logger.write({
      event: 'request.failed',
      requestId: request?.requestId,
      method: request?.method,
      route: normalizeRoute(
        request?.route?.path || request?.path || request?.originalUrl,
        routeTemplates,
      ),
      statusCode,
      errorCode: typeof error?.code === 'string' ? error.code : error?.name || 'Error',
    });
  };

  return { requestMiddleware, logError };
};

module.exports = { V1_ROUTE_TEMPLATES, createHttpObservability };
