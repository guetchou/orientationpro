'use strict';

const { performance } = require('node:perf_hooks');

const target = process.argv[2];
const requestCount = Number(process.argv[3] || 300);
const concurrency = Number(process.argv[4] || 10);
if (!/^http:\/\/127\.0\.0\.1:\d+\/api\/test\/health$/.test(target || '')) {
  throw new Error('Target must be an isolated localhost health endpoint');
}
if (!Number.isSafeInteger(requestCount) || requestCount < 1 || requestCount > 2000) {
  throw new Error('Request count must be between 1 and 2000');
}
if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 25) {
  throw new Error('Concurrency must be between 1 and 25');
}

const latencies = [];
let failures = 0;
let next = 0;
const worker = async () => {
  while (next < requestCount) {
    next += 1;
    const started = performance.now();
    try {
      const response = await fetch(target, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) failures += 1;
      await response.arrayBuffer();
    } catch {
      failures += 1;
    } finally {
      latencies.push(performance.now() - started);
    }
  }
};

const started = performance.now();
Promise.all(Array.from({ length: concurrency }, () => worker())).then(() => {
  latencies.sort((a, b) => a - b);
  const percentile = (ratio) => latencies[Math.ceil(latencies.length * ratio) - 1];
  const result = {
    target: 'isolated-local-health',
    requestCount,
    concurrency,
    failures,
    durationMs: Math.round(performance.now() - started),
    p50Ms: Math.round(percentile(0.5)),
    p95Ms: Math.round(percentile(0.95)),
    p99Ms: Math.round(percentile(0.99)),
  };
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (failures > 0 || result.p95Ms > 750) process.exitCode = 1;
});
