const path = require('node:path');

const CV_MAX_FILE_SIZE = 5 * 1024 * 1024;
const PRIVILEGED_CV_ROLES = new Set(['admin', 'super_admin', 'superadmin']);
const ALLOWED_CV_TYPES = new Map([
  ['.pdf', 'application/pdf'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
]);

class CvAccessError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'CvAccessError';
    this.statusCode = statusCode;
  }
}

function parsePositiveInteger(value, fieldName, { optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return null;
    throw new CvAccessError(`${fieldName} is required`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new CvAccessError(`${fieldName} must be a positive integer`);
  }
  return parsed;
}

function getAuthenticatedUserId(user) {
  const value = user?.userId ?? user?.id ?? user?.sub;
  try {
    return parsePositiveInteger(value, 'authenticated user');
  } catch {
    throw new CvAccessError('Authenticated user identifier is invalid', 401);
  }
}

function isPrivilegedCvRole(user) {
  return PRIVILEGED_CV_ROLES.has(user?.role);
}

function resolveCvAccessScope(user, requested = {}) {
  const authenticatedUserId = getAuthenticatedUserId(user);
  const privileged = isPrivilegedCvRole(user);

  if (!privileged) {
    return { privileged: false, userId: authenticatedUserId, candidateId: null };
  }

  return {
    privileged: true,
    userId: parsePositiveInteger(requested.user_id, 'user_id', { optional: true }),
    candidateId: parsePositiveInteger(requested.candidate_id, 'candidate_id', { optional: true }),
  };
}

function isAllowedCvFile(file) {
  if (!file?.originalname || !file?.mimetype) return false;
  if (path.basename(file.originalname) !== file.originalname) return false;

  const extension = path.extname(file.originalname).toLowerCase();
  return ALLOWED_CV_TYPES.get(extension) === file.mimetype;
}

function matchesCvFileSignature(buffer, mimeType) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 5) return false;

  if (mimeType === 'application/pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return buffer[0] === 0x50
      && buffer[1] === 0x4b
      && [0x03, 0x05, 0x07].includes(buffer[2])
      && [0x04, 0x06, 0x08].includes(buffer[3]);
  }

  return false;
}

module.exports = {
  CV_MAX_FILE_SIZE,
  CvAccessError,
  getAuthenticatedUserId,
  isPrivilegedCvRole,
  resolveCvAccessScope,
  isAllowedCvFile,
  matchesCvFileSignature,
  parsePositiveInteger,
};
