const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const scoring = read('backend/src/orientation/riasec/scoring.js');
const instrument = read('backend/src/orientation/riasec/instrument.js');
const orientationRouter = read('backend/src/orientation/riasec/router.js');
const orientationStore = read('backend/src/orientation/riasec/store.js');
const guestSessions = read('backend/src/orientation/guest-sessions.js');
const lifeProjectRouter = read('backend/src/life-project/router.js');
const careerRouter = read('backend/src/career/router.js');
const atsRoutes = read('backend/src/routes/ats.routes.js');
const server = read('backend/src/server.js');
const appRouter = read('src/router/AppRouter.tsx');
const unifiedPage = read('src/features/life-project/UnifiedLifeProjectPage.tsx');
const embeddedRiasec = read('src/features/life-project/EmbeddedRiasecStep.tsx');
const workspace = read('src/features/life-project/LifeProjectWorkspace.tsx');
const readme = read('README.md');
const deployScript = read('scripts/deploy-production-vps.sh');

// One scoring implementation and one algorithm lineage.
assert.match(scoring, /riasec-makoki-scoring-v2/u);
assert.match(scoring, /SUPPORTED_ALGORITHM_VERSIONS/u);
assert.doesNotMatch(scoring, /confidenceScore|reliability|validity|percentile_ranking/u);
assert.match(instrument, /status: 'draft'/u);
assert.match(instrument, /n’est pas présentée comme psychométriquement validée/iu);
assert.match(instrument, /originale.*MAKOKI/isu);
assert.match(orientationRouter, /scoreRiasec/u);

// The runtime creates one shared store and mounts one canonical RIASEC router.
const storeCreations = server.match(/createRiasecStore\(authV1\.pool\)/gu) || [];
assert.equal(
  storeCreations.length,
  1,
  'the RIASEC store must be created exactly once and shared with Projet de vie',
);
const canonicalRouteMounts = server.match(
  /app\.use\('\/api\/v1\/orientation',(?:\s*[A-Za-z][A-Za-z0-9]*,)*\s*createRiasecRouter/gu,
) || [];
assert.equal(
  canonicalRouteMounts.length,
  1,
  'the canonical RIASEC router must be mounted exactly once, after optional middleware',
);
assert.match(server, /riasecStore,\s*\n\s*\}\)\);/u);

// Guest mode changes ownership, never scoring. The raw token stays in an HttpOnly cookie.
assert.match(orientationRouter, /guestSessions\.resolveOwner/u);
assert.match(orientationRouter, /guestSessions\.claimFromRequest/u);
assert.match(orientationStore, /Exactly one orientation owner is required/u);
assert.match(guestSessions, /httpOnly: true/u);
assert.match(guestSessions, /hashToken\(token\)/u);
assert.match(guestSessions, /UPDATE orientation_riasec_attempts[\s\S]*guest_session_id = NULL/u);
assert.match(guestSessions, /UPDATE orientation_results[\s\S]*guest_session_id = NULL/u);
assert.doesNotMatch(guestSessions, /scoreRiasec/u);

// Projet de vie never trusts browser-provided scores: it reloads the owned account result.
assert.match(lifeProjectRouter, /riasecStore\.getResult\(\{ accountId, resultId \}\)/u);
assert.match(lifeProjectRouter, /delete sanitized\.riasecProfile/u);
assert.match(lifeProjectRouter, /verifiedRiasecProfile\(result\)/u);
assert.doesNotMatch(lifeProjectRouter, /scoreRiasec/u);

