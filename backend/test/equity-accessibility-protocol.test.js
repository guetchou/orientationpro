'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const protocol = fs.readFileSync(path.resolve(
  __dirname,
  '../../docs/equity/EQUITY_ACCESSIBILITY_SAFETY_PROTOCOL_V1.md',
), 'utf8');
const template = fs.readFileSync(path.resolve(
  __dirname,
  '../../docs/equity/AUDIT_RECORD_TEMPLATE_V1.md',
), 'utf8');

test('equity protocol covers required dimensions without inventing a score', () => {
  for (const term of [
    'âge',
    'sexe',
    'langue',
    'niveau scolaire',
    'handicap',
    'connectivité',
    'socio-économique',
  ]) {
    assert.match(protocol, new RegExp(term, 'u'));
  }
  assert.match(protocol, /aucune métrique comparative ni « score d’équité »/u);
  assert.match(protocol, /absence de données reste une inconnue/u);
});

test('accessibility protocol covers keyboard, screen readers, contrast, mobile and bandwidth', () => {
  assert.match(protocol, /Clavier/u);
  assert.match(protocol, /Lecteurs d’écran/u);
  assert.match(protocol, /WCAG 2\.2 AA/u);
  assert.match(protocol, /320 px/u);
  assert.match(protocol, /faible bande passante/u);
  assert.match(protocol, /aucune perte silencieuse/u);
});

test('human safety boundary forbids diagnosis and unverified local contacts', () => {
  assert.match(protocol, /ne dépiste, ne diagnostique et\s+ne traite aucun trouble/u);
  assert.match(protocol, /ne jamais inventer un contact/u);
  assert.match(protocol, /validés pour le pays et la date concernés/u);
});

test('audit template is empty and records evidence limits', () => {
  assert.match(template, /Modèle vide/u);
  assert.match(template, /effectif et données manquantes/u);
  assert.match(template, /risque de réidentification/u);
  assert.match(template, /responsable humain/u);
});
