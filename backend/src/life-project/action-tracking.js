'use strict';

const { deepFreeze } = require('./contracts');

const ACTION_TRACKING_VERSION = 'makoki-life-project-action-tracking-v1';
const ACTION_STATUSES = Object.freeze([
  'planned', 'in_progress', 'completed', 'blocked', 'cancelled',
]);
const ACTION_TRANSITIONS = Object.freeze({
  planned: Object.freeze(['in_progress', 'completed', 'blocked', 'cancelled']),
  in_progress: Object.freeze(['planned', 'completed', 'blocked', 'cancelled']),
  completed: Object.freeze(['planned', 'in_progress']),
  blocked: Object.freeze(['planned', 'in_progress', 'cancelled']),
  cancelled: Object.freeze(['planned']),
});

class ActionTrackingError extends TypeError {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ActionTrackingError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const requiredString = (value, field) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ActionTrackingError(
      'ACTION_TRACKING_FIELD_REQUIRED',
      `${field} must be a non-empty string.`,
      { field },
    );
  }
  return value.trim();
};

const optionalString = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  return requiredString(value, field);
};

const isoTimestamp = (value, field) => {
  const text = requiredString(value, field);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw new ActionTrackingError(
      'ACTION_TRACKING_TIMESTAMP_INVALID',
      `${field} must be an ISO-8601 timestamp.`,
      { field },
    );
  }
  return date.toISOString();
};

const status = (value, field) => {
  const normalized = requiredString(value, field);
  if (!ACTION_STATUSES.includes(normalized)) {
    throw new ActionTrackingError(
      'ACTION_TRACKING_STATUS_INVALID',
      `${field} is invalid.`,
      { field, value: normalized, allowed: ACTION_STATUSES },
    );
  }
  return normalized;
};

const position = (value) => {
  const normalized = Number(value ?? 0);
  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new ActionTrackingError(
      'ACTION_TRACKING_POSITION_INVALID',
      'position must be a non-negative integer.',
      { position: value },
    );
  }
  return normalized;
};

const createActionStatusEvent = (input = {}) => deepFreeze({
  eventId: requiredString(input.eventId, 'statusHistory.eventId'),
  from: input.from === null ? null : status(input.from, 'statusHistory.from'),
  to: status(input.to, 'statusHistory.to'),
  occurredAt: isoTimestamp(input.occurredAt, 'statusHistory.occurredAt'),
  actor: {
    kind: requiredString(input.actor?.kind, 'statusHistory.actor.kind'),
    id: optionalString(input.actor?.id, 'statusHistory.actor.id'),
  },
  reason: optionalString(input.reason, 'statusHistory.reason'),
});

const assertChronology = (history) => {
  for (let index = 1; index < history.length; index += 1) {
    if (Date.parse(history[index].occurredAt) < Date.parse(history[index - 1].occurredAt)) {
      throw new ActionTrackingError(
        'ACTION_TRACKING_HISTORY_ORDER_INVALID',
        'Action status history must remain chronological.',
        { index, eventId: history[index].eventId },
      );
    }
    if (history[index].from !== history[index - 1].to) {
      throw new ActionTrackingError(
        'ACTION_TRACKING_HISTORY_CHAIN_INVALID',
        'Action status history must form a continuous transition chain.',
        { index, eventId: history[index].eventId },
      );
    }
  }
};

const createActionTrackingRecord = (input = {}) => {
  const history = Array.isArray(input.statusHistory)
    ? input.statusHistory.map(createActionStatusEvent)
    : [];
  const ids = history.map((entry) => entry.eventId);
  if (new Set(ids).size !== ids.length) {
    throw new ActionTrackingError(
      'ACTION_TRACKING_DUPLICATE_EVENT',
      'Action status history contains duplicate event ids.',
    );
  }
  assertChronology(history);
  return deepFreeze({
    schemaVersion: ACTION_TRACKING_VERSION,
    projectId: requiredString(input.projectId, 'projectId'),
    planId: requiredString(input.planId, 'planId'),
    actionId: requiredString(input.actionId, 'actionId'),
    position: position(input.position),
    statusHistory: history,
    createdAt: isoTimestamp(input.createdAt, 'createdAt'),
    updatedAt: isoTimestamp(input.updatedAt || input.createdAt, 'updatedAt'),
  });
};

const canTransitionAction = (from, to) => {
  const current = status(from, 'from');
  const destination = status(to, 'to');
  return ACTION_TRANSITIONS[current].includes(destination);
};

const transitionActionTracking = (recordInput, transition = {}) => {
  const record = createActionTrackingRecord(recordInput);
  const current = record.statusHistory.at(-1)?.to ?? null;
  const destination = status(transition.to, 'to');
  if (current !== null && current !== destination && !canTransitionAction(current, destination)) {
    throw new ActionTrackingError(
      'ACTION_TRACKING_TRANSITION_FORBIDDEN',
      `Action transition ${current} -> ${destination} is not allowed.`,
      { from: current, to: destination, allowed: ACTION_TRANSITIONS[current] },
    );
  }
  if (record.statusHistory.some((entry) => entry.eventId === transition.eventId)) {
    const existing = record.statusHistory.find((entry) => entry.eventId === transition.eventId);
    if (existing.to !== destination) {
      throw new ActionTrackingError(
        'ACTION_TRACKING_COMMAND_CONFLICT',
        'The action command id was already used for a different status.',
        { eventId: transition.eventId },
      );
    }
    return record;
  }
  const event = createActionStatusEvent({
    eventId: transition.eventId,
    from: current,
    to: destination,
    occurredAt: transition.occurredAt,
    actor: transition.actor,
    reason: transition.reason,
  });
  return createActionTrackingRecord({
    ...record,
    statusHistory: [...record.statusHistory, event],
    updatedAt: event.occurredAt,
  });
};

const summarizeActionProgress = ({ project, trackingRecords = [] } = {}) => {
  const tracking = new Map(trackingRecords.map((record) => [record.actionId, record]));
  const rows = project.actionPlans.flatMap((plan) => plan.items.map((item, index) => {
    const record = tracking.get(item.id);
    return {
      planId: plan.id,
      actionId: item.id,
      title: item.title,
      status: item.status,
      dueAt: item.dueAt,
      position: record?.position ?? index,
      blockingReasons: item.blockingReasons,
      evidenceIds: item.evidenceIds,
    };
  })).sort((left, right) => (
    left.position - right.position
    || String(left.dueAt || '').localeCompare(String(right.dueAt || ''))
    || left.actionId.localeCompare(right.actionId)
  ));

  const counts = Object.fromEntries(ACTION_STATUSES.map((entry) => [
    entry,
    rows.filter((row) => row.status === entry).length,
  ]));
  const state = rows.length === 0
    ? 'not_started'
    : counts.blocked > 0
      ? 'blocked'
      : counts.completed === rows.length
        ? 'completed'
        : counts.in_progress > 0
          ? 'underway'
          : 'planned';

  return deepFreeze({
    schemaVersion: ACTION_TRACKING_VERSION,
    projectId: project.id,
    state,
    counts,
    nextActions: rows.filter((row) => ['planned', 'in_progress', 'blocked'].includes(row.status)),
    completedActions: rows.filter((row) => row.status === 'completed'),
  });
};

module.exports = {
  ACTION_STATUSES,
  ACTION_TRACKING_VERSION,
  ACTION_TRANSITIONS,
  ActionTrackingError,
  canTransitionAction,
  createActionStatusEvent,
  createActionTrackingRecord,
  summarizeActionProgress,
  transitionActionTracking,
};
