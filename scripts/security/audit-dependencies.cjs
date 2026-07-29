'use strict';

const { spawnSync } = require('node:child_process');
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const targets = [
  ['root', ['audit', '--omit=dev', '--audit-level=high']],
  ['backend', ['--prefix', 'backend', 'audit', '--omit=dev', '--audit-level=high']],
];
let failed = false;

for (const [name, args] of targets) {
  process.stdout.write(`Dependency audit: ${name}\n`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`Dependency audit could not start for ${name}: ${result.error.code || 'unknown'}`);
    failed = true;
  } else if (result.status !== 0) {
    failed = true;
  }
}

if (failed) process.exitCode = 1;
