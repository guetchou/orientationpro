'use strict';

const { resolveRequestId } = require('./correlation');
const { normalizeRoute } = require('./metrics');

const createHttpObservability = ({ logger, metrics, clock = () => Date.now() }) => {
  if (!logger || typeof logger.write !== 'function') throw new TypeError('OBSERVABILITY_LOGGER_REQUIRED');
  if (!metrics || typeof metrics.recordRequest !== 'function') throw new TypeError('OBSERVABILITY_METRICS_REQUIRED');

  const requestMiddleware = (request, response, next) => {
    const startedAt = clock();
    const requestId = resolveRequestId(request.get?.('x-request-id') || request.headers?.['x-request-id']);
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    response.once('finish', () => {
      const durationMs = Math.max(clock() - startedAt, 0);
      const route = normalizeRoute(request.route?.path || request.path || request.originalUrl);
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
      route: normalizeRoute(request?.route?.path || request?.path || request?.originalUrl),
      statusCode,
      errorCode: typeof error?.code === 'string' ? error.code : error?.name || 'Error',
    });
  };

  return { requestMiddleware, logError };
};

module.exports = { createHttpObservability };
