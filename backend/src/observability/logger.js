'use strict';

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
const SENSITIVE_TEXT = /(?:bearer\s+\S+|token|password|secret|cookie|authorization|document|answer|response|email)/i;

const sanitizeValue = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  if (SENSITIVE_TEXT.test(value)) return '[REDACTED]';
  return value.slice(0, 160);
};

const sanitizeEvent = (event) => {
  const safe = {};
  for (const [key, value] of Object.entries(event || {})) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) safe[key] = sanitized;
  }
  return safe;
};

const createJsonLogger = ({
  write = (line) => process.stdout.write(line),
  clock = () => new Date(),
} = {}) => ({
  write(event) {
    const line = JSON.stringify({
      timestamp: clock().toISOString(),
      ...sanitizeEvent(event),
    });
    write(`${line}\n`);
  },
});

module.exports = { createJsonLogger, sanitizeEvent };
