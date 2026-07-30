'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { verify } = require('./v5g-manual-evidence-gate.cjs');

test('missing manual executions remain blocking rather than invented', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'v5g-manual-gate-'));
  try {
    assert.deepEqual(verify(directory).map(({ status }) => status), ['missing', 'missing', 'missing']);
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
