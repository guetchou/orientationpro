'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { ALGORITHM_VERSION, displayCode, matchOccupation, rankOccupations, weightedRankAgreement } = require('../src/career/matching');
const scores = (R, I, A, S, E, C) => ({ R, I, A, S, E, C });
const source = (kind, version) => ({ id: `${kind}:${version}`, kind, version, title: kind, licenseName: 'CC BY 4.0', licenseUrl: 'https://example.test', attribution: kind });
const occupation = ({ id, label, riasec, status = 'direct', translated = true }) => ({ id, sourceCode: id, preferredLabel: label, locale: translated ? 'fr' : 'en', requestedLocale: 'fr', fallbackLocale: translated ? null : 'en', translationStatus: translated ? 'available' : 'unavailable', presentationSource: translated ? source('esco', '1.2.1') : source('onet', '30.3'), riasecSource: source('onet', '30.3'), crosswalk: translated ? { reviewStatus: 'official' } : null, riasec, riasecProfileStatus: status, riasecProvenance: { source: 'O*NET' } });
test('perfect score retains multilingual provenance', () => {
  const profile = scores(90, 70, 40, 30, 20, 10);
  const value = matchOccupation({ userScores: profile, occupation: occupation({ id: 'same', label: 'infirmier', riasec: profile }) });
  assert.equal(value.fitScore, 100);
  assert.equal(value.algorithmVersion, ALGORITHM_VERSION);
  assert.equal(value.presentationSource.kind, 'esco');
  assert.equal(value.riasecSource.kind, 'onet');
});
test('ties and dominant agreement remain deterministic', () => {
  assert.equal(displayCode(scores(90, 90, 90, 90, 20, 10)), 'AIRS');
  assert.ok(weightedRankAgreement(scores(90, 80, 70, 20, 10, 5), scores(70, 95, 80, 10, 5, 1)) > weightedRankAgreement(scores(90, 80, 70, 20, 10, 5), scores(10, 5, 1, 90, 80, 70)));
});
test('ranking excludes missing profiles and keeps fallback metadata', () => {
  const ranked = rankOccupations({ userScores: scores(90, 70, 50, 30, 20, 10), occupations: [occupation({ id: 'best', label: 'infirmier', riasec: scores(88, 68, 48, 28, 18, 8) }), occupation({ id: 'other', label: 'Accountant', riasec: scores(10, 20, 30, 50, 70, 90), translated: false }), occupation({ id: 'missing', label: 'Missing', riasec: null, status: 'missing' })], limit: 10 });
  assert.equal(ranked.length, 2);
  assert.equal(ranked[1].fallbackLocale, 'en');
});
test('invalid scores are rejected', () => assert.throws(() => matchOccupation({ userScores: scores(101, 70, 50, 30, 20, 10), occupation: occupation({ id: 'job', label: 'Métier', riasec: scores(80, 70, 60, 50, 40, 30) }) }), /between 0 and 100/u));
