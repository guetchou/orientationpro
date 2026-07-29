'use strict';

const EVENT_CATALOG_VERSION = 'makoki.telemetry-events.v1';
const TELEMETRY_NOTICE_VERSION = 'makoki.telemetry-notice.2026-07-29.v1';
const event = (classification, unit, results) => Object.freeze({
  classification, unit, results: Object.freeze(results),
});
const EVENT_CATALOG = Object.freeze({
  'request.failed': event('essential', 'event', ['failure']),
  'backup.failed': event('essential', 'event', ['failure']),
  'restore.failed': event('essential', 'event', ['failure']),
  'resume.failed': event('essential', 'event', ['failure']),
  'version.conflict': event('essential', 'event', ['failure']),
  'journey.started': event('consent_required', 'participant', ['started']),
  'journey.completed': event('consent_required', 'participant', ['completed']),
  'journey.resumed': event('consent_required', 'participant', ['resumed']),
  'action.created': event('consent_required', 'participant', ['created']),
  'action.completed': event('consent_required', 'participant', ['completed']),
  'journey.blocked': event('consent_required', 'participant', ['blocked']),
  'journey.reoriented': event('consent_required', 'participant', ['reoriented']),
  'human.support.requested': event('consent_required', 'participant', ['requested']),
  'human.correction.recorded': event('consent_required', 'participant', ['recorded']),
});

module.exports = { EVENT_CATALOG, EVENT_CATALOG_VERSION, TELEMETRY_NOTICE_VERSION };
