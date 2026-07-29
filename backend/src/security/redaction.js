'use strict';

const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const COOKIE_HEADER = /\b(Set-Cookie|Cookie):[^\r\n]*/gi;
const LABELED_SECRET = /\b(password|passphrase|secret|token|document|content|response|answer)\s*[:=]\s*[^\s,;]+/gi;
const MAX_DEPTH = 8;
const REDACTED = '[REDACTED]';
const SAFE_LOG_KEYS = new Set([
  'allowed',
  'attempt',
  'code',
  'correlationId',
  'count',
  'durationMs',
  'error',
  'event',
  'level',
  'limit',
  'message',
  'metadata',
  'method',
  'name',
  'operation',
  'reason',
  'requestId',
  'route',
  'status',
  'statusCode',
  'type',
]);

const redactText = (value) => String(value)
  .replace(BEARER_VALUE, `Bearer ${REDACTED}`)
  .replace(COOKIE_HEADER, (_, header) => `${header}: ${REDACTED}`)
  .replace(LABELED_SECRET, (_, label) => `${label}=${REDACTED}`)
  .replace(EMAIL_VALUE, REDACTED);

const redactForLog = (value, depth = 0, seen = new WeakSet()) => {
  if (depth > MAX_DEPTH) return '[TRUNCATED]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return depth === 0 ? REDACTED : redactText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactText(value.message),
      code: value.code === undefined ? undefined : redactText(value.code),
    };
  }
  if (Buffer.isBuffer(value)) return `[BUFFER ${value.length} bytes]`;
  if (typeof value !== 'object') return `[${typeof value}]`;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => redactForLog(item, depth + 1, seen));
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => SAFE_LOG_KEYS.has(key))
      .map(([key, entry]) => [
        key,
        redactForLog(entry, depth + 1, seen),
      ]),
  );
};

module.exports = {
  REDACTED,
  SAFE_LOG_KEYS,
  redactForLog,
  redactText,
};
