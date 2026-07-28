'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createConfig, loadEscoDataset, parseCrosswalk, parseCrosswalkCsv, parseCsv, parseOccupationSkillRelations, parseOccupations, parseSkills, persistEscoDataset } = require('../scripts/import-esco-catalog');

const dataset = () => ({
  occupations: [{ uri: 'http://data.europa.eu/esco/occupation/nurse', code: 'nurse', iscoCode: '2221', preferredLabel: 'infirmier/infirmière', description: 'Dispense des soins.', aliases: ['infirmier'], status: 'active', metadata: {} }],
  skills: [{ uri: 'http://data.europa.eu/esco/skill/care', code: 'care', preferredLabel: 'prodiguer des soins', description: 'Fournir des soins.', kind: 'skill', metadata: {} }],
  occupationSkillRelations: [{ occupationUri: 'http://data.europa.eu/esco/occupation/nurse', skillUri: 'http://data.europa.eu/esco/skill/care', relationKind: 'essential', sourceRelation: 'essential' }],
  crosswalk: [{ onetCode: '29-1141.00', escoUri: 'http://data.europa.eu/esco/occupation/nurse', mappingKind: 'close', confidenceScore: null, confidenceLevel: 'unknown', mappedAt: null, sourceRow: {} }],
  files: {}, contentSha256: 'e'.repeat(64),
});
const config = (overrides = {}) => ({ sourceId: 'esco:1.2.1:fr', version: '1.2.1', locale: 'fr', accessDate: '2026-07-28', crosswalkUrl: 'https://example.test/crosswalk.csv', onetVersion: '30.3', minCrosswalks: 1, allowSourceReplace: false, ...overrides });
const fakePool = ({ existing = null, failOn = null } = {}) => {
  const state = { began: 0, committed: 0, rolledBack: 0, statements: [] };
  const connection = {
    query: async (sql) => { state.statements.push(sql); if (/SELECT content_sha256/u.test(sql)) return [[existing].filter(Boolean)]; if (/source_code/u.test(sql)) return [[{ id: 'onet:job', source_code: '29-1141.00' }]]; return [[]]; },
    execute: async (sql) => { state.statements.push(sql); if (failOn && sql.includes(failOn)) throw new Error('forced database failure'); return [{ affectedRows: 1 }]; },
    beginTransaction: async () => { state.began += 1; }, commit: async () => { state.committed += 1; }, rollback: async () => { state.rolledBack += 1; }, release: () => {},
  };
  return { state, pool: { getConnection: async () => connection } };
};

test('parses French ESCO CSV, aliases, skills and relations', () => {
  const [occupation] = parseOccupations(parseCsv('conceptUri,preferredLabel,description,altLabels,iscoGroup\nuri:o,"ingénieur/ingénieure","Conçoit.","ingénieur|ingénieure",2149\n'));
  assert.equal(occupation.preferredLabel, 'ingénieur/ingénieure');
  assert.deepEqual(occupation.aliases, ['ingénieur', 'ingénieure']);
  assert.equal(parseSkills(parseCsv('conceptUri,preferredLabel,skillType\nuri:s,soigner,skill\n'))[0].preferredLabel, 'soigner');
  assert.equal(parseOccupationSkillRelations(parseCsv('occupationUri,skillUri,relationType\nuri:o,uri:s,essential\n'))[0].relationKind, 'essential');
});

test('official crosswalk keeps provenance without invented validation, score or date', () => {
  const [mapping] = parseCrosswalk([{ 'O*NET concept URI': 'https://onet/29-1141.00', 'ESCO concept URI': 'http://data.europa.eu/esco/occupation/nurse', mappingRelation: 'closeMatch' }]);
  assert.equal(mapping.onetCode, '29-1141.00');
  assert.equal(mapping.mappingKind, 'close');
  assert.equal(mapping.confidenceScore, null);
  assert.equal(mapping.confidenceLevel, 'unknown');
  assert.equal(mapping.mappedAt, null);
  assert.equal(Object.hasOwn(mapping, 'reviewStatus'), false);
});

