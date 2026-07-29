'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const protocolPath = path.resolve(
  __dirname,
  '../../docs/field-validation/FIELD_VALIDATION_PROTOCOL_V1.md',
);
const templatePath = path.resolve(
  __dirname,
  '../../docs/field-validation/SESSION_RECORD_TEMPLATE_V1.md',
);

test('field protocol is versioned and explicitly not executed', () => {
  const protocol = fs.readFileSync(protocolPath, 'utf8');
  assert.match(protocol, /makoki-field-validation-v1/u);
  assert.match(protocol, /non exécuté/u);
  assert.match(protocol, /Recherche qualitative/u);
  assert.match(protocol, /Pilote technique/u);
  assert.match(protocol, /Validation scientifique/u);
});

test('field protocol records comprehension, abandonment, decisions, actions and blockers', () => {
  const protocol = fs.readFileSync(protocolPath, 'utf8');
  for (const term of [
    'compréhension',
    'abandon',
    'décision',
    'action',
    'blocage',
    'reprise',
  ]) {
    assert.match(protocol, new RegExp(term, 'u'));
  }
  assert.match(protocol, /Aucun score global de réussite/u);
});

test('session template keeps observed, declared and unknown information distinct', () => {
  const template = fs.readFileSync(templatePath, 'utf8');
  assert.match(template, /modèle vide/u);
  assert.match(template, /déclarés, observés ou inconnus/u);
  assert.match(template, /verbatim, observation et interprétation/u);
});
