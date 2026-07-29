'use strict';

const LATENCY_BUCKETS_MS = [25, 50, 100, 250, 500, 1000, 2500, 5000];
const MAX_ROUTE_TEMPLATES = 200;
const ROUTE_SEGMENT = /^(?:[A-Za-z0-9._~-]+|:[A-Za-z][A-Za-z0-9_]*)$/;
const METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

const normalizeRouteTemplates = (routeTemplates = []) => {
  if (!Array.isArray(routeTemplates) && !(routeTemplates instanceof Set)) {
    throw new TypeError('OBSERVABILITY_ROUTE_TEMPLATES_INVALID');
  }
  const unique = [...new Set(routeTemplates)];
  if (unique.length > MAX_ROUTE_TEMPLATES) {
    throw new RangeError('OBSERVABILITY_ROUTE_TEMPLATES_LIMIT');
  }
  for (const template of unique) {
    const segments = String(template).split('/').slice(1);
    if (template !== '/' && (
      typeof template !== 'string'
      || template.length > 120
      || !template.startsWith('/')
      || segments.some((segment) => !ROUTE_SEGMENT.test(segment))
    )) {
      throw new TypeError('OBSERVABILITY_ROUTE_TEMPLATE_INVALID');
    }
  }
  return unique;
};

const normalizeRoute = (route, routeTemplates = []) => {
  if (typeof route !== 'string') return 'unknown';
  const path = route.split(/[?#]/, 1)[0];
  if (!path.startsWith('/') || path.length > 120) return 'unknown';
  const pathSegments = path.split('/').slice(1);
  for (const template of routeTemplates) {
    const templateSegments = template.split('/').slice(1);
    if (templateSegments.length !== pathSegments.length) continue;
    const matches = templateSegments.every(
      (segment, index) => segment.startsWith(':') || segment === pathSegments[index],
    );
    if (matches) return template;
  }
  return 'unknown';
};

const createMetricsRegistry = ({ routeTemplates = [] } = {}) => {
  const safeRouteTemplates = normalizeRouteTemplates(routeTemplates);
  const counters = new Map();
  const latency = new Map();

  const recordRequest = ({ method, route, statusCode, durationMs }) => {
    const safeMethod = METHODS.has(method) ? method : 'OTHER';
    const safeRoute = normalizeRoute(route, safeRouteTemplates);
    const statusClass = Number.isInteger(statusCode) && statusCode >= 100 && statusCode <= 599
      ? `${Math.floor(statusCode / 100)}xx`
      : 'unknown';
    const key = `${safeMethod}|${safeRoute}|${statusClass}`;
    counters.set(key, (counters.get(key) || 0) + 1);

    const numericDuration = Number(durationMs);
    const bucket = Number.isFinite(numericDuration) && numericDuration >= 0
      ? (LATENCY_BUCKETS_MS.find((limit) => numericDuration <= limit) || 'inf')
      : 'unknown';
    const latencyKey = `${safeMethod}|${safeRoute}|${bucket}`;
    latency.set(latencyKey, (latency.get(latencyKey) || 0) + 1);
  };

  const snapshot = () => ({
    requests: Object.fromEntries(counters),
    latencyBuckets: Object.fromEntries(latency),
  });

  return { recordRequest, snapshot };
};

module.exports = {
  LATENCY_BUCKETS_MS,
  MAX_ROUTE_TEMPLATES,
  createMetricsRegistry,
  normalizeRoute,
  normalizeRouteTemplates,
};
