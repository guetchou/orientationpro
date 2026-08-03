'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const assertionScript = path.join(repoRoot, 'scripts/release/assert-life-project-compose-config.cjs');
const overridePath = path.join(repoRoot, 'scripts/release/life-project-compose.override.yml');
const deploymentScript = path.join(repoRoot, 'scripts/deploy-production-vps.sh');
const productionWorkflowPath = path.join(repoRoot, '.github/workflows/production-deploy.yml');
const webBuildNormalizerPath = path.join(repoRoot, 'scripts/release/enable-life-project-web-build.sh');

const validConfig = {
  services: {
    api: {
      environment: {
        AUTH_V1_ENABLED: 'true',
        LIFE_PROJECT_API_ENABLED: 'true',
        LEGACY_AUTH_ENABLED: 'false',
        LEGACY_API_ENABLED: 'false',
        DATA_RIGHTS_API_ENABLED: 'false',
        RIASEC_API_ENABLED: 'false',
        RIASEC_ALLOW_DRAFT: 'false',
        CAREER_API_ENABLED: 'false',
        CV_API_V1_ENABLED: 'true',
        FEATURE_CHATBOT: 'false',
        FEATURE_ANALYTICS: 'false',
      },
    },
    web: {
      build: {
        args: {
          VITE_LIFE_PROJECT_ENABLED: 'true',
          VITE_CV_ANALYSIS_ENABLED: 'true',
        },
      },
    },
  },
};

