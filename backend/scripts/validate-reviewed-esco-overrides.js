'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_REGISTRY = path.resolve(__dirname, '../data/esco/onet-esco-reviewed-overrides.json');
const ONET_CODE_RE = /^\d{2}-\d{4}(?:\.\d{2})?$/u;
const ESCO_OCCUPATION_URI_RE = /^https?:\/\/data\.europa\.eu\/esco\/occupation\/[0-9a-f-]+$/iu;
const ALLOWED_STATUSES = new Set(['pending', 'reviewed', 'rejected']);
const ALLOWED_MAPPING_KINDS = new Set(['exact', 'close', 'narrow', 'broad']);

const validateRegistry = (registry) => {
  if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.entries)) {
    throw new Error('Invalid ESCO override registry schema.');
  }
  const seen = new Set();
  for (const entry of registry.entries) {
    if (!ONET_CODE_RE.test(String(entry.onetCode || ''))) throw new Error(`Invalid O*NET code: ${entry.onetCode}`);
    if (!String(entry.title || '').trim()) throw new Error(`Missing title for ${entry.onetCode}`);
    if (!ALLOWED_STATUSES.has(entry.status)) throw new Error(`Invalid status for ${entry.onetCode}: ${entry.status}`);
    if (seen.has(entry.onetCode)) throw new Error(`Duplicate O*NET code: ${entry.onetCode}`);
    seen.add(entry.onetCode);

    if (entry.status === 'reviewed') {
      if (!ESCO_OCCUPATION_URI_RE.test(String(entry.targetEscoUri || ''))) throw new Error(`Reviewed mapping ${entry.onetCode} is missing a valid ESCO occupation URI.`);
      if (!ALLOWED_MAPPING_KINDS.has(entry.mappingKind)) throw new Error(`Reviewed mapping ${entry.onetCode} has an invalid mapping kind.`);
      if (!/^https:\/\//u.test(String(entry.evidenceUrl || ''))) throw new Error(`Reviewed mapping ${entry.onetCode} requires an HTTPS evidence URL.`);
      if (!String(entry.reviewedBy || '').trim()) throw new Error(`Reviewed mapping ${entry.onetCode} requires reviewedBy.`);
      if (!/^\d{4}-\d{2}-\d{2}$/u.test(String(entry.reviewedAt || ''))) throw new Error(`Reviewed mapping ${entry.onetCode} requires reviewedAt YYYY-MM-DD.`);
      if (String(entry.justification || '').trim().length < 20) throw new Error(`Reviewed mapping ${entry.onetCode} requires a substantive justification.`);
    }
  }
  return {
    entries: registry.entries.length,
    pending: registry.entries.filter((entry) => entry.status === 'pending').length,
    reviewed: registry.entries.filter((entry) => entry.status === 'reviewed').length,
    rejected: registry.entries.filter((entry) => entry.status === 'rejected').length,
  };
};

const main = () => {
  const registryPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_REGISTRY;
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const summary = validateRegistry(registry);
  process.stdout.write(`${JSON.stringify({ registryPath, ...summary }, null, 2)}\n`);
};

if (require.main === module) {
  try { main(); }
  catch (error) { process.stderr.write(`ESCO override registry validation failed: ${error.message}\n`); process.exitCode = 1; }
}

module.exports = { validateRegistry };