test('official crosswalk skips its metadata preamble and recognizes published headers', () => {
  const [mapping] = parseCrosswalkCsv([
    'Mapping project name,ESCO-O*NET Crosswalk,,,,,',
    'Classification 1 Name,O*NET,,,,,',
    ',,,,,,',
    'O*NET Id,O*NET Title,O*NET Description,ESCO or ISCO URI,ESCO or ISCO Title,ESCO or ISCO Description,Type of Match',
    '29-1141.00,Registered Nurses,,http://data.europa.eu/esco/occupation/nurse,infirmier,,exactMatch',
  ].join('\n'));
  assert.equal(mapping.onetCode, '29-1141.00');
  assert.equal(mapping.escoUri, 'http://data.europa.eu/esco/occupation/nurse');
  assert.equal(mapping.mappingKind, 'exact');
});

test('crosswalk preserves a confidence and date only when the source provides them', () => {
  const [mapping] = parseCrosswalk([{
    onetCode: '29-1141.00',
    escoUri: 'http://data.europa.eu/esco/occupation/nurse',
    mappingRelation: 'exactMatch',
    confidenceScore: '0.92',
    mappingDate: '2023-08-10',
  }]);
  assert.equal(mapping.mappingKind, 'exact');
  assert.equal(mapping.confidenceScore, 92);
  assert.equal(mapping.confidenceLevel, 'high');
  assert.equal(mapping.mappedAt, '2023-08-10');
});

test('config pins version, locale, thresholds and replacement guard', () => {
  const value = createConfig({ ESCO_ARCHIVE_PATH: '/tmp/esco.zip' });
  assert.equal(value.sourceId, 'esco:1.2.1:fr');
  assert.equal(value.minOccupations, 2900);
  assert.equal(value.minSkills, 13000);
  assert.equal(value.minCrosswalks, 1000);
  assert.equal(value.allowSourceReplace, false);
});

test('local package computes hashes and enforces minimum volumes', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'esco-test-'));
  try {
    await fs.writeFile(path.join(directory, 'occupations_fr.csv'), 'conceptUri,preferredLabel\nuri:o,infirmier\n');
    await fs.writeFile(path.join(directory, 'skills_fr.csv'), 'conceptUri,preferredLabel\nuri:s,soigner\n');
    await fs.writeFile(path.join(directory, 'occupationSkillRelations.csv'), 'occupationUri,skillUri,relationType\nuri:o,uri:s,essential\n');
    const crosswalk = path.join(directory, 'crosswalk.csv');
    await fs.writeFile(crosswalk, 'onetCode,escoUri,mappingRelation\n29-1141.00,uri:o,exactMatch\n');
    const cfg = createConfig({ ESCO_ARCHIVE_PATH: directory, ESCO_CROSSWALK_PATH: crosswalk, ESCO_MIN_OCCUPATIONS: '1', ESCO_MIN_SKILLS: '1', ESCO_MIN_CROSSWALKS: '1' });
    const loaded = await loadEscoDataset(cfg);
    assert.match(loaded.contentSha256, /^[a-f0-9]{64}$/u);
    await assert.rejects(loadEscoDataset({ ...cfg, minOccupations: 2 }), /below 2/u);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('import is transactional, idempotent and preserves local/reviewed data', async () => {
  const first = fakePool();
  const result = await persistEscoDataset({ config: config(), dataset: dataset(), pool: first.pool });
  assert.equal(result.crosswalks, 1);
  assert.deepEqual(result.confidenceDistribution, { high: 0, medium: 0, low: 0, unknown: 1 });
  assert.equal(first.state.committed, 1);
  assert.ok(first.state.statements.some((sql) => /alias_kind\s*=\s*'alternate'/u.test(sql)));
  assert.ok(first.state.statements.some((sql) => /review_status IN \('proposed',\s*'official'\)/u.test(sql)));
  const repeated = fakePool({ existing: { content_sha256: dataset().contentSha256 } });
  await persistEscoDataset({ config: config(), dataset: dataset(), pool: repeated.pool });
  assert.equal(repeated.state.committed, 1);
});

test('refuses silent replacement and rolls back failures', async () => {
  await assert.rejects(persistEscoDataset({ config: config(), dataset: dataset(), pool: fakePool({ existing: { content_sha256: '0'.repeat(64) } }).pool }), /Pinned source/u);
  const failing = fakePool({ failOn: 'INSERT INTO career_skills' });
  await assert.rejects(persistEscoDataset({ config: config(), dataset: dataset(), pool: failing.pool }), /forced database failure/u);
  assert.equal(failing.state.rolledBack, 1);
});
