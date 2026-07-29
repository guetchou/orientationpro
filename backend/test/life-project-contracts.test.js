'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  CONTRACT_VERSION,
  LIFE_PROJECT_STATES,
  LifeProjectContractError,
  canTransition,
  createActionPlan,
  createLifeProject,
  createLifeProjectScenario,
  selectActiveScenario,
  transitionLifeProject,
} = require('../src/life-project');

const at = (day) => `2026-07-${String(day).padStart(2, '0')}T08:00:00.000Z`;
const provenance = (day = 1) => ({
  sourceType: 'user_statement',
  actorId: 'account-1',
  recordedAt: at(day),
});

const scenario = (id = 'scenario-1') => createLifeProjectScenario({
  id,
  title: `Scenario ${id}`,
  optionType: 'education',
  status: 'candidate',
  uncertainty: {
    level: 'medium',
    reasons: ['Admission conditions not verified'],
  },
  provenance: provenance(),
  createdAt: at(1),
});

const project = () => createLifeProject({
  id: 'project-1',
  ownerAccountId: 'account-1',
  title: 'Construire mon projet de vie',
  state: 'exploration',
  scenarios: [scenario()],
  criteria: [],
  actionPlans: [],
  stateHistory: [],
  missingInformation: ['budget'],
  uncertainty: { level: 'medium', reasons: ['Parcours à comparer'] },
  provenance: provenance(),
  createdAt: at(1),
});

test('contracts are versioned, serializable and deeply immutable', () => {
  const value = project();
  assert.equal(value.schemaVersion, CONTRACT_VERSION);
  assert.equal(JSON.parse(JSON.stringify(value)).id, value.id);
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.scenarios), true);
  assert.equal(Object.isFrozen(value.scenarios[0].uncertainty), true);
  assert.throws(() => { value.title = 'mutated'; }, TypeError);
});

test('state machine exposes the complete v1 journey and rejects skipped transitions', () => {
  assert.deepEqual(LIFE_PROJECT_STATES, [
    'exploration', 'clarification', 'comparison', 'provisional_choice', 'preparation',
    'experimentation', 'action', 'follow_up', 'confirmation', 'reorientation',
  ]);
  assert.equal(canTransition('exploration', 'clarification'), true);
  assert.equal(canTransition('exploration', 'action'), false);
  assert.throws(
    () => transitionLifeProject(project(), {
      eventId: 'event-skip',
      to: 'action',
      occurredAt: at(2),
      actor: { kind: 'human', id: 'account-1' },
      provenance: provenance(2),
    }),
    (error) => error instanceof LifeProjectContractError
      && error.code === 'LIFE_PROJECT_TRANSITION_FORBIDDEN',
  );
});

test('allowed transitions append history without erasing the previous project', () => {
  const original = project();
  const clarified = transitionLifeProject(original, {
    eventId: 'event-1',
    to: 'clarification',
    occurredAt: at(2),
    actor: { kind: 'human', id: 'account-1' },
    reason: 'Informations initiales complétées',
    provenance: provenance(2),
  });

  assert.equal(original.state, 'exploration');
  assert.equal(original.stateHistory.length, 0);
  assert.equal(clarified.state, 'clarification');
  assert.equal(clarified.stateHistory.length, 1);
  assert.equal(clarified.stateHistory[0].eventType, 'state_transition');
  assert.equal(clarified.stateHistory[0].eventId, 'event-1');
  assert.equal(clarified.stateHistory[0].from, 'exploration');
  assert.equal(clarified.stateHistory[0].to, 'clarification');
  assert.equal(clarified.stateHistory[0].occurredAt, at(2));
  assert.deepEqual(
    clarified.stateHistory[0].actor,
    { kind: 'human', id: 'account-1' },
  );
  assert.equal(
    clarified.stateHistory[0].reason,
    'Informations initiales complétées',
  );
  assert.equal(clarified.stateHistory[0].provenance.sourceType, 'user_statement');
  assert.equal(clarified.stateHistory[0].provenance.recordedAt, at(2));
});

test('confirmation remains reversible through an explicit reorientation event', () => {
  const confirmed = createLifeProject({ ...project(), state: 'confirmation' });
  const redirected = transitionLifeProject(confirmed, {
    eventId: 'event-reorient',
    to: 'reorientation',
    occurredAt: at(3),
    actor: { kind: 'human', id: 'account-1' },
    reason: 'Le contexte ou les priorités ont changé',
    provenance: provenance(3),
  });
  assert.equal(redirected.state, 'reorientation');
  assert.equal(redirected.stateHistory.at(-1).from, 'confirmation');
});

test('active scenario selection is explicit, validated and historized', () => {
  const value = selectActiveScenario(project(), {
    scenarioId: 'scenario-1',
    eventId: 'event-select',
    occurredAt: at(2),
    actor: { kind: 'human', id: 'account-1' },
    provenance: provenance(2),
  });
  assert.equal(value.activeScenarioId, 'scenario-1');
  assert.equal(value.stateHistory.at(-1).eventType, 'scenario_selection');
  assert.equal(value.stateHistory.at(-1).to, 'exploration');
  assert.throws(
    () => selectActiveScenario(project(), {
      scenarioId: 'missing',
      eventId: 'event-missing',
      occurredAt: at(2),
      actor: { kind: 'human', id: 'account-1' },
      provenance: provenance(2),
    }),
    (error) => error.code === 'LIFE_PROJECT_SCENARIO_NOT_FOUND',
  );
});

test('action plans must reference an existing scenario and expose missing data', () => {
  const plan = createActionPlan({
    id: 'plan-1',
    scenarioId: 'scenario-1',
    title: 'Vérifier la faisabilité',
    items: [],
    missingInformation: ['coût total', 'conditions d’admission'],
    provenance: provenance(),
    createdAt: at(1),
  });
  const value = createLifeProject({ ...project(), actionPlans: [plan] });
  assert.deepEqual(
    value.actionPlans[0].missingInformation,
    ['coût total', 'conditions d’admission'],
  );

  assert.throws(
    () => createLifeProject({
      ...project(),
      actionPlans: [{ ...plan, scenarioId: 'missing' }],
    }),
    (error) => error.code === 'LIFE_PROJECT_SCENARIO_NOT_FOUND',
  );
});

test('duplicate identifiers are rejected to preserve object and event identity', () => {
  assert.throws(
    () => createLifeProject({
      ...project(),
      scenarios: [scenario('same'), scenario('same')],
    }),
    (error) => error.code === 'LIFE_PROJECT_DUPLICATE_ID',
  );
});

test('unknown states and invalid enum values fail closed', () => {
  assert.throws(
    () => createLifeProject({ ...project(), state: 'finished_forever' }),
    (error) => error.code === 'LIFE_PROJECT_ENUM_INVALID',
  );
  assert.throws(
    () => createLifeProjectScenario({
      ...scenario(),
      id: 'scenario-invalid',
      status: 'guaranteed',
      provenance: provenance(),
      createdAt: at(1),
    }),
    (error) => error.code === 'LIFE_PROJECT_ENUM_INVALID',
  );
});
