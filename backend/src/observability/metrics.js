'use strict';

const LATENCY_BUCKETS_MS = [25, 50, 100, 250, 500, 1000, 2500, 5000];

const normalizeRoute = (route) => {
  const value = String(route || 'unknown');
  if (!value.startsWith('/') || value.length > 120) return 'unknown';
  return value
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
};

const createMetricsRegistry = () => {
  const counters = new Map();
  const latency = new Map();

  const recordRequest = ({ method, route, statusCode, durationMs }) => {
    const safeMethod = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      .includes(method) ? method : 'OTHER';
    const safeRoute = normalizeRoute(route);
    const statusClass = Number.isInteger(statusCode)
      ? `${Math.floor(statusCode / 100)}xx`
      : 'unknown';
    const key = `${safeMethod}|${safeRoute}|${statusClass}`;
    counters.set(key, (counters.get(key) || 0) + 1);

    const numericDuration = Number(durationMs);
    const bucket = LATENCY_BUCKETS_MS.find((limit) => numericDuration <= limit) || 'inf';
    const latencyKey = `${safeMethod}|${safeRoute}|${bucket}`;
    latency.set(latencyKey, (latency.get(latencyKey) || 0) + 1);
  };

  const snapshot = () => ({
    requests: Object.fromEntries(counters),
    latencyBuckets: Object.fromEntries(latency),
  });

  return { recordRequest, snapshot };
};

module.exports = { LATENCY_BUCKETS_MS, createMetricsRegistry, normalizeRoute };
