'use strict';

const {
  LIFE_PROJECT_STATES,
  LifeProjectContractError,
  createLifeProject,
  createStateHistoryEntry,
} = require('./contracts');

const TRANSITIONS = Object.freeze({
  exploration: Object.freeze(['clarification', 'reorientation']),
  clarification: Object.freeze(['exploration', 'comparison', 'reorientation']),
  comparison: Object.freeze(['clarification', 'provisional_choice', 'reorientation']),
  provisional_choice: Object.freeze(['comparison', 'preparation', 'reorientation']),
  preparation: Object.freeze([
    'provisional_choice', 'experimentation', 'action', 'reorientation',
  ]),
  experimentation: Object.freeze(['preparation', 'action', 'reorientation']),
  action: Object.freeze(['preparation', 'follow_up', 'reorientation']),
  follow_up: Object.freeze(['action', 'confirmation', 'reorientation']),
  confirmation: Object.freeze(['reorientation']),
  reorientation: Object.freeze(['exploration', 'clarification', 'comparison']),
});

const assertKnownState = (state) => {
  if (!LIFE_PROJECT_STATES.includes(state)) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_STATE_UNKNOWN',
      `Unknown life-project state: ${state}`,
      { state },
    );
  }
};

const canTransition = (from, to) => {
  assertKnownState(from);
  assertKnownState(to);
  return TRANSITIONS[from].includes(to);
};

const transitionLifeProject = (projectInput, event = {}) => {
  const project = createLifeProject(projectInput);
  const to = event.to;
  assertKnownState(project.state);
  assertKnownState(to);

  if (!canTransition(project.state, to)) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_TRANSITION_FORBIDDEN',
      `Transition ${project.state} -> ${to} is not allowed.`,
      { from: project.state, to, allowed: TRANSITIONS[project.state] },
    );
  }

  const historyEntry = createStateHistoryEntry({
    eventType: 'state_transition',
    eventId: event.eventId,
    from: project.state,
    to,
    occurredAt: event.occurredAt,
    actor: event.actor,
    reason: event.reason,
    provenance: event.provenance,
  });

  return createLifeProject({
    ...project,
    state: to,
    stateHistory: [...project.stateHistory, historyEntry],
    updatedAt: historyEntry.occurredAt,
  });
};

const selectActiveScenario = (projectInput, selection = {}) => {
  const project = createLifeProject(projectInput);
  const scenario = project.scenarios.find((item) => item.id === selection.scenarioId);
  if (!scenario) {
    throw new LifeProjectContractError(
      'LIFE_PROJECT_SCENARIO_NOT_FOUND',
      'The selected scenario does not exist in the project.',
      { scenarioId: selection.scenarioId },
    );
  }

  const historyEntry = createStateHistoryEntry({
    eventType: 'scenario_selection',
    eventId: selection.eventId,
    from: project.state,
    to: project.state,
    occurredAt: selection.occurredAt,
    actor: selection.actor,
    reason: selection.reason || `Active scenario selected: ${selection.scenarioId}`,
    provenance: selection.provenance,
  });

  return createLifeProject({
    ...project,
    activeScenarioId: scenario.id,
    stateHistory: [...project.stateHistory, historyEntry],
    updatedAt: historyEntry.occurredAt,
  });
};

module.exports = {
  LIFE_PROJECT_STATES,
  TRANSITIONS,
  assertKnownState,
  canTransition,
  selectActiveScenario,
  transitionLifeProject,
};
