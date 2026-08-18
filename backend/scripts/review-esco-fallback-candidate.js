'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');

const REGISTRY_PATH = path.resolve(__dirname, '../data/esco/onet-esco-reviewed-overrides.json');
const ONET_CODE_RE = /^\d{2}-\d{4}(?:\.\d{2})?$/u;
const ESCO_URI_RE = /^https?:\/\/data\.europa\.eu\/esco\/occupation\/[0-9a-f-]+$/iu;

const parseArgs = (argv) => {
  const args = Object.fromEntries(
    argv.slice(2).map((entry) => {
      const index = entry.indexOf('=');
      if (!entry.startsWith('--') || index === -1) return [entry, true];
      return [entry.slice(2, index), entry.slice(index + 1)];
    }),
  );
  const onetCode = String(args['onet-code'] || '').trim();
  const escoUri = String(args['esco-uri'] || '').trim();
  if (!ONET_CODE_RE.test(onetCode)) throw new Error('Use --onet-code=NN-NNNN.NN');
  if (!ESCO_URI_RE.test(escoUri)) throw new Error('Use --esco-uri=http(s)://data.europa.eu/esco/occupation/<uuid>');
  return { onetCode, escoUri };
};

const loadPendingEntry = (onetCode) => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const entry = registry.entries.find((candidate) => candidate.onetCode === onetCode);
  if (!entry) throw new Error(`${onetCode} is not present in the governed fallback registry.`);
  if (entry.status !== 'pending') throw new Error(`${onetCode} is ${entry.status}, not pending.`);
  return entry;
};

const reviewCandidate = async ({ pool, onetCode, escoUri }) => {
  const registryEntry = loadPendingEntry(onetCode);

  const [[onet]] = await pool.query(
    `SELECT occupation.id, occupation.source_code, occupation.preferred_label, occupation.description,
            occupation.riasec_profile_status, occupation.local_relevance_status,
            source.source_version, source.content_sha256
     FROM career_occupations occupation
     JOIN career_catalog_sources source ON source.id = occupation.catalog_source_id
     WHERE source.source_kind = 'onet'
       AND source.source_version = '30.3'
       AND occupation.locale = 'en'
       AND occupation.status = 'active'
       AND occupation.source_code = ?
     LIMIT 1`,
    [onetCode],
  );
  if (!onet) throw new Error(`Active O*NET 30.3 occupation not found: ${onetCode}`);

  const [[esco]] = await pool.query(
    `SELECT occupation.id, occupation.source_code, occupation.preferred_label, occupation.description,
            occupation.isco_code, occupation.status,
            source.source_version, source.content_sha256
     FROM career_occupations occupation
     JOIN career_catalog_sources source ON source.id = occupation.catalog_source_id
     WHERE source.source_kind = 'esco'
       AND source.source_version = '1.2.1'
       AND occupation.locale = 'fr'
       AND occupation.status = 'active'
       AND occupation.source_code = ?
     LIMIT 1`,
    [escoUri],
  );
  if (!esco) throw new Error(`Active French ESCO 1.2.1 occupation not found for URI: ${escoUri}`);

  const [[existing]] = await pool.query(
    `SELECT mapping_kind, review_status, confidence_level, source_reference, source_version
     FROM career_occupation_crosswalks
     WHERE source_occupation_id = ? AND target_occupation_id = ?
     LIMIT 1`,
    [onet.id, esco.id],
  );

  const [[anyForOnet]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM career_occupation_crosswalks
     WHERE source_occupation_id = ?`,
    [onet.id],
  );

  return {
    generatedAt: new Date().toISOString(),
    registry: {
      onetCode: registryEntry.onetCode,
      title: registryEntry.title,
      status: registryEntry.status,
    },
    source: {
      id: onet.id,
      code: onet.source_code,
      title: onet.preferred_label,
      description: onet.description,
      riasecProfileStatus: onet.riasec_profile_status,
      localRelevanceStatus: onet.local_relevance_status,
      version: onet.source_version,
      contentSha256: onet.content_sha256,
    },
    candidate: {
      id: esco.id,
      uri: esco.source_code,
      title: esco.preferred_label,
      description: esco.description,
      iscoCode: esco.isco_code,
      version: esco.source_version,
      contentSha256: esco.content_sha256,
    },
    existingCrosswalk: existing || null,
    sourceCrosswalkCount: Number(anyForOnet.count || 0),
    decisionSupport: {
      registryEntryIsPending: true,
      sourceIsActiveOnet30_3: true,
      targetIsActiveFrenchEsco1_2_1: true,
      pairHasNoExistingCrosswalk: !existing,
      noDatabaseMutationPerformed: true,
      nextStep: 'Compare scope and granularity, then document mappingKind, evidenceUrl, reviewer, date and justification before any reviewed mapping is created.',
    },
  };
};

const main = async () => {
  const { onetCode, escoUri } = parseArgs(process.argv);
  const pool = createDatabasePool(process.env);
  try {
    const report = await reviewCandidate({ pool, onetCode, escoUri });
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`ESCO fallback candidate review failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { loadPendingEntry, parseArgs, reviewCandidate };
