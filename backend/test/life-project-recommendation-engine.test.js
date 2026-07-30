'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  LifeRecommendationContractError,
  RECOMMENDATION_ENGINE_VERSION,
  createLocalOption,
  createRecommendationOutput,
} = require('../src/life-project/recommendation-contracts');
const {
  generateLifeRecommendations,
  objectiveWeights,
  normalizeDiagnostic,
} = require('../src/life-project/recommendation-engine');
const {
  BUSINESS_CASES,
  TEST_OPTIONS,
} = require('./fixtures/life-project-business-cases');

const GENERATED_AT = '2026-07-30T12:00:00.000Z';
const completeDiagnostic = BUSINESS_CASES[0].diagnostic;

const generate = (diagnostic = completeDiagnostic, options = TEST_OPTIONS, overrides = {}) => (
  generateLifeRecommendations({
    diagnostic,
    options,
    generatedAt: GENERATED_AT,
    ...overrides,
  })
);

test('produces a strict complete contract with three to five diversified scenarios', () => {
  const output = generate();
  assert.equal(output.schemaVersion, 'makoki-life-recommendation-output-v1');
  assert.equal(output.engineVersion, RECOMMENDATION_ENGINE_VERSION);
  assert.equal(output.status, 'complete');
  assert.ok(output.scenarios.length >= 3 && output.scenarios.length <= 5);
  assert.deepEqual(output.scenarios.map((scenario) => scenario.rank),
    output.scenarios.map((_, index) => index + 1));
  assert.equal(new Set(output.scenarios.map((scenario) => scenario.id)).size, output.scenarios.length);
  assert.equal(output.scenarios[0].positioning, 'priority');
  assert.ok(new Set(output.scenarios.map((scenario) => scenario.category)).size >= 2);

  for (const scenario of output.scenarios) {
    assert.ok(scenario.fitScore >= 0 && scenario.fitScore <= 100);
    assert.ok(['high', 'medium', 'low'].includes(scenario.confidence));
    assert.ok(scenario.reasons.length > 0);
    assert.ok(scenario.firstActions.length > 0);
    assert.ok(scenario.firstActions[0].expectedEvidence.length > 0);
    assert.ok(scenario.sourceReferences.length > 0);
    const option = createLocalOption(TEST_OPTIONS.find((candidate) => candidate.id === scenario.optionId));
    assert.equal(scenario.durationMonths, option.durationMonths);
    assert.deepEqual(scenario.cost, option.cost);
    assert.deepEqual(scenario.calendar, option.calendar);
    assert.deepEqual(scenario.modes, option.modes);
    assert.deepEqual(scenario.geographies, option.geographies);
    assert.deepEqual(scenario.entryLevel, option.entryLevel);
    assert.equal(scenario.engineVersion, RECOMMENDATION_ENGINE_VERSION);
    assert.ok(scenario.alternatives.every((id) => id !== scenario.id));
  }
});

test('objective and decision priorities produce transparent weights summing to 100', () => {
  const studies = objectiveWeights(normalizeDiagnostic({
    ...completeDiagnostic,
    objective: 'studies',
    priorities: [{ id: 'duration', importance: 1 }],
  }));
  const insertion = objectiveWeights(normalizeDiagnostic({
    ...completeDiagnostic,
    objective: 'insertion',
    priorities: [{ id: 'cost', importance: 1 }],
  }));
  assert.ok(Math.abs(Object.values(studies).reduce((sum, value) => sum + value, 0) - 100) < 0.01);
  assert.ok(Math.abs(Object.values(insertion).reduce((sum, value) => sum + value, 0) - 100) < 0.01);
  assert.notDeepEqual(studies, insertion);
  assert.ok(studies.temporalFeasibility > insertion.temporalFeasibility * 0.5);
  assert.ok(insertion.financialFeasibility > 0);
});

test('hard incompatibilities are not hidden and never appear as recommended scenarios', () => {
  const diagnostic = {
    ...completeDiagnostic,
    educationLevel: 'middle_school',
    maxDurationMonths: 6,
    budget: { amount: 50000, currency: 'XAF' },
  };
  const output = generate(diagnostic);
  const recommended = new Set(output.scenarios.map((scenario) => scenario.optionId));
  const rejected = new Map(output.nonPrioritized.map((entry) => [entry.optionId, entry.reasons]));
  assert.equal(recommended.has('option-bts-sio'), false);
  assert.equal(recommended.has('option-university-cs'), false);
  assert.ok(rejected.get('option-bts-sio').some((reason) => reason.includes('niveau')));
  assert.ok(rejected.get('option-bts-sio').some((reason) => reason.includes('durée')));
  assert.ok(rejected.get('option-support-tech').some((reason) => reason.includes('durée')));
});

