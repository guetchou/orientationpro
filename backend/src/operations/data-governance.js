'use strict';

const crypto = require('node:crypto');

const TELEMETRY_CLASSES = Object.freeze({
  essential: new Set([
    'request.failed',
    'backup.failed',
    'restore.failed',
    'resume.failed',
    'version.conflict',
  ]),
  consentRequired: new Set([
    'journey.started',
    'journey.completed',
    'action.created',
    'action.completed',
    'journey.blocked',
    'journey.reoriented',
  ]),
});

const classifyTelemetry = (eventName) => {
  if (TELEMETRY_CLASSES.essential.has(eventName)) return 'essential';
  if (TELEMETRY_CLASSES.consentRequired.has(eventName)) return 'consent_required';
  return 'forbidden';
};

const minimizeTelemetry = (event) => {
  const classification = classifyTelemetry(event?.name);
  if (classification === 'forbidden') {
    throw new Error('TELEMETRY_EVENT_FORBIDDEN');
  }
  return {
    name: event.name,
    classification,
    occurredAt: new Date(event.occurredAt).toISOString(),
    cohort: typeof event.cohort === 'string' ? event.cohort.slice(0, 32) : undefined,
    result: ['success', 'failure', 'blocked', 'cancelled'].includes(event.result)
      ? event.result
      : undefined,
  };
};

const pseudonymizeAccountId = ({ accountId, salt }) => {
  if (!accountId || typeof salt !== 'string' || salt.length < 32) {
    throw new Error('PSEUDONYMIZATION_INPUT_INVALID');
  }
  return crypto.createHmac('sha256', salt).update(String(accountId)).digest('hex');
};

const buildPortableExport = ({ account, profile, lifeProjects = [], results = [] }) => ({
  schemaVersion: 'makoki.portable-export.v1',
  exportedAt: new Date().toISOString(),
  account: {
    id: account.id,
    status: account.status,
    roles: [...(account.roles || [])],
  },
  profile: structuredClone(profile || {}),
  lifeProjects: structuredClone(lifeProjects),
  orientationResults: structuredClone(results),
});

module.exports = {
  TELEMETRY_CLASSES,
  buildPortableExport,
  classifyTelemetry,
  minimizeTelemetry,
  pseudonymizeAccountId,
};