// One public journey: legacy URLs converge, and /parcours is no longer behind UserRoute.
assert.match(appRouter, /const unifiedJourney = <Navigate to="\/parcours" replace \/>/u);
assert.match(appRouter, /path="\/tests\/riasec" element=\{unifiedJourney\}/u);
assert.match(appRouter, /path="\/orientation\/results\/:resultId" element=\{unifiedJourney\}/u);
assert.match(appRouter, /path="\/parcours" element=\{<LifeProjectPage \/>\}/u);
assert.doesNotMatch(appRouter, /path="\/parcours" element=\{<UserRoute>/u);
assert.match(appRouter, /path="\/careers" element=\{<CareerCatalog \/>\}/u);
assert.doesNotMatch(appRouter, /<RiasecTest\s*\/>/u);

// The public catalog is descriptive; personalized matching remains protected.
assert.match(careerRouter, /publicCatalog/u);
assert.match(careerRouter, /recommendationsEnabled/u);
assert.match(careerRouter, /includeLocallyExcluded: publicCatalog \? false/u);
assert.match(careerRouter, /protectedRoute\('career\.match\.read_own'\)/u);

// The same page contains visible value, the contextual auth gate and one account report.
assert.match(unifiedPage, /<EmbeddedRiasecStep onComplete=\{handleRiasecComplete\} \/>/u);
assert.match(unifiedPage, /guest-life-project-soft-gate/u);
assert.match(unifiedPage, /Créer mon espace/u);
assert.match(unifiedPage, /Continuer à explorer sans compte/u);
assert.match(unifiedPage, /<LifeProjectWorkspace riasecProfile=\{riasecProfile\} \/>/u);
assert.match(embeddedRiasec, /claimGuestOrientation/u);
assert.match(embeddedRiasec, /submitRiasecAttempt/u);
assert.match(embeddedRiasec, /Commencer sans compte/u);
assert.doesNotMatch(embeddedRiasec, /scoreRiasec/u);
assert.match(workspace, /Mon rapport Projet de vie/u);
assert.match(workspace, /window\.print\(\)/u);
assert.match(workspace, /Mon profil RIASEC/u);
assert.match(workspace, /Mon choix provisoire/u);
assert.match(workspace, /Ma première action/u);

// Retired alternate analyzers and ATS routes remain impossible to invoke.
assert.match(atsRoutes, /router\.post\('\/tests\/analyze', rejectLegacyRiasec/u);
assert.match(atsRoutes, /router\.post\('\/tests\/execute', rejectLegacyRiasec/u);
assert.match(atsRoutes, /router\.get\('\/tests\/available', hideRetiredRiasec/u);
assert.equal(exists('src/components/tests/riasec/RiasecAnalyzer.ts'), false);
assert.equal(exists('src/data/riasecQuestions.ts'), false);
assert.doesNotMatch(readme, /RIASEC scientifiquement valid/u);
assert.match(readme, /outil d’exploration des intérêts/iu);

const migrationIndex = deployScript.indexOf('api node scripts/migrate.js up');
const seedIndex = deployScript.indexOf('api node scripts/seed-riasec.js');
const apiRestartIndex = deployScript.lastIndexOf('up -d --no-deps --force-recreate api');
assert.ok(migrationIndex >= 0, 'production deploy must apply migrations');
assert.ok(seedIndex > migrationIndex, 'RIASEC seed must run after migrations');
assert.ok(apiRestartIndex > seedIndex, 'RIASEC seed must finish before the final API restart');
assert.match(deployScript, /riasec-seed-report\.json/u);
assert.match(deployScript, /instrumentId.*riasec-makoki-fr-draft-v2/u);
assert.match(deployScript, /itemCount.*60/u);

console.log(JSON.stringify({
  status: 'passed',
  canonicalEngine: 'backend/src/orientation/riasec/scoring.js',
  algorithmVersion: 'riasec-makoki-scoring-v2',
  canonicalRoute: '/api/v1/orientation',
  canonicalJourney: '/parcours',
  guestSoftGate: true,
  publicCareerCatalog: true,
  unifiedReport: 'src/features/life-project/LifeProjectWorkspace.tsx',
  ownedResultVerification: true,
  retiredFrontendAnalyzers: 1,
  retiredLegacyAtsRoutes: 2,
  productionSeed: 'migration -> seed-riasec -> api restart',
}, null, 2));
console.log('RIASEC SINGLE ENGINE, GUEST SOFT GATE AND UNIFIED REPORT VERIFICATION PASSED');