test('returns insufficient_options instead of inventing a third choice', () => {
  const output = generate(BUSINESS_CASES.find((entry) => entry.id === 'revenu-rapide').diagnostic);
  assert.equal(output.status, 'insufficient_options');
  assert.equal(output.scenarios.length, 2);
  assert.ok(output.missingInformation.includes('Référentiel insuffisant pour produire trois options diversifiées.'));
});

test('ranking and scenario identifiers are deterministic for identical inputs', () => {
  const first = generate();
  const second = generate();
  assert.deepEqual(first, second);
});

test('confidence depends on data and source quality, not on fit score alone', () => {
  const complete = generate();
  const incomplete = generate(BUSINESS_CASES.find((entry) => entry.id === 'profil-incomplet').diagnostic);
  assert.ok(complete.scenarios.some((scenario) => scenario.confidence === 'high'));
  assert.ok(incomplete.scenarios.length > 0);
  assert.ok(incomplete.scenarios.every((scenario) => scenario.confidence === 'low'));
  assert.ok(incomplete.scenarios.some((scenario) => scenario.fitScore > 0));
});

test('stale and unverified sources reduce the score and are exposed as risks', () => {
  const currentOption = TEST_OPTIONS[0];
  const staleOption = {
    ...currentOption,
    id: 'option-bts-stale',
    title: 'BTS informatique — source ancienne',
    verificationStatus: 'to_confirm',
    entryLevel: { ...currentOption.entryLevel, status: 'to_confirm' },
    sourceReferences: currentOption.sourceReferences.map((reference) => ({
      ...reference,
      id: 'source-bts-stale',
      verifiedAt: '2024-01-01T00:00:00.000Z',
      verificationStatus: 'to_confirm',
    })),
    localOpportunities: currentOption.localOpportunities.map((entry) => ({
      ...entry,
      id: 'opp-bts-stale',
      sourceReferenceId: 'source-bts-stale',
      status: 'to_confirm',
    })),
  };
  const output = generate(completeDiagnostic, [currentOption, staleOption, ...TEST_OPTIONS.slice(1, 4)]);
  const fresh = output.scenarios.find((scenario) => scenario.optionId === currentOption.id);
  const stale = output.scenarios.find((scenario) => scenario.optionId === staleOption.id);
  assert.ok(fresh);
  assert.ok(stale);
  assert.ok(stale.fitScore < fresh.fitScore);
  assert.equal(stale.penalties.staleSource, 5);
  assert.equal(stale.penalties.unverifiedCondition, 10);
  assert.ok(stale.risks.some((risk) => risk.includes('douze mois')));
  assert.ok(stale.risks.some((risk) => risk.includes('confirmées')));
});

test('local option contract rejects unsourced opportunities and recommendation completion fails closed', () => {
  assert.throws(
    () => createLocalOption({
      id: 'unsourced',
      title: 'Option sans source',
      category: 'training',
      sourceReferences: [],
    }),
    (error) => error instanceof LifeRecommendationContractError
      && error.code === 'LIFE_RECOMMENDATION_SOURCE_REQUIRED',
  );
  assert.throws(
    () => createLocalOption({
      ...TEST_OPTIONS[0],
      id: 'bad-reference',
      localOpportunities: [{
        id: 'bad-opportunity',
        title: 'Référence absente',
        sourceReferenceId: 'missing-source',
      }],
    }),
    (error) => error.code === 'LIFE_RECOMMENDATION_SOURCE_NOT_FOUND',
  );
  assert.throws(
    () => createRecommendationOutput({
      engineVersion: RECOMMENDATION_ENGINE_VERSION,
      status: 'complete',
      generatedAt: GENERATED_AT,
      scenarios: [],
    }),
    (error) => error.code === 'LIFE_RECOMMENDATION_SCENARIO_COUNT_INVALID',
  );
});

test('ten anonymized business cases exercise expected options, exclusions and missing information', async (t) => {
  for (const businessCase of BUSINESS_CASES) {
    await t.test(businessCase.label, () => {
      const output = generate(businessCase.diagnostic);
      const included = new Set(output.scenarios.map((scenario) => scenario.optionId));
      const excluded = new Set(output.nonPrioritized.map((entry) => entry.optionId));
      for (const optionId of businessCase.expectedIncluded) {
        assert.equal(included.has(optionId), true, `${businessCase.id}: expected ${optionId} to be included`);
      }
      for (const optionId of businessCase.expectedExcluded) {
        assert.equal(excluded.has(optionId), true, `${businessCase.id}: expected ${optionId} to be excluded`);
      }
      if (businessCase.expectedConfidence) {
        assert.ok(output.scenarios.every((scenario) => scenario.confidence === businessCase.expectedConfidence));
      }
      assert.ok(output.scenarios.every((scenario) => scenario.firstActions.length > 0));
      assert.ok(output.nonPrioritized.every((entry) => entry.reasons.length > 0));
    });
  }
});
