'use strict';

const { SAFE_ERROR_CODE } = require('../security/redaction');
const { REQUEST_ID_PATTERN } = require('./correlation');
const { normalizeRoute, normalizeRouteTemplates } = require('./metrics');

const ALLOWED_FIELDS = new Set([
  'event',
  'requestId',
  'method',
  'route',
  'statusCode',
  'durationMs',
  'errorCode',
  'version',
  'environment',
  'result',
]);
const EVENT_PATTERN = /^[a-z][a-z0-9_.]{2,63}$/;
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/;
const OBSERVABILITY_ERROR_CODE = /^(?:E[A-Z0-9_]{2,63}|[A-Z][A-Z0-9]*_[A-Z0-9_]{1,62})$/;
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const ENVIRONMENTS = new Set(['development', 'test', 'preproduction', 'production']);
const RESULTS = new Set(['success', 'failure', 'denied', 'conflict', 'limited', 'unknown']);

const sanitizeField = (key, value, routeTemplates) => {
  switch (key) {
    case 'event':
      return typeof value === 'string' && EVENT_PATTERN.test(value) ? value : undefined;
    case 'requestId':
      return typeof value === 'string' && REQUEST_ID_PATTERN.test(value) ? value : undefined;
    case 'method':
      return METHODS.has(value) ? value : undefined;
    case 'route':
      return normalizeRoute(value, routeTemplates);
    case 'statusCode':
      return Number.isInteger(value) && value >= 100 && value <= 599 ? value : undefined;
    case 'durationMs':
      return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? value
        : undefined;
    case 'errorCode':
      return typeof value === 'string'
        && SAFE_ERROR_CODE.test(value)
        && OBSERVABILITY_ERROR_CODE.test(value)
        ? value
        : undefined;
    case 'version':
      return typeof value === 'string' && VERSION_PATTERN.test(value) ? value : undefined;
    case 'environment':
      return ENVIRONMENTS.has(value) ? value : undefined;
    case 'result':
      return RESULTS.has(value) ? value : undefined;
    default:
      return undefined;
  }
};

const sanitizeEvent = (event, { routeTemplates = [] } = {}) => {
  const safeRouteTemplates = normalizeRouteTemplates(routeTemplates);
  const safe = {};
  for (const [key, value] of Object.entries(event || {})) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const sanitized = sanitizeField(key, value, safeRouteTemplates);
    if (sanitized !== undefined) safe[key] = sanitized;
  }
  return safe;
};

const createJsonLogger = ({
  write = (line) => process.stdout.write(line),
  clock = () => new Date(),
  routeTemplates = [],
} = {}) => {
  const safeRouteTemplates = normalizeRouteTemplates(routeTemplates);
  return {
    write(event) {
      const line = JSON.stringify({
        timestamp: clock().toISOString(),
        ...sanitizeEvent(event, { routeTemplates: safeRouteTemplates }),
      });
      write(`${line}\n`);
    },
  };
};

module.exports = { createJsonLogger, sanitizeEvent };
