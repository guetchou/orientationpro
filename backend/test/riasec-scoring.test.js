const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ALGORITHM_VERSION,
  LEGACY_ALGORITHM_VERSION,
  RiasecValidationError,
  scoreRiasec,
} = require('../src/orientation/riasec/scoring');

const dimensions = ['R', 'I', 'A', 'S', 'E', 'C'];

const createItems = (counts = Object.fromEntries(dimensions.map((dimension) => [dimension, 2]))) => {
  const items = [];
  for (const dimension of dimensions) {
    for (let index = 1; index <= counts[dimension]; index += 1) {
      items.push({
        id: `${dimension}-${index}`,
        dimension,
        reverseScored: counts[dimension] > 1 && index === counts[dimension],
      });
    }
  }
  return items;
};

const answerItems = (items, valuesByDimension) => items.map((item) => ({
  itemId: item.id,
  value: valuesByDimension[item.dimension],
}));

const oneItemPerDimension = () => createItems(
  Object.fromEntries(dimensions.map((dimension) => [dimension, 1])),
);

test('scores every dimension independently when item counts differ', () => {
  const items = createItems({ R: 3, I: 2, A: 4, S: 2, E: 5, C: 2 });
  const responses = answerItems(items, { R: 5, I: 4, A: 3, S: 2, E: 1, C: 3 });
  const result = scoreRiasec({ items, responses });

  assert.equal(result.algorithmVersion, ALGORITHM_VERSION);
  assert.equal(result.resultSchemaVersion, 'riasec-result-v2');
  assert.equal(result.scores.R.itemCount, 3);
  assert.equal(result.scores.A.itemCount, 4);
  assert.equal(result.scores.E.itemCount, 5);
  assert.ok(result.scores.R.normalized >= 0 && result.scores.R.normalized <= 100);
  assert.ok(result.scores.A.normalized >= 0 && result.scores.A.normalized <= 100);
  assert.ok(result.scores.E.normalized >= 0 && result.scores.E.normalized <= 100);
});

test('reverse-scored items use the inverse value on the same five-point scale', () => {
  const items = createItems();
  const responses = items.map((item) => ({ itemId: item.id, value: 5 }));
  const result = scoreRiasec({ items, responses });

  for (const dimension of dimensions) {
    assert.equal(result.scores[dimension].raw, 6);
    assert.equal(result.scores[dimension].normalized, 50);
  }
});

test('returns a unique three-letter code only when the first three ranks are unambiguous', () => {
  const items = oneItemPerDimension();
  const responses = answerItems(items, { R: 5, I: 4, A: 3, S: 2, E: 1, C: 1 });
  const result = scoreRiasec({ items, responses });

  assert.equal(result.ranking.primaryCode, 'RIA');
  assert.equal(result.ranking.displayCode, 'R-I-A');
  assert.equal(result.ranking.codeStatus, 'determinate');
  assert.equal(result.ranking.hasLeadingTie, false);
});

test('reports a first-rank tie in canonical RIASEC order without inventing a primary code', () => {
  const items = oneItemPerDimension();
  const responses = answerItems(items, { R: 5, I: 5, A: 4, S: 3, E: 2, C: 1 });
  const result = scoreRiasec({ items, responses });

  assert.equal(result.ranking.primaryCode, null);
  assert.equal(result.ranking.displayCode, 'R/I-A');
  assert.equal(result.ranking.codeStatus, 'tied');
  assert.equal(result.ranking.hasLeadingTie, true);
  assert.deepEqual(result.ranking.leadingGroups[0].dimensions, ['R', 'I']);
});

test('reports a third-rank tie instead of truncating one alternative', () => {
  const items = oneItemPerDimension();
  const responses = answerItems(items, { R: 5, I: 4, A: 3, S: 3, E: 2, C: 1 });
  const result = scoreRiasec({ items, responses });

  assert.equal(result.ranking.primaryCode, null);
  assert.equal(result.ranking.displayCode, 'R-I-A/S');
  assert.deepEqual(result.ranking.leadingGroups[2].dimensions, ['A', 'S']);
});

