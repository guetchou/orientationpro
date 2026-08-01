'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createLifeProjectDiagnostic,
  diagnosticMissingInformation,
  diagnosticToEngineInput,
} = require('../src/life-project/diagnostic-contracts');
const { normalizeDiagnostic } = require('../src/life-project/recommendation-engine');

const at = '2026-07-30T12:00:00.000Z';

const diagnostic = (overrides = {}) => createLifeProjectDiagnostic({
  id: 'diagnostic-contract-test',
  objective: 'uncertain',
  identity: {},
  constraints: {},
  preferences: {},
  capabilities: {},
  priorities: [],
  recordedAt: at,
  updatedAt: at,
  ...overrides,
});

const riasecProfile = {
  resultId: 'result-riasec-1',
  attemptId: 'attempt-riasec-1',
  instrumentId: 'instrument-riasec-1',
  algorithmVersion: 'riasec-v2',
  primaryCode: 'ISE',
  displayCode: 'I-S-E',
  scores: { R: 35, I: 88, A: 42, S: 74, E: 61, C: 40 },
  ranking: [
    { dimension: 'I', score: 88 },
    { dimension: 'S', score: 74 },
    { dimension: 'E', score: 61 },
    { dimension: 'A', score: 42 },
    { dimension: 'C', score: 40 },
    { dimension: 'R', score: 35 },
  ],
  completedAt: at,
};

test('missing numeric constraints remain unknown instead of becoming zero in the engine', () => {
  const input = diagnosticToEngineInput(diagnostic());
  const normalized = normalizeDiagnostic(input);

  assert.equal(input.budget.amount, undefined);
  assert.equal(input.maxDurationMonths, undefined);
  assert.equal(input.needIncomeWithinMonths, undefined);
  assert.equal(normalized.budget.amount, null);
  assert.equal(normalized.maxDurationMonths, null);
  assert.equal(normalized.needIncomeWithinMonths, null);
});

test('an explicit zero budget remains a verified constraint and is not converted to unknown', () => {
  const input = diagnosticToEngineInput(diagnostic({
    constraints: {
      budget: { amount: 0, currency: 'XAF', verification: 'declared' },
      maxDurationMonths: 6,
      needIncomeWithinMonths: 1,
    },
  }));
  const normalized = normalizeDiagnostic(input);

  assert.equal(normalized.budget.amount, 0);
  assert.equal(normalized.maxDurationMonths, 6);
  assert.equal(normalized.needIncomeWithinMonths, 1);
});

test('missing-information list names every counselor field needed before confidence can rise', () => {
  const missing = diagnosticMissingInformation(diagnostic());

  assert.ok(missing.includes('Pays de résidence'));
  assert.ok(missing.includes('Dernier niveau atteint'));
  assert.ok(missing.includes('Budget maximal ou financement disponible'));
  assert.ok(missing.includes('Durée maximale acceptable'));
  assert.ok(missing.includes('Intérêts et activités appréciées'));
  assert.ok(missing.includes('Compétences, expériences ou projets personnels'));
  assert.ok(missing.includes('Critères de décision classés'));
});

test('RIASEC profile is persisted and its leading dimensions enrich recommendation tokens', () => {
  const created = diagnostic({ riasecProfile });
  const input = diagnosticToEngineInput(created);
  const normalized = normalizeDiagnostic(input);

  assert.equal(created.riasecProfile.resultId, 'result-riasec-1');
  assert.equal(created.riasecProfile.displayCode, 'I-S-E');
  assert.equal(created.riasecProfile.scores.I, 88);
  assert.equal(input.riasecProfile.resultId, 'result-riasec-1');
  assert.ok(normalized.interests.includes('sciences'));
  assert.ok(normalized.interests.includes('analyse'));
  assert.ok(normalized.interests.includes('accompagnement'));
  assert.ok(normalized.interests.includes('entrepreneuriat'));
  assert.ok(normalized.preferences.includes('leadership'));
});

test('a completed RIASEC profile satisfies the interests signal without duplicate manual questions', () => {
  const missing = diagnosticMissingInformation(diagnostic({ riasecProfile }));

  assert.equal(missing.includes('Intérêts et activités appréciées'), false);
});
