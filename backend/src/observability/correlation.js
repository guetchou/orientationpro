'use strict';

const { randomUUID } = require('node:crypto');
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveRequestId = (value, generate = randomUUID) => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === 'string' && REQUEST_ID_PATTERN.test(candidate)) {
    return candidate;
  }
  return generate();
};

module.exports = { REQUEST_ID_PATTERN, resolveRequestId };