test('reports six equal scores as one explicit group', () => {
  const items = oneItemPerDimension();
  const result = scoreRiasec({
    items,
    responses: answerItems(items, Object.fromEntries(dimensions.map((dimension) => [dimension, 3]))),
  });

  assert.equal(result.ranking.primaryCode, null);
  assert.equal(result.ranking.displayCode, 'R/I/A/S/E/C');
  assert.equal(result.ranking.leadingGroups.length, 1);
  assert.deepEqual(result.ranking.leadingGroups[0].dimensions, dimensions);
  assert.equal(result.differentiation.range, 0);
});

test('is stable when instrument item order changes', () => {
  const items = createItems();
  const values = { R: 5, I: 4, A: 3, S: 2, E: 1, C: 3 };
  const forward = scoreRiasec({ items, responses: answerItems(items, values) });
  const reversedItems = [...items].reverse();
  const reversed = scoreRiasec({
    items: reversedItems,
    responses: answerItems(reversedItems, values),
  });

  assert.deepEqual(reversed.scores, forward.scores);
  assert.deepEqual(reversed.ranking, forward.ranking);
  assert.deepEqual(reversed.differentiation, forward.differentiation);
});

test('exposes differentiation only as a descriptive, non-normative indicator', () => {
  const items = oneItemPerDimension();
  const result = scoreRiasec({
    items,
    responses: answerItems(items, { R: 5, I: 4, A: 3, S: 2, E: 1, C: 1 }),
  });

  assert.equal(result.differentiation.kind, 'descriptive');
  assert.equal(result.differentiation.normativeBasis, null);
  assert.equal(result.differentiation.percentile, null);
  assert.equal('confidence' in result, false);
  assert.equal('reliability' in result, false);
  assert.equal('validity' in result, false);
});

test('keeps legacy scoring deterministic for already-started v1 attempts', () => {
  const items = oneItemPerDimension();
  const result = scoreRiasec({
    items,
    responses: answerItems(items, { R: 5, I: 5, A: 4, S: 3, E: 2, C: 1 }),
    algorithmVersion: LEGACY_ALGORITHM_VERSION,
  });

  assert.equal(result.algorithmVersion, LEGACY_ALGORITHM_VERSION);
  assert.equal(result.resultSchemaVersion, 'riasec-result-v1');
  assert.equal(result.ranking.displayCode, 'I/R-A');
  assert.equal(result.differentiation.kind, undefined);
});

test('rejects unsupported algorithms and malformed responses', () => {
  const items = oneItemPerDimension();
  const complete = answerItems(items, { R: 5, I: 4, A: 3, S: 2, E: 1, C: 3 });

  assert.throws(
    () => scoreRiasec({ items, responses: complete, algorithmVersion: 'riasec-unknown-v99' }),
    (error) => error instanceof RiasecValidationError && error.code === 'UNSUPPORTED_RIASEC_ALGORITHM',
  );
  assert.throws(
    () => scoreRiasec({ items, responses: complete.slice(1) }),
    (error) => error instanceof RiasecValidationError && error.code === 'INCOMPLETE_RESPONSES',
  );
  assert.throws(
    () => scoreRiasec({ items, responses: [...complete, complete[0]] }),
    (error) => error instanceof RiasecValidationError && error.code === 'DUPLICATE_RESPONSE',
  );
  assert.throws(
    () => scoreRiasec({
      items,
      responses: complete.map((response, index) => index === 0
        ? { itemId: 'unknown', value: response.value }
        : response),
    }),
    (error) => error instanceof RiasecValidationError && error.code === 'UNKNOWN_ITEM',
  );
  assert.throws(
    () => scoreRiasec({
      items,
      responses: complete.map((response, index) => index === 0
        ? { ...response, value: 6 }
        : response),
    }),
    (error) => error instanceof RiasecValidationError && error.code === 'INVALID_RESPONSE_VALUE',
  );
});
