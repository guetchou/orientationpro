'use strict';

const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const EMAIL_VALUE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const COOKIE_HEADER = /\b(Set-Cookie|Cookie):[^\r\n]*/gi;
const LABELED_SECRET = /\b(password|passphrase|secret|token|document|content|response|answer)\s*[:=]\s*[^\s,;]+/gi;
const MAX_DEPTH = 8;
const REDACTED = '[REDACTED]';
const SAFE_ERROR_NAMES = new Set([
  'AggregateError',
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
]);
const SAFE_ERROR_CODE = /^[A-Z][A-Z0-9_]{1,63}$/;
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
  const valueType = typeof value;
  if (depth === 0 && ['string', 'number', 'boolean', 'bigint'].includes(valueType)) {
    return REDACTED;
  }
  if (valueType === 'string') return redactText(value);
  if (valueType === 'number' || valueType === 'boolean') return value;
  if (valueType === 'bigint') return value.toString();
  if (value instanceof Error) {
    return {
      name: SAFE_ERROR_NAMES.has(value.name) ? value.name : 'Error',
      message: redactText(value.message),
      code: value.code === undefined
        ? undefined
        : (typeof value.code === 'string' && SAFE_ERROR_CODE.test(value.code)
          ? value.code
          : REDACTED),
    };
  }
  if (Buffer.isBuffer(value)) return `[BUFFER ${value.length} bytes]`;
  if (typeof value !== 'object') return `[${typeof value}]`;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return `[ARRAY ${value.length} items omitted]`;

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
  SAFE_ERROR_CODE,
  SAFE_ERROR_NAMES,
  SAFE_LOG_KEYS,
  redactForLog,
  redactText,
};
