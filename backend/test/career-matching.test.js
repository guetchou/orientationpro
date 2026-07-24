const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ALGORITHM_VERSION,
  displayCode,
  matchOccupation,
  rankOccupations,
  weightedRankAgreement,
} = require('../src/career/matching');

const scores = (R, I, A, S, E, C) => ({ R, I, A, S, E, C });

const occupation = ({
  id,
  label,
  riasec,
  status = 'direct',
}) => ({
  id,
  sourceCode: id,
  preferredLabel: label,
  riasec,
  riasecProfileStatus: status,
  riasecProvenance: { source: 'test' },
});

test('an identical RIASEC profile receives a perfect transparent score', () => {
  const profile = scores(90, 70, 40, 30, 20, 10);
  const result = matchOccupation({
    userScores: profile,
    occupation: occupation({ id: 'same', label: 'Identique', riasec: profile }),
  });

  assert.equal(result.fitScore, 100);
  assert.equal(result.algorithmVersion, ALGORITHM_VERSION);
  assert.equal(result.userCode, 'RIA');
  assert.equal(result.occupationCode, 'RIA');
  assert.equal(result.components.cosineSimilarity, 1);
  assert.equal(result.components.rankAgreement, 1);
  assert.deepEqual(result.provenance, { source: 'test' });
});

test('ties are preserved instead of forcing an arbitrary three-letter code', () => {
  assert.equal(displayCode(scores(90, 90, 90, 90, 20, 10)), 'AIRS');
  assert.equal(displayCode(scores(80, 70, 60, 60, 10, 5)), 'AIRS');
});

test('rank agreement rewards shared dominant dimensions', () => {
  const user = scores(90, 80, 70, 20, 10, 5);
  const sameTop = scores(70, 95, 80, 10, 5, 1);
  const differentTop = scores(10, 5, 1, 90, 80, 70);

  assert.ok(weightedRankAgreement(user, sameTop) > weightedRankAgreement(user, differentTop));
});

test('ranking excludes occupations without a traceable RIASEC profile', () => {
  const user = scores(90, 70, 50, 30, 20, 10);
  const ranked = rankOccupations({
    userScores: user,
    occupations: [
      occupation({ id: 'best', label: 'Meilleur', riasec: scores(88, 68, 48, 28, 18, 8) }),
      occupation({ id: 'other', label: 'Autre', riasec: scores(10, 20, 30, 50, 70, 90) }),
      occupation({ id: 'missing', label: 'Sans profil', riasec: null, status: 'missing' }),
    ],
    limit: 10,
  });

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].occupationId, 'best');
  assert.ok(ranked[0].fitScore > ranked[1].fitScore);
});

test('invalid scores are rejected instead of silently clamped', () => {
  assert.throws(() => matchOccupation({
    userScores: scores(101, 70, 50, 30, 20, 10),
    occupation: occupation({ id: 'job', label: 'Métier', riasec: scores(80, 70, 60, 50, 40, 30) }),
  }), /between 0 and 100/);
});
