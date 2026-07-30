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