test('resolved Compose assertion accepts Projet de vie with CV V1 enabled', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-cv-compose-'));
  const configPath = path.join(directory, 'compose.json');
  fs.writeFileSync(configPath, JSON.stringify(validConfig));

  try {
    const output = execFileSync(process.execPath, [assertionScript, configPath], { encoding: 'utf8' });
    assert.match(output, /satisfies Projet de vie and CV V1/u);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('resolved Compose assertion rejects a disabled CV runtime or missing web flag', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-cv-compose-invalid-'));
  const configPath = path.join(directory, 'compose.json');
  fs.writeFileSync(configPath, JSON.stringify({
    ...validConfig,
    services: {
      ...validConfig.services,
      api: {
        environment: {
          ...validConfig.services.api.environment,
          CV_API_V1_ENABLED: 'false',
        },
      },
      web: {
        build: { args: { VITE_LIFE_PROJECT_ENABLED: 'true' } },
      },
    },
  }));

  try {
    const result = spawnSync(process.execPath, [assertionScript, configPath], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /CV_API_V1_ENABLED|VITE_CV_ANALYSIS_ENABLED/u);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('versioned Compose override contains every production boundary', () => {
  const override = fs.readFileSync(overridePath, 'utf8');
  for (const expected of [
    'AUTH_V1_ENABLED: "true"',
    'LIFE_PROJECT_API_ENABLED: "true"',
    'VITE_LIFE_PROJECT_ENABLED: "true"',
    'CV_API_V1_ENABLED: "true"',
    'VITE_CV_ANALYSIS_ENABLED: "true"',
    'LEGACY_AUTH_ENABLED: "false"',
    'RIASEC_API_ENABLED: "false"',
    'CAREER_API_ENABLED: "false"',
    'DATA_RIGHTS_API_ENABLED: "false"',
    'FEATURE_CHATBOT: "false"',
    'FEATURE_ANALYTICS: "false"',
  ]) {
    assert.ok(override.includes(expected), expected);
  }
});

test('web Dockerfile normalizer injects both Vite flags once before build', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-cv-web-build-'));
  const dockerfile = path.join(directory, 'Dockerfile.web');
  fs.writeFileSync(dockerfile, 'FROM node:22\nARG VITE_CV_ANALYSIS_ENABLED=legacy\nENV VITE_CV_ANALYSIS_ENABLED=legacy\nRUN npm run build\n');

  try {
    execFileSync('bash', [webBuildNormalizerPath, dockerfile], { encoding: 'utf8' });
    execFileSync('bash', [webBuildNormalizerPath, dockerfile], { encoding: 'utf8' });
    const normalized = fs.readFileSync(dockerfile, 'utf8');
    for (const marker of [
      'ARG VITE_LIFE_PROJECT_ENABLED=false',
      'ENV VITE_LIFE_PROJECT_ENABLED=${VITE_LIFE_PROJECT_ENABLED}',
      'ARG VITE_CV_ANALYSIS_ENABLED=false',
      'ENV VITE_CV_ANALYSIS_ENABLED=${VITE_CV_ANALYSIS_ENABLED}',
    ]) {
      assert.equal(normalized.split(marker).length - 1, 1, marker);
      assert.ok(normalized.indexOf(marker) < normalized.indexOf('RUN npm run build'), marker);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('production workflow proves guest orientation, public careers, protected project and active CV V1', () => {
  const workflow = fs.readFileSync(productionWorkflowPath, 'utf8');
  assert.match(workflow, /const riasec = byId\('orientation\.riasec'\)/u);
  assert.match(workflow, /riasec\.status !== 'experimental'/u);
  assert.match(workflow, /riasec\.configured !== true/u);
  assert.match(workflow, /const publicCareerCatalog = byId\('career\.catalog-public-v1'\)/u);
  assert.match(workflow, /api\/v1\/orientation\/riasec\/instrument/u);
  assert.match(workflow, /api\/v1\/orientation\/results\?limit=1/u);
  assert.match(workflow, /makoki_guest_orientation/u);
  assert.match(workflow, /api\/v1\/career\/catalog\/summary/u);
  assert.match(workflow, /api\/v1\/career\/occupations/u);
  assert.match(workflow, /unauthenticated_status[\s\S]*api\/v1\/life-projects/u);
  assert.match(workflow, /test "\$\{unauthenticated_status\}" = 401/u);
  assert.match(workflow, /cv_unauthenticated_status[\s\S]*api\/v1\/cv\/analyses/u);
  assert.match(workflow, /test "\$\{cv_unauthenticated_status\}" = 401/u);
  assert.match(workflow, /const cv = byId\('cv\.analysis-v1'\)/u);
  assert.match(workflow, /cv\.status !== 'active'/u);
  assert.match(workflow, /cv\.configured !== true/u);

  const disabledCapabilities = workflow.match(/for \(const id of \[([\s\S]*?)\]\) \{/u);
  assert.ok(disabledCapabilities, 'production workflow must verify disabled capabilities');
  assert.doesNotMatch(disabledCapabilities[1], /orientation\.riasec/u);
  assert.doesNotMatch(disabledCapabilities[1], /career\.catalog-public-v1/u);
  assert.doesNotMatch(disabledCapabilities[1], /cv\.analysis-v1/u);
  assert.match(disabledCapabilities[1], /career\.recommendations/u);
  assert.match(disabledCapabilities[1], /privacy\.data-rights-v1/u);
  assert.match(disabledCapabilities[1], /ats\.workflow-v1/u);
});

test('production deploy applies the release override only to the new release, not rollback', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  assert.match(script, /rollback_compose=\([\s\S]*-f "\$\{compose_file\}"[\s\S]*\)/u);
  assert.match(script, /compose=\([\s\S]*"\$\{rollback_compose\[@\]\}"[\s\S]*-f "\$\{compose_override\}"[\s\S]*\)/u);
  assert.match(script, /"\$\{rollback_compose\[@\]\}" up -d --no-deps --force-recreate api web/u);
  assert.doesNotMatch(script, /"\$\{compose\[@\]\}" up -d --no-deps --force-recreate api web \|\| true/u);
});

test('production deploy validates the release script through Bash instead of executable mode', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  assert.match(script, /require_nonempty_file "\$\{release\}\/scripts\/deploy-production-vps\.sh"/u);
  assert.match(script, /bash -n "\$\{release\}\/scripts\/deploy-production-vps\.sh"/u);
  assert.doesNotMatch(script, /test -x "\$\{release\}\/scripts\/deploy-production-vps\.sh"/u);
});

test('production deploy reinitializes only an incomplete non-current release', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  assert.match(script, /current_release=\$\(readlink -f "\$\{deploy_root\}\/current"/u);
  assert.match(script, /-d "\$\{release\}\/\.git" && "\$\{current_release\}" != "\$\{release\}"/u);
  assert.match(script, /git -C "\$\{release\}" reset --hard "\$\{sha\}"/u);
  assert.match(script, /git -C "\$\{release\}" clean -ffd/u);
});

test('production deploy reports named stages before mutating production', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  for (const stage of [
    'lock-and-host',
    'protected-assets',
    'repository-mirror',
    'docker-space',
    'release-checkout',
    'protected-release-copy',
    'web-dockerfile-normalization',
    'release-environment',
    'database-backup',
    'image-build',
    'migrations',
    'api-restart',
    'web-restart',
    'completed',
  ]) {
    assert.match(script, new RegExp(`stage ${stage}`, 'u'));
  }
});

test('production deploy falls back only to the currently served protected VPS files', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  assert.match(script, /protected_vps_source="\$\{source_checkout\}\/\.vps"/u);
  assert.match(script, /if \[\[ ! -f "\$\{protected_vps_source\}\/docker-compose\.yml" \]\]; then[\s\S]*stage protected-vps-fallback/u);
  assert.match(script, /protected_vps_source="\$\{current_release\}\/\.vps"/u);
  assert.match(script, /current release is outside the protected release root/u);
  assert.match(script, /require_file "\$\{protected_vps_source\}\/docker-compose\.yml"/u);
  assert.match(script, /require_file "\$\{protected_vps_source\}\/Dockerfile\.web"/u);
  assert.match(script, /cp -a "\$\{protected_vps_source\}\/\." "\$\{release\}\/\.vps\/"/u);
  assert.doesNotMatch(script, /cp -a "\$\{source_checkout\}\/\.vps\/\."/u);
});

test('production deploy keeps secrets and backend Docker assets in the protected source checkout', () => {
  const script = fs.readFileSync(deploymentScript, 'utf8');
  assert.match(script, /require_nonempty_file "\$\{source_checkout\}\/\.env\.vps"/u);
  assert.match(script, /install -m 600 "\$\{source_checkout\}\/\.env\.vps" "\$\{env_file\}"/u);
  assert.match(script, /install -m 644 "\$\{source_checkout\}\/backend\/Dockerfile\.vps"/u);
  assert.match(script, /install -m 644 "\$\{source_checkout\}\/backend\/\.dockerignore"/u);
});
