const assert = require('node:assert/strict');
const test = require('node:test');

const { normalize, requireScale } = require('../scripts/import-onet-catalog');

test('normalizes the O*NET OI scale to 0-100 without changing rank order', () => {
  assert.equal(normalize({ value: 1, minimum: 1, maximum: 7 }), 0);
  assert.equal(normalize({ value: 4, minimum: 1, maximum: 7 }), 50);
  assert.equal(normalize({ value: 7, minimum: 1, maximum: 7 }), 100);
  assert.ok(
    normalize({ value: 6, minimum: 1, maximum: 7 }) >
    normalize({ value: 5, minimum: 1, maximum: 7 }),
  );
});

test('rejects values outside the source scale', () => {
  assert.throws(
    () => normalize({ value: 8, minimum: 1, maximum: 7 }),
    /outside scale/,
  );
});

test('reads the source scale from the O*NET scale reference file', () => {
  assert.deepEqual(
    requireScale([
      { scale_id: 'IM', scale_name: 'Importance', minimum: 1, maximum: 5 },
      { scale_id: 'OI', scale_name: 'Occupational Interest', minimum: 1, maximum: 7 },
    ], 'OI'),
    { minimum: 1, maximum: 7, name: 'Occupational Interest' },
  );
});
