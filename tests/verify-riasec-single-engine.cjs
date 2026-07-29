const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const scoring = read('backend/src/orientation/riasec/scoring.js');
const instrument = read('backend/src/orientation/riasec/instrument.js');
const orientationRouter = read('backend/src/orientation/riasec/router.js');
const atsRoutes = read('backend/src/routes/ats.routes.js');
const server = read('backend/src/server.js');
const appRouter = read('src/router/AppRouter.tsx');
const readme = read('README.md');

assert.match(scoring, /riasec-makoki-scoring-v2/u);
assert.match(scoring, /SUPPORTED_ALGORITHM_VERSIONS/u);
assert.doesNotMatch(scoring, /confidenceScore|reliability|validity|percentile_ranking/u);
assert.match(instrument, /status: 'draft'/u);
assert.match(instrument, /ne constitue.*instrument psychométrique validé/isu);
assert.match(instrument, /originale.*MAKOKI/isu);
assert.match(orientationRouter, /scoreRiasec/u);
assert.match(server, /app\.use\('\/api\/v1\/orientation', createRiasecRouter/u);
assert.match(appRouter, /path="\/tests\/riasec".*<RiasecTest/u);
assert.match(atsRoutes, /router\.post\('\/tests\/analyze', rejectLegacyRiasec/u);
assert.match(atsRoutes, /router\.post\('\/tests\/execute', rejectLegacyRiasec/u);
assert.match(atsRoutes, /router\.get\('\/tests\/available', hideRetiredRiasec/u);
assert.equal(exists('src/components/tests/riasec/RiasecAnalyzer.ts'), false);
assert.equal(exists('src/data/riasecQuestions.ts'), false);
assert.doesNotMatch(readme, /RIASEC scientifiquement valid/u);
assert.match(readme, /outil d’exploration des intérêts/iu);

console.log(JSON.stringify({
  status: 'passed',
  canonicalEngine: 'backend/src/orientation/riasec/scoring.js',
  algorithmVersion: 'riasec-makoki-scoring-v2',
  canonicalRoute: '/api/v1/orientation',
  retiredFrontendAnalyzers: 1,
  retiredLegacyAtsRoutes: 2,
}, null, 2));
console.log('RIASEC SINGLE ENGINE VERIFICATION PASSED');
