'use strict';

const SENSITIVE_KEY = /(?:authorization|cookie|password|passphrase|secret|token|document|content|response|answer|email)|^file$/i;
const BEARER_VALUE = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const MAX_DEPTH = 8;
const REDACTED = '[REDACTED]';

const redactText = (value) => String(value)
  .replace(BEARER_VALUE, `Bearer ${REDACTED}`);

const redactForLog = (value, depth = 0, seen = new WeakSet()) => {
  if (depth > MAX_DEPTH) return '[TRUNCATED]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Error) {
    return { name: value.name, message: redactText(value.message), code: value.code };
  }
  if (Buffer.isBuffer(value)) return `[BUFFER ${value.length} bytes]`;
  if (typeof value !== 'object') return `[${typeof value}]`;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((item) => redactForLog(item, depth + 1, seen));
  }
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key,
    SENSITIVE_KEY.test(key) ? REDACTED : redactForLog(entry, depth + 1, seen),
  ]));
};

module.exports = { REDACTED, redactForLog, redactText };
