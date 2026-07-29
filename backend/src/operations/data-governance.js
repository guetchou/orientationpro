'use strict';

const crypto = require('node:crypto');
const { EVENT_CATALOG, EVENT_CATALOG_VERSION, TELEMETRY_NOTICE_VERSION } = require('./event-catalog');

const validDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('DATA_GOVERNANCE_DATE_INVALID');
  return date.toISOString();
};

const classifyTelemetry = (eventName) => EVENT_CATALOG[eventName]?.classification || 'forbidden';

const createConsentLedger = ({ accountId, noticeVersion, eventCatalogVersion, decidedAt, eventId }) => {
  if (!accountId || noticeVersion !== TELEMETRY_NOTICE_VERSION
    || eventCatalogVersion !== EVENT_CATALOG_VERSION || !eventId) {
    throw new Error('TELEMETRY_CONSENT_INPUT_INVALID');
  }
  return Object.freeze({
    schemaVersion: 'makoki.telemetry-consent.v1',
    consentId: crypto.randomUUID(),
    accountId: String(accountId),
    noticeVersion,
    eventCatalogVersion,
    purpose: 'service_impact_measurement',
    revision: 1,
    status: 'granted',
    events: Object.freeze([Object.freeze({
      eventId: String(eventId), decision: 'granted', occurredAt: validDate(decidedAt),
    })]),
  });
};

const appendConsentDecision = (ledger, {
  accountId, expectedRevision, decision, occurredAt, eventId,
}) => {
  if (!ledger || accountId !== ledger.accountId || expectedRevision !== ledger.revision
    || !['granted', 'revoked'].includes(decision) || !eventId) {
    throw new Error('TELEMETRY_CONSENT_CONFLICT');
  }
  if (ledger.noticeVersion !== TELEMETRY_NOTICE_VERSION
    || ledger.eventCatalogVersion !== EVENT_CATALOG_VERSION) {
    throw new Error('TELEMETRY_CONSENT_VERSION_STALE');
  }
  if (ledger.events.some((event) => event.eventId === eventId)) {
    throw new Error('TELEMETRY_CONSENT_EVENT_REPLAYED');
  }
  const timestamp = validDate(occurredAt);
  if (timestamp <= ledger.events.at(-1).occurredAt) {
    throw new Error('TELEMETRY_CONSENT_ORDER_INVALID');
  }
  return Object.freeze({
    ...ledger,
    revision: ledger.revision + 1,
    status: decision,
    events: Object.freeze([...ledger.events, Object.freeze({
      eventId: String(eventId), decision, occurredAt: timestamp,
    })]),
  });
};

const assertActiveConsent = ({ consent, accountId }) => {
  if (!consent || consent.accountId !== accountId || consent.status !== 'granted') {
    throw new Error('TELEMETRY_CONSENT_REQUIRED');
  }
  if (consent.noticeVersion !== TELEMETRY_NOTICE_VERSION
    || consent.eventCatalogVersion !== EVENT_CATALOG_VERSION) {
    throw new Error('TELEMETRY_CONSENT_VERSION_STALE');
  }
};

const minimizeTelemetry = (event, { consent } = {}) => {
  const definition = EVENT_CATALOG[event?.name];
  if (!definition) throw new Error('TELEMETRY_EVENT_FORBIDDEN');
  if (definition.classification === 'consent_required') {
    assertActiveConsent({ consent, accountId: event.accountId });
  }
  return {
    schemaVersion: EVENT_CATALOG_VERSION,
    name: event.name,
    classification: definition.classification,
    unit: definition.unit,
    occurredAt: validDate(event.occurredAt),
    participantId: typeof event.participantId === 'string' ? event.participantId.slice(0, 64) : undefined,
    result: definition.results.includes(event.result) ? event.result : undefined,
    source: {
      system: 'makoki-api',
      schemaVersion: typeof event.source?.schemaVersion === 'string'
        ? event.source.schemaVersion.slice(0, 64)
        : undefined,
      recordVersion: Number.isInteger(event.source?.recordVersion)
        ? event.source.recordVersion
        : undefined,
    },
  };
};

const pseudonymizeAccountId = ({ accountId, salt }) => {
  if (!accountId || typeof salt !== 'string' || salt.length < 32) {
    throw new Error('PSEUDONYMIZATION_INPUT_INVALID');
  }
  return crypto.createHmac('sha256', salt).update(String(accountId)).digest('hex');
};

const scalar = (value, max = 160) => (typeof value === 'string' ? value.slice(0, max) : null);
const stringList = (value, maxItems = 50) => (
  Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(0, maxItems) : []
);
const serializeProfile = (profile) => ({
  id: scalar(profile?.id, 64),
  preferredName: scalar(profile?.preferredName, 120),
  skills: stringList(profile?.skills),
});
const serializeLifeProject = (project) => ({
  id: scalar(project?.id, 64),
  title: scalar(project?.title, 160),
  purpose: scalar(project?.purpose, 500),
  state: scalar(project?.state, 40),
  activeScenarioId: scalar(project?.activeScenarioId, 64),
  scenarios: Array.isArray(project?.scenarios) ? project.scenarios.slice(0, 50).map((scenario) => ({
    id: scalar(scenario?.id, 64),
    title: scalar(scenario?.title, 160),
    status: scalar(scenario?.status, 32),
  })) : [],
  actionPlans: Array.isArray(project?.actionPlans) ? project.actionPlans.slice(0, 20).map((plan) => ({
    id: scalar(plan?.id, 64),
    title: scalar(plan?.title, 160),
    actions: Array.isArray(plan?.actions) ? plan.actions.slice(0, 100).map((action) => ({
      id: scalar(action?.id, 64),
      title: scalar(action?.title, 160),
      status: scalar(action?.status, 32),
      dueAt: action?.dueAt ? validDate(action.dueAt) : null,
    })) : [],
  })) : [],
});
const serializeOrientationResult = (result) => ({
  id: scalar(result?.id, 64),
  instrumentId: scalar(result?.instrumentId, 80),
  algorithmVersion: scalar(result?.algorithmVersion, 80),
  completedAt: result?.completedAt ? validDate(result.completedAt) : null,
});
const assertOwned = (requesterAccountId, entity, entityType) => {
  if (entity && entity.ownerAccountId !== requesterAccountId) {
    throw new Error(`PORTABLE_EXPORT_${entityType}_OWNERSHIP_INVALID`);
  }
};

const buildPortableExport = ({
  requesterAccountId, account, profile, lifeProjects = [], results = [], clock = () => new Date(),
}) => {
  if (!requesterAccountId || account?.id !== requesterAccountId) {
    throw new Error('PORTABLE_EXPORT_ACCOUNT_OWNERSHIP_INVALID');
  }
  assertOwned(requesterAccountId, profile, 'PROFILE');
  lifeProjects.forEach((project) => assertOwned(requesterAccountId, project, 'PROJECT'));
  results.forEach((result) => assertOwned(requesterAccountId, result, 'RESULT'));
  return {
    schemaVersion: 'makoki.portable-export.v2',
    exportedAt: validDate(clock()),
    account: {
      id: String(account.id),
      status: scalar(account.status, 32),
      roles: stringList(account.roles, 20),
    },
    profile: profile ? serializeProfile(profile) : null,
    lifeProjects: lifeProjects.map(serializeLifeProject),
    orientationResults: results.map(serializeOrientationResult),
  };
};

module.exports = {
  appendConsentDecision,
  assertActiveConsent,
  buildPortableExport,
  classifyTelemetry,
  createConsentLedger,
  minimizeTelemetry,
  pseudonymizeAccountId,
};
