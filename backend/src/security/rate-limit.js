'use strict';

const crypto = require('node:crypto');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 300;

const normalizePositiveInteger = (value, fallback, field) => {
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  if (!Number.isSafeInteger(numeric) || numeric < 1) {
    throw new TypeError(`${field}_INVALID`);
  }
  return numeric;
};

const createOpaqueKeyFactory = ({ secret = crypto.randomBytes(32), scope = 'general' } = {}) => {
  const key = Buffer.isBuffer(secret) ? secret : Buffer.from(String(secret));
  if (key.length < 32) throw new TypeError('RATE_LIMIT_SECRET_TOO_SHORT');
  return (request = {}) => {
    const accountId = request.auth?.account?.id
      || request.auth?.accountId
      || request.account?.id
      || '';
    const source = [scope, request.ip || request.socket?.remoteAddress || 'unknown', accountId].join('|');
    return crypto.createHmac('sha256', key).update(source).digest('hex');
  };
};

const createMemoryRateLimiter = ({
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
  keyGenerator = createOpaqueKeyFactory(),
  clock = () => Date.now(),
  scope = 'general',
} = {}) => {
  const normalizedWindow = normalizePositiveInteger(windowMs, DEFAULT_WINDOW_MS, 'RATE_LIMIT_WINDOW');
  const normalizedMax = normalizePositiveInteger(max, DEFAULT_MAX, 'RATE_LIMIT_MAX');
  const entries = new Map();
  let lastSweepAt = 0;

  const sweep = (now) => {
    if (now - lastSweepAt < normalizedWindow) return;
    lastSweepAt = now;
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
  };

  const middleware = (request, response, next) => {
    const now = clock();
    sweep(now);
    const key = keyGenerator(request);
    const current = entries.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + normalizedWindow }
      : current;
    entry.count += 1;
    entries.set(key, entry);

    const remaining = Math.max(normalizedMax - entry.count, 0);
    response.setHeader('RateLimit-Limit', String(normalizedMax));
    response.setHeader('RateLimit-Remaining', String(remaining));
    response.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > normalizedMax) {
      response.setHeader('Retry-After', String(Math.max(Math.ceil((entry.resetAt - now) / 1000), 1)));
      return response.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes. Réessayez plus tard.',
        scope,
      });
    }
    return next();
  };

  middleware.reset = () => entries.clear();
  middleware.snapshot = () => ({ entries: entries.size, windowMs: normalizedWindow, max: normalizedMax });
  return middleware;
};

module.exports = {
  DEFAULT_MAX,
  DEFAULT_WINDOW_MS,
  createMemoryRateLimiter,
  createOpaqueKeyFactory,
};
