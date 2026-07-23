const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createConfig,
  downloadJson,
  normalize,
  requireScale,
} = require('../scripts/import-onet-catalog');

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

test('retries a transient transfer failure before accepting a complete JSON payload', async () => {
  let calls = 0;
  const delays = [];
  const fetchImpl = async () => {
    calls += 1;
    if (calls === 1) throw new TypeError('terminated');
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ row: [{ onetsoc_code: '00-0000.00' }] }),
    };
  };

  const result = await downloadJson('https://example.test/occupation_data.json', {
    attempts: 2,
    timeoutMs: 1000,
    fetchImpl,
    sleepImpl: async (delay) => { delays.push(delay); },
  });

  assert.equal(calls, 2);
  assert.deepEqual(delays, [1000]);
  assert.equal(result.rows.length, 1);
});

test('builds versioned URLs and enables resilient download defaults', () => {
  const config = createConfig({
    ONET_VERSION: '30.3',
    ONET_CACHE_DIR: '/tmp/makoki-onet-cache',
  });

  assert.equal(config.sourceId, 'onet:30.3:en');
  assert.match(config.urls.interests, /db_30_3_json\/career_interest_types\.json$/);
  assert.equal(config.downloadAttempts, 4);
  assert.equal(config.downloadTimeoutMs, 180000);
  assert.equal(config.forceIpv4, true);
});
