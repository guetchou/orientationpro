'use strict';

const { randomUUID } = require('node:crypto');
const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,95}$/;

const resolveRequestId = (value, generate = randomUUID) => {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate === 'string' && REQUEST_ID_PATTERN.test(candidate)) {
    return candidate;
  }
  return generate();
};

module.exports = { REQUEST_ID_PATTERN, resolveRequestId };
