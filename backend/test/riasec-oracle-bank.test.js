'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { instrument } = require('../src/orientation/riasec/instrument');
const { scoreRiasec } = require('../src/orientation/riasec/scoring');

const BANK_PATH = path.join(__dirname, '..', '..', 'tests', 'life-project', 'oracles', 'riasec-profiles.v1.json');
const bank = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));

test('the oracle bank matches the current instrument', () => {
  assert.equal(bank.instrumentId, instrument.id);
  assert.equal(bank.instrumentVersion, instrument.version);
  assert.equal(bank.profiles.length, 12);
  const ids = bank.profiles.map((profile) => profile.id);
  assert.equal(new Set(ids).size, ids.length, 'profile ids must be unique');
});

test('every oracle profile is exactly reproduced by the real scoring engine', () => {
  for (const profile of bank.profiles) {
    const recomputed = scoreRiasec({ items: instrument.items, responses: profile.responses });
    assert.deepEqual(
      recomputed,
      profile.expected,
      `profile "${profile.id}" no longer matches scoreRiasec() output — regenerate the bank only if the instrument or algorithm intentionally changed`,
    );
  }
});

test('the six uniform-answer profiles land on three distinct, non-zero/non-hundred normalized values', () => {
  // Garde-fou de plausibilité : confirme que la nuance des items inversés est
  // bien prise en compte (répondre "1" partout ne donne pas 0, "5" partout ne
  // donne pas 100), et que les trois profils uniformes restent bien distincts
  // entre eux.
  const byId = (id) => bank.profiles.find((profile) => profile.id === id);
  const uniformValue = (id) => byId(id).expected.scores.R.normalized;
  const minimum = uniformValue('all-minimum');
  const middle = uniformValue('all-identical-mid');
  const maximum = uniformValue('all-maximum');
  assert.ok(minimum > 0 && minimum < 100, 'reverse-scored items must keep the minimum profile off the 0 boundary');
  assert.ok(maximum > 0 && maximum < 100, 'reverse-scored items must keep the maximum profile off the 100 boundary');
  assert.equal(new Set([minimum, middle, maximum]).size, 3);
});

test('the tie-top profile breaks ties by canonical dimension order (A before S)', () => {
  const profile = bank.profiles.find((entry) => entry.id === 'tie-top');
  assert.equal(profile.expected.ranking.hasLeadingTie, true);
  assert.equal(profile.expected.ranking.primaryCode, null);
  const [first, second] = profile.expected.ranking.ordered;
  assert.equal(first.dimension, 'A');
  assert.equal(second.dimension, 'S');
  assert.equal(first.score, second.score);
});

test('the single-item-variation profile changes only the affected dimension versus its baseline', () => {
  const baseline = bank.profiles.find((entry) => entry.id === 'dominant-r');
  const varied = bank.profiles.find((entry) => entry.id === 'single-item-variation');
  assert.equal(varied.baselineProfileId, 'dominant-r');
  assert.notEqual(varied.expected.scores.R.normalized, baseline.expected.scores.R.normalized);
  for (const dimension of ['I', 'A', 'S', 'E', 'C']) {
    assert.deepEqual(varied.expected.scores[dimension], baseline.expected.scores[dimension]);
  }
});

// Défaut volontaire (critère de clôture #216) : une valeur attendue corrompue
// doit bien faire échouer la comparaison contre le moteur réel — sinon le
// garde-fou lui-même serait aveugle à une régression.
test('a deliberately corrupted expectation is caught by the comparison (mutation check)', () => {
  const profile = bank.profiles.find((entry) => entry.id === 'dominant-r');
  const recomputed = scoreRiasec({ items: instrument.items, responses: profile.responses });
  const corrupted = JSON.parse(JSON.stringify(profile.expected));
  corrupted.ranking.primaryCode = 'ZZZ';
  corrupted.scores.R.normalized = corrupted.scores.R.normalized + 1;

  assert.throws(
    () => assert.deepEqual(recomputed, corrupted),
    'a corrupted oracle value must be rejected by deepEqual, proving the guard is not silently passing',
  );
});
