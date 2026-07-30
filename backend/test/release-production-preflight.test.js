'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '../..');
const diskScript = path.join(repoRoot, 'scripts/release/prepare-docker-build-space.sh');
const webBuildScript = path.join(repoRoot, 'scripts/release/enable-life-project-web-build.sh');

const writeExecutable = (file, content) => {
  fs.writeFileSync(file, content, { mode: 0o755 });
};

test('Docker space preflight prunes only unused resources and failed release worktrees', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-v6h-space-'));
  const fakeBin = path.join(directory, 'bin');
  const dockerRoot = path.join(directory, 'docker');
  const releases = path.join(directory, 'releases');
  const stateFile = path.join(directory, 'available-kb');
  const currentLink = path.join(directory, 'current');
  const deploymentsFile = path.join(directory, 'deployments.tsv');
  const currentSha = '1'.repeat(40);
  const successfulSha = '2'.repeat(40);
  const failedSha = '3'.repeat(40);

  fs.mkdirSync(fakeBin);
  fs.mkdirSync(dockerRoot);
  fs.mkdirSync(releases);
  for (const sha of [currentSha, successfulSha, failedSha]) {
    fs.mkdirSync(path.join(releases, sha, '.git'), { recursive: true });
    fs.writeFileSync(path.join(releases, sha, 'marker'), sha);
  }
  fs.symlinkSync(path.join(releases, currentSha), currentLink);
  fs.writeFileSync(deploymentsFile, `20260730T000000Z\t${successfulSha}\t/backup\n`);
  fs.writeFileSync(stateFile, '100000\n');

  writeExecutable(path.join(fakeBin, 'df'), `#!/usr/bin/env bash\ncat <<EOF\nFilesystem 1024-blocks Used Available Capacity Mounted on\n/dev/fake 10000000 9000000 $(cat ${JSON.stringify(stateFile)}) 90% /fake\nEOF\n`);
  writeExecutable(path.join(fakeBin, 'docker'), `#!/usr/bin/env bash\nset -e\ncase "$1 $2" in\n  "system df") echo 'fake docker system df' ;;\n  "builder prune") echo 5000000 >${JSON.stringify(stateFile)} ;;\n  "container prune") : ;;\n  "image prune") : ;;\n  *) echo "unexpected docker command: $*" >&2; exit 9 ;;\nesac\n`);

  try {
    const output = execFileSync('bash', [diskScript, releases, currentLink, deploymentsFile], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${fakeBin}:${process.env.PATH}`,
        DOCKER_ROOT_OVERRIDE: dockerRoot,
        MINIMUM_DOCKER_FREE_KB: '4194304',
      },
    });

    assert.match(output, /Docker build space preflight passed/u);
    assert.equal(fs.existsSync(path.join(releases, currentSha)), true);
    assert.equal(fs.existsSync(path.join(releases, successfulSha)), true);
    assert.equal(fs.existsSync(path.join(releases, failedSha)), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('web Dockerfile patch normalizes an existing Projet de vie flag before the Vite build', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'makoki-v6h-web-build-'));
  const dockerfile = path.join(directory, 'Dockerfile.web');
  fs.writeFileSync(dockerfile, [
    'FROM node:20-alpine AS build',
    'ARG VITE_LIFE_PROJECT_ENABLED',
    'ENV VITE_LIFE_PROJECT_ENABLED=$VITE_LIFE_PROJECT_ENABLED',
    'WORKDIR /app',
    'COPY package.json package-lock.json ./',
    'RUN npm ci --legacy-peer-deps',
    'COPY . .',
    'RUN npm run build',
    'FROM nginx:alpine',
    '',
  ].join('\n'), { mode: 0o644 });

  try {
    execFileSync('bash', [webBuildScript, dockerfile], { encoding: 'utf8' });
    const first = fs.readFileSync(dockerfile, 'utf8');
    execFileSync('bash', [webBuildScript, dockerfile], { encoding: 'utf8' });
    const second = fs.readFileSync(dockerfile, 'utf8');

    assert.equal(second, first, 'normalization must be idempotent');
    assert.match(first, /ARG VITE_LIFE_PROJECT_ENABLED=false\nENV VITE_LIFE_PROJECT_ENABLED=\$\{VITE_LIFE_PROJECT_ENABLED\}/u);
    assert.equal((first.match(/^ARG VITE_LIFE_PROJECT_ENABLED=false$/gmu) || []).length, 1);
    assert.equal((first.match(/^ENV VITE_LIFE_PROJECT_ENABLED=\$\{VITE_LIFE_PROJECT_ENABLED\}$/gmu) || []).length, 1);
    assert.equal(first.includes('ENV VITE_LIFE_PROJECT_ENABLED=$VITE_LIFE_PROJECT_ENABLED'), false);
    assert.ok(first.indexOf('ARG VITE_LIFE_PROJECT_ENABLED=false') < first.indexOf('RUN npm run build'));
    assert.equal(fs.statSync(dockerfile).mode & 0o777, 0o644);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
