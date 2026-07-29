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
const deployScript = read('scripts/deploy-production-vps.sh');

assert.match(scoring, /riasec-makoki-scoring-v2/u);
assert.match(scoring, /SUPPORTED_ALGORITHM_VERSIONS/u);
assert.doesNotMatch(scoring, /confidenceScore|reliability|validity|percentile_ranking/u);
assert.match(instrument, /status: 'draft'/u);
assert.match(instrument, /n’est pas présentée comme psychométriquement validée/iu);
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

const migrationIndex = deployScript.indexOf('api node scripts/migrate.js up');
const seedIndex = deployScript.indexOf('api node scripts/seed-riasec.js');
const apiRestartIndex = deployScript.indexOf('up -d --no-deps --force-recreate api');
assert.ok(migrationIndex >= 0, 'production deploy must apply migrations');
assert.ok(seedIndex > migrationIndex, 'RIASEC seed must run after migrations');
assert.ok(apiRestartIndex > seedIndex, 'RIASEC seed must finish before the API restarts');
assert.match(deployScript, /riasec-seed-report\.json/u);
assert.match(deployScript, /instrumentId.*riasec-makoki-fr-draft-v2/u);
assert.match(deployScript, /itemCount.*60/u);

console.log(JSON.stringify({
  status: 'passed',
  canonicalEngine: 'backend/src/orientation/riasec/scoring.js',
  algorithmVersion: 'riasec-makoki-scoring-v2',
  canonicalRoute: '/api/v1/orientation',
  retiredFrontendAnalyzers: 1,
  retiredLegacyAtsRoutes: 2,
  productionSeed: 'migration -> seed-riasec -> api restart',
}, null, 2));
console.log('RIASEC SINGLE ENGINE VERIFICATION PASSED');
