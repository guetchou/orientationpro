'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createCapabilityRegistry } = require('../src/capabilities/registry');
const {
  ORCHESTRATION_VERSION,
  createActionPlan,
  createAdaptiveOrchestration,
  createLifeProject,
  createLifeProjectScenario,
} = require('../src/life-project');

const at = (day) => `2026-07-${String(day).padStart(2, '0')}T08:00:00.000Z`;
const provenance = (day = 1) => ({
  sourceType: 'user_statement',
  actorId: 'account-1',
  recordedAt: at(day),
});

const registry = ({ riasec = true, career = true, lifeProject = true } = {}) => createCapabilityRegistry({
  AUTH_V1_ENABLED: 'true',
  LIFE_PROJECT_API_ENABLED: lifeProject ? 'true' : 'false',
  RIASEC_API_ENABLED: riasec ? 'true' : 'false',
  CAREER_API_ENABLED: career ? 'true' : 'false',
});

const scenario = (id = 'scenario-1') => createLifeProjectScenario({
  id,
  title: `Scénario ${id}`,
  status: 'candidate',
  optionType: 'education',
  uncertainty: { level: 'medium', reasons: ['Conditions à vérifier'] },
  provenance: provenance(),
  createdAt: at(1),
});

const project = (overrides = {}) => createLifeProject({
  id: 'project-1',
  ownerAccountId: 'account-1',
  title: 'Construire mon projet de vie',
  state: 'exploration',
  activeScenarioId: null,
  scenarios: [],
  criteria: [],
  actionPlans: [],
  stateHistory: [],
  missingInformation: ['contraintes concrètes'],
  uncertainty: { level: 'high', reasons: ['Point de départ déclaré'] },
  provenance: provenance(),
  createdAt: at(1),
  updatedAt: at(1),
  ...overrides,
});

test('orchestration state is versioned, separate, deterministic and deeply immutable', () => {
  const input = project();
  const first = createAdaptiveOrchestration({
    project: input,
    capabilityRegistry: registry(),
    generatedAt: at(2),
  });
  const second = createAdaptiveOrchestration({
    project: input,
    capabilityRegistry: registry(),
    generatedAt: at(2),
  });

  assert.equal(first.schemaVersion, ORCHESTRATION_VERSION);
  assert.equal(first.projectId, input.id);
  assert.equal(first.projectState, input.state);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.recommendations), true);
  assert.equal(Object.isFrozen(first.recommendations[0].reasons), true);
  assert.equal(input.schemaVersion, 'makoki-life-project-v1');
  assert.equal(input.nextModuleId, undefined);
});

test('missing information and high uncertainty select clarification with explicit reasons', () => {
  const result = createAdaptiveOrchestration({
    project: project(),
    capabilityRegistry: registry(),
    generatedAt: at(2),
  });

  assert.equal(result.nextModuleId, 'life-project.clarification');
  assert.deepEqual(
    result.nextModuleReasons.map((entry) => entry.code),
    ['PROJECT_INFORMATION_MISSING', 'PROJECT_UNCERTAINTY_HIGH'],
  );
  assert.equal(result.signals.missingInformationCount, 1);
  assert.equal(result.signals.uncertaintyLevel, 'high');
});

test('disabled modules remain visible but are never selected as the next step', () => {
  const result = createAdaptiveOrchestration({
    project: project({
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
    capabilityRegistry: registry({ riasec: false }),
    generatedAt: at(2),
    completedModuleIds: ['profile.review'],
  });

  const interests = result.recommendations.find((entry) => entry.moduleId === 'orientation.interests');
  assert.equal(interests.availability, 'disabled');
  assert.notEqual(result.nextModuleId, 'orientation.interests');
  assert.equal(result.nextModuleId, 'profile.skills-review');
});

test('capability dependencies fail closed when a prerequisite is disabled', () => {
  const result = createAdaptiveOrchestration({
    project: project({
      state: 'comparison',
      scenarios: [scenario('one')],
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
    capabilityRegistry: registry({ riasec: false, career: true }),
    generatedAt: at(2),
  });

  const career = result.recommendations.find((entry) => entry.moduleId === 'career.exploration');
  assert.equal(career.availability, 'unavailable');
  assert.deepEqual(career.blockers, ['Dépendance indisponible : orientation.riasec']);
});

test('an active scenario without actions prioritizes action planning', () => {
  const selected = scenario();
  const result = createAdaptiveOrchestration({
    project: project({
      state: 'preparation',
      activeScenarioId: selected.id,
      scenarios: [selected],
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
    capabilityRegistry: registry(),
    generatedAt: at(2),
  });

  assert.equal(result.nextModuleId, 'life-project.action-planning');
  assert.equal(result.nextModuleReasons[0].code, 'ACTIVE_SCENARIO_WITHOUT_ACTIONS');
});

test('blocked actions take priority over generic exploration and expose descriptive progress signals', () => {
  const selected = scenario();
  const plan = createActionPlan({
    id: 'plan-1',
    scenarioId: selected.id,
    title: 'Tester le scénario',
    status: 'active',
    items: [{
      id: 'action-1',
      title: 'Contacter une structure',
      status: 'blocked',
      blockingReasons: ['Coordonnées à confirmer'],
      provenance: provenance(),
      createdAt: at(1),
    }],
    provenance: provenance(),
    createdAt: at(1),
  });
  const result = createAdaptiveOrchestration({
    project: project({
      state: 'action',
      activeScenarioId: selected.id,
      scenarios: [selected],
      actionPlans: [plan],
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
    capabilityRegistry: registry(),
    generatedAt: at(2),
  });

  assert.equal(result.nextModuleId, 'life-project.follow-up');
  assert.equal(result.nextModuleReasons[0].code, 'ACTION_BLOCKED');
  assert.deepEqual(result.signals.actions, {
    total: 1,
    planned: 0,
    inProgress: 0,
    completed: 0,
    blocked: 1,
    cancelled: 0,
  });
  assert.equal(JSON.stringify(result).includes('%'), false);
});

test('completed and skipped modules are not silently proposed again', () => {
  const result = createAdaptiveOrchestration({
    project: project({
      missingInformation: [],
      uncertainty: { level: 'low', reasons: [] },
    }),
    capabilityRegistry: registry(),
    generatedAt: at(2),
    completedModuleIds: ['profile.review'],
    skippedModuleIds: ['orientation.interests'],
  });

  assert.equal(
    result.recommendations.find((entry) => entry.moduleId === 'profile.review').completion,
    'completed',
  );
  assert.equal(
    result.recommendations.find((entry) => entry.moduleId === 'orientation.interests').completion,
    'skipped',
  );
  assert.equal(result.nextModuleId, 'profile.skills-review');
});
