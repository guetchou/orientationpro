const { execFileSync } = require('node:child_process');

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const violations = {
  environmentFiles: trackedFiles.filter((file) => (
    file === '.env' || file === '.env.demo' || file === 'backend/.env'
  )).length,
  privateUploads: trackedFiles.filter((file) => (
    file.startsWith('backend/uploads/') && file !== 'backend/uploads/.gitkeep'
  )).length,
  privateKeys: trackedFiles.filter((file) => (
    /(^|\/)(id_rsa|id_ed25519|.*\.(pem|p12|pfx))$/i.test(file)
  )).length,
};

if (Object.values(violations).some((count) => count > 0)) {
  console.error(`Sensitive tracked-path check failed: ${JSON.stringify(violations)}`);
  process.exit(1);
}

console.log('Sensitive tracked-path check passed.');
