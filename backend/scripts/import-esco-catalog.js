'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');

const DEFAULT_VERSION = '1.2.1';
const DEFAULT_LOCALE = 'fr';
const OFFICIAL_DOWNLOAD_PAGE = 'https://esco.ec.europa.eu/en/use-esco/download';
const OFFICIAL_CROSSWALK_URL = 'https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv';
const OFFICIAL_CROSSWALK_REPORT = 'https://esco.ec.europa.eu/en/about-esco/publications/publication/crosswalk-between-esco-and-onet-technical-report';
const LICENSE_NAME = 'Creative Commons Attribution 4.0 International';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

const positiveInteger = (value, fallback, name) => {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1) throw new TypeError(`${name} must be a positive integer`);
  return number;
};

const createConfig = (env = process.env) => {
  const version = String(env.ESCO_VERSION || DEFAULT_VERSION).trim();
  const locale = String(env.ESCO_LOCALE || DEFAULT_LOCALE).trim().toLowerCase();
  const archivePath = env.ESCO_ARCHIVE_PATH ? path.resolve(env.ESCO_ARCHIVE_PATH) : null;
  const archiveUrl = env.ESCO_ARCHIVE_URL ? String(env.ESCO_ARCHIVE_URL) : null;
  if (!version) throw new Error('ESCO_VERSION is required.');
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/u.test(locale)) throw new Error(`Unsupported ESCO_LOCALE: ${locale}`);
  if (!archivePath && !archiveUrl) throw new Error('ESCO_ARCHIVE_PATH or ESCO_ARCHIVE_URL is required.');
  return {
    version,
    locale,
    sourceId: `esco:${version}:${locale}`,
    archivePath,
    archiveUrl,
    crosswalkPath: env.ESCO_CROSSWALK_PATH ? path.resolve(env.ESCO_CROSSWALK_PATH) : null,
    crosswalkUrl: env.ESCO_CROSSWALK_URL || OFFICIAL_CROSSWALK_URL,
    cacheDir: path.resolve(env.ESCO_CACHE_DIR || path.join(os.tmpdir(), 'makoki-esco-cache', version, locale)),
    minOccupations: positiveInteger(env.ESCO_MIN_OCCUPATIONS, 2900, 'ESCO_MIN_OCCUPATIONS'),
    minSkills: positiveInteger(env.ESCO_MIN_SKILLS, 13000, 'ESCO_MIN_SKILLS'),
    downloadAttempts: positiveInteger(env.ESCO_DOWNLOAD_ATTEMPTS, 4, 'ESCO_DOWNLOAD_ATTEMPTS'),
    downloadTimeoutMs: positiveInteger(env.ESCO_DOWNLOAD_TIMEOUT_MS, 180000, 'ESCO_DOWNLOAD_TIMEOUT_MS'),
    accessDate: env.ESCO_ACCESS_DATE || new Date().toISOString().slice(0, 10),
    onetVersion: env.ONET_VERSION || '30.3',
    allowSourceReplace: env.ALLOW_SOURCE_REPLACE === 'true',
  };
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const downloadBuffer = async (url, options = {}) => {
  const attempts = options.attempts || 4;
  const timeoutMs = options.timeoutMs || 180000;
  const fetchImpl = options.fetchImpl || fetch;
  const sleepImpl = options.sleepImpl || sleep;
  let latestError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: { accept: 'application/zip,text/csv,application/octet-stream;q=0.9,*/*;q=0.8', 'accept-encoding': 'identity', 'user-agent': 'MAKOKI ESCO importer/1.0' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      latestError = error;
      if (attempt === attempts) break;
      await sleepImpl(Math.min(1000 * (2 ** (attempt - 1)), 8000));
    }
  }
  throw new Error(`ESCO download failed after ${attempts} attempts for ${url}`, { cause: latestError });
};

const readOrDownload = async ({ filePath, url, cachePath, config, dependencies = {} }) => {
  if (filePath) return fs.readFile(filePath);
  try {
    return await fs.readFile(cachePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const buffer = await downloadBuffer(url, {
    attempts: config.downloadAttempts,
    timeoutMs: config.downloadTimeoutMs,
    fetchImpl: dependencies.fetchImpl,
    sleepImpl: dependencies.sleepImpl,
  });
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  const temporary = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, buffer, { mode: 0o600 });
  await fs.rename(temporary, cachePath);
  return buffer;
};

const readZipEntries = async (buffer, wanted) => {
  const yauzl = require('yauzl');
  const zipFile = await new Promise((resolve, reject) => yauzl.fromBuffer(buffer, { lazyEntries: true }, (error, zip) => error ? reject(error) : resolve(zip)));
  const found = new Map();
  await new Promise((resolve, reject) => {
    zipFile.once('error', reject);
    zipFile.once('end', resolve);
    zipFile.on('entry', (entry) => {
      const target = wanted.find(({ pattern }) => pattern.test(path.posix.basename(entry.fileName)));
      if (!target || found.has(target.key)) return zipFile.readEntry();
      zipFile.openReadStream(entry, (error, stream) => {
        if (error) return reject(error);
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.once('error', reject);
        stream.once('end', () => {
          found.set(target.key, { fileName: entry.fileName, buffer: Buffer.concat(chunks) });
          zipFile.readEntry();
        });
      });
    });
    zipFile.readEntry();
  });
  const missing = wanted.filter(({ key }) => !found.has(key)).map(({ key }) => key);
  if (missing.length) throw new Error(`ESCO archive is missing required files: ${missing.join(', ')}`);
  return Object.fromEntries(found);
};

const readDirectoryEntries = async (directory, wanted) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const result = {};
  for (const target of wanted) {
    const fileName = files.find((candidate) => target.pattern.test(candidate));
    if (!fileName) throw new Error(`ESCO directory is missing required file: ${target.key}`);
    result[target.key] = { fileName, buffer: await fs.readFile(path.join(directory, fileName)) };
  }
  return result;
};

const parseCsv = (value) => {
  const text = (Buffer.isBuffer(value) ? value.toString('utf8') : String(value)).replace(/^\uFEFF/u, '');
  const firstLine = text.split(/\r?\n/u, 1)[0];
  const delimiter = [',', ';', '\t'].sort((left, right) => firstLine.split(right).length - firstLine.split(left).length)[0];
  const records = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === delimiter) { row.push(field); field = ''; }
    else if (character === '\n') { row.push(field.replace(/\r$/u, '')); records.push(row); row = []; field = ''; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/u, '')); records.push(row); }
  if (quoted) throw new Error('Invalid CSV: unterminated quoted field.');
  if (!records.length) return [];
  const headers = records.shift().map((header) => header.trim());
  return records.filter((record) => record.some((entry) => String(entry).trim())).map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])));
};

const normalizedKey = (value) => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').toLowerCase().replace(/[^a-z0-9]+/gu, '');
const valueFor = (row, aliases) => {
  const values = new Map(Object.entries(row).map(([key, value]) => [normalizedKey(key), value]));
  for (const alias of aliases) {
    const value = values.get(normalizedKey(alias));
    if (value !== undefined && String(value).trim()) return String(value).trim();
  }
  return '';
};
const listFor = (value) => [...new Set(String(value || '').split(/\r?\n|\s*\|\s*/u).map((entry) => entry.trim()).filter(Boolean))];

const parseOccupations = (rows) => rows.map((row) => {
  const uri = valueFor(row, ['conceptUri', 'concept URI', 'uri']);
  const preferredLabel = valueFor(row, ['preferredLabel', 'preferred label', 'preferredTerm']);
  if (!uri || !preferredLabel) throw new Error('ESCO occupation row is missing conceptUri or preferredLabel.');
  return {
    uri,
    code: valueFor(row, ['code']) || uri,
    iscoCode: valueFor(row, ['iscoGroup', 'isco group', 'iscoCode']) || null,
    preferredLabel,
    description: valueFor(row, ['description', 'definition', 'scopeNote', 'scope note']),
    aliases: listFor(valueFor(row, ['altLabels', 'alternativeLabels', 'nonPreferredTerms'])),
    status: /deprecated|obsolete|retired/iu.test(valueFor(row, ['status'])) ? 'retired' : 'active',
    metadata: { conceptType: valueFor(row, ['conceptType']), modifiedDate: valueFor(row, ['modifiedDate']) },
  };
});

const parseSkills = (rows) => rows.map((row) => {
  const uri = valueFor(row, ['conceptUri', 'concept URI', 'uri']);
  const preferredLabel = valueFor(row, ['preferredLabel', 'preferred label', 'preferredTerm']);
  if (!uri || !preferredLabel) throw new Error('ESCO skill row is missing conceptUri or preferredLabel.');
  const type = normalizedKey(valueFor(row, ['skillType', 'conceptType']));
  const kind = ['knowledge', 'competence', 'ability', 'technology'].find((candidate) => type.includes(candidate)) || 'skill';
  return { uri, code: valueFor(row, ['code']) || uri, preferredLabel, description: valueFor(row, ['description', 'definition', 'scopeNote']), kind, metadata: { skillType: valueFor(row, ['skillType']), reuseLevel: valueFor(row, ['reuseLevel']) } };
});

const parseOccupationSkillRelations = (rows) => rows.map((row) => {
  const occupationUri = valueFor(row, ['occupationUri', 'occupation URI', 'occupation']);
  const skillUri = valueFor(row, ['skillUri', 'skill URI', 'skill']);
  const relation = valueFor(row, ['relationType', 'relation type', 'relation']);
  if (!occupationUri || !skillUri) throw new Error('ESCO occupation-skill relation is missing an occupation or skill URI.');
  return { occupationUri, skillUri, relationKind: /essential/iu.test(relation) ? 'essential' : 'optional', sourceRelation: relation || null };
});

const normalizeOnetCode = (value) => String(value || '').match(/\d{2}-\d{4}(?:\.\d{2})?/u)?.[0] || '';
const confidenceDetails = (row) => {
  const text = valueFor(row, ['confidenceScore', 'confidence score', 'score', 'similarityScore']);
  const numeric = text === '' ? Number.NaN : Number(text.replace(',', '.'));
  if (Number.isFinite(numeric)) {
    const score = numeric <= 1 ? numeric * 100 : numeric;
    return { score: Math.max(0, Math.min(100, Math.round(score * 1000) / 1000)), level: score >= 90 ? 'high' : score >= 70 ? 'medium' : 'low' };
  }
  const relation = normalizedKey(valueFor(row, ['mappingRelation', 'mapping relation', 'relationType']));
  if (relation.includes('exact')) return { score: null, level: 'high' };
  if (relation.includes('close')) return { score: null, level: 'medium' };
  return { score: null, level: 'unknown' };
};

const parseCrosswalk = (rows) => rows.map((row) => {
  const onetCode = normalizeOnetCode(valueFor(row, ['onetCode', 'O*NET-SOC Code', 'O*NET concept URI', 'source URI'])) || Object.values(row).map(normalizeOnetCode).find(Boolean) || '';
  const escoUri = valueFor(row, ['escoUri', 'ESCO URI', 'ESCO occupation URI', 'ESCO concept URI', 'target URI']) || Object.values(row).find((value) => /data\.europa\.eu\/esco\/occupation\//iu.test(String(value))) || '';
  if (!onetCode || !escoUri) return null;
  const relation = normalizedKey(valueFor(row, ['mappingRelation', 'mapping relation', 'relationType']));
  const confidence = confidenceDetails(row);
  const mappingKind = relation.includes('exact') ? 'exact' : relation.includes('broad') ? 'broad' : relation.includes('narrow') ? 'narrow' : 'close';
  return { onetCode, escoUri, mappingKind, confidenceScore: confidence.score, confidenceLevel: confidence.level, sourceRow: row };
}).filter(Boolean);

const loadEscoDataset = async (config, dependencies = {}) => {
  const wanted = [
    { key: 'occupations', pattern: new RegExp(`^occupations_${config.locale}\\.csv$`, 'iu') },
    { key: 'skills', pattern: new RegExp(`^skills_${config.locale}\\.csv$`, 'iu') },
    { key: 'occupationSkillRelations', pattern: new RegExp(`^occupationSkillRelations(?:_${config.locale})?\\.csv$`, 'iu') },
  ];
  let files;
  if (config.archivePath) {
    const stat = await fs.stat(config.archivePath);
    files = stat.isDirectory() ? await readDirectoryEntries(config.archivePath, wanted) : await readZipEntries(await fs.readFile(config.archivePath), wanted);
  } else {
    files = await readZipEntries(await readOrDownload({ url: config.archiveUrl, cachePath: path.join(config.cacheDir, `esco-${config.version}-${config.locale}.zip`), config, dependencies }), wanted);
  }
  const crosswalkBuffer = await readOrDownload({ filePath: config.crosswalkPath, url: config.crosswalkUrl, cachePath: path.join(config.cacheDir, 'onet-esco-crosswalk.csv'), config, dependencies });
  const occupations = parseOccupations(parseCsv(files.occupations.buffer));
  const skills = parseSkills(parseCsv(files.skills.buffer));
  const occupationSkillRelations = parseOccupationSkillRelations(parseCsv(files.occupationSkillRelations.buffer));
  const crosswalk = parseCrosswalk(parseCsv(crosswalkBuffer));
  if (occupations.length < config.minOccupations) throw new Error(`ESCO occupation count ${occupations.length} is below ${config.minOccupations}`);
  if (skills.length < config.minSkills) throw new Error(`ESCO skill count ${skills.length} is below ${config.minSkills}`);
  const fileMetadata = {
    occupations: { name: files.occupations.fileName, sha256: sha256(files.occupations.buffer) },
    skills: { name: files.skills.fileName, sha256: sha256(files.skills.buffer) },
    occupationSkillRelations: { name: files.occupationSkillRelations.fileName, sha256: sha256(files.occupationSkillRelations.buffer) },
    onetEscoCrosswalk: { name: config.crosswalkPath ? path.basename(config.crosswalkPath) : path.basename(config.crosswalkUrl), sha256: sha256(crosswalkBuffer) },
  };
  return { occupations, skills, occupationSkillRelations, crosswalk, files: fileMetadata, contentSha256: sha256(JSON.stringify(fileMetadata)) };
};

const occupationId = (sourceId, uri) => `${sourceId}:${sha256(uri).slice(0, 32)}`;
const skillId = (sourceId, uri) => `${sourceId}:skill:${sha256(uri).slice(0, 28)}`;

const persistEscoDataset = async ({ config, dataset, pool }) => {
  const connection = await pool.getConnection();
  try {
    const [[existing]] = await connection.query('SELECT content_sha256 FROM career_catalog_sources WHERE id = ? LIMIT 1', [config.sourceId]);
    if (existing && existing.content_sha256 !== dataset.contentSha256 && !config.allowSourceReplace) throw new Error(`Pinned source ${config.sourceId} changed; set ALLOW_SOURCE_REPLACE=true only after an explicit source review`);
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO career_catalog_sources (id, source_kind, source_version, locale, title, source_url, license_name, license_url, attribution_text, content_sha256, record_count, metadata_json)
       VALUES (?, 'esco', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title=VALUES(title), source_url=VALUES(source_url), license_name=VALUES(license_name), license_url=VALUES(license_url), attribution_text=VALUES(attribution_text), content_sha256=VALUES(content_sha256), record_count=VALUES(record_count), metadata_json=VALUES(metadata_json), imported_at=CURRENT_TIMESTAMP(3)`,
      [config.sourceId, config.version, config.locale, `ESCO ${config.version} — ${config.locale}`, OFFICIAL_DOWNLOAD_PAGE, LICENSE_NAME, LICENSE_URL, `ESCO ${config.version}, European Commission, CC BY 4.0.`, dataset.contentSha256, dataset.occupations.length, JSON.stringify({ accessDate: config.accessDate, files: dataset.files, occupationCount: dataset.occupations.length, skillCount: dataset.skills.length, occupationSkillRelationCount: dataset.occupationSkillRelations.length, officialCrosswalkUrl: config.crosswalkUrl, officialCrosswalkTechnicalReport: OFFICIAL_CROSSWALK_REPORT })],
    );

    const occupationByUri = new Map();
    for (const occupation of dataset.occupations) {
      const id = occupationId(config.sourceId, occupation.uri);
      occupationByUri.set(occupation.uri, id);
      await connection.execute(
        `INSERT INTO career_occupations (id, catalog_source_id, source_code, locale, preferred_label, description, status, isco_code, riasec_profile_status, riasec_provenance_json, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'missing', JSON_OBJECT('source','ESCO'), ?)
         ON DUPLICATE KEY UPDATE preferred_label=VALUES(preferred_label), description=VALUES(description), status=VALUES(status), isco_code=VALUES(isco_code), metadata_json=VALUES(metadata_json)`,
        [id, config.sourceId, occupation.uri, config.locale, occupation.preferredLabel, occupation.description, occupation.status, occupation.iscoCode, JSON.stringify({ ...occupation.metadata, escoUri: occupation.uri, escoCode: occupation.code })],
      );
      await connection.execute("DELETE FROM career_occupation_aliases WHERE occupation_id=? AND alias_kind='alternate' AND source_reference=?", [id, config.sourceId]);
      for (const alias of occupation.aliases) await connection.execute("INSERT IGNORE INTO career_occupation_aliases (occupation_id, locale, alias, alias_kind, source_reference) VALUES (?, ?, ?, 'alternate', ?)", [id, config.locale, alias, config.sourceId]);
    }

    const skillByUri = new Map();
    for (const skill of dataset.skills) {
      const id = skillId(config.sourceId, skill.uri);
      skillByUri.set(skill.uri, id);
      await connection.execute(
        `INSERT INTO career_skills (id, catalog_source_id, source_code, locale, preferred_label, description, skill_kind, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE preferred_label=VALUES(preferred_label), description=VALUES(description), skill_kind=VALUES(skill_kind), metadata_json=VALUES(metadata_json)`,
        [id, config.sourceId, skill.uri, config.locale, skill.preferredLabel, skill.description, skill.kind, JSON.stringify({ ...skill.metadata, escoUri: skill.uri, escoCode: skill.code })],
      );
    }

    await connection.execute("DELETE link FROM career_occupation_skill_links link JOIN career_occupations occupation ON occupation.id=link.occupation_id WHERE occupation.catalog_source_id=? AND JSON_UNQUOTE(JSON_EXTRACT(link.provenance_json,'$.sourceId'))=?", [config.sourceId, config.sourceId]);
    let importedSkillRelations = 0;
    for (const relation of dataset.occupationSkillRelations) {
      const occupation = occupationByUri.get(relation.occupationUri);
      const skill = skillByUri.get(relation.skillUri);
      if (!occupation || !skill) continue;
      await connection.execute("INSERT INTO career_occupation_skill_links (occupation_id, skill_id, relation_kind, importance_score, provenance_json) VALUES (?, ?, ?, NULL, ?) ON DUPLICATE KEY UPDATE provenance_json=VALUES(provenance_json)", [occupation, skill, relation.relationKind, JSON.stringify({ source: 'ESCO', sourceId: config.sourceId, sourceVersion: config.version, sourceRelation: relation.sourceRelation })]);
      importedSkillRelations += 1;
    }

    const [onetRows] = await connection.query("SELECT occupation.id, occupation.source_code FROM career_occupations occupation JOIN career_catalog_sources source ON source.id=occupation.catalog_source_id WHERE source.source_kind='onet' AND source.source_version=? AND occupation.locale='en'", [config.onetVersion]);
    const onetByCode = new Map(onetRows.map((row) => [normalizeOnetCode(row.source_code), row.id]));
    let importedCrosswalks = 0;
    const confidenceDistribution = { high: 0, medium: 0, low: 0, unknown: 0 };
    for (const mapping of dataset.crosswalk) {
      const sourceOccupationId = onetByCode.get(mapping.onetCode);
      const targetOccupationId = occupationByUri.get(mapping.escoUri);
      if (!sourceOccupationId || !targetOccupationId) continue;
      await connection.execute(
        `INSERT INTO career_occupation_crosswalks (source_occupation_id, target_occupation_id, mapping_kind, confidence_score, confidence_level, review_status, source_reference, source_version, mapped_at, provenance_json)
         VALUES (?, ?, ?, ?, ?, 'official', ?, 'official-esco-onet-crosswalk-2023-08', ?, ?)
         ON DUPLICATE KEY UPDATE confidence_score=IF(review_status IN ('proposed','official'),VALUES(confidence_score),confidence_score), confidence_level=IF(review_status IN ('proposed','official'),VALUES(confidence_level),confidence_level), source_reference=IF(review_status IN ('proposed','official'),VALUES(source_reference),source_reference), source_version=IF(review_status IN ('proposed','official'),VALUES(source_version),source_version), mapped_at=IF(review_status IN ('proposed','official'),VALUES(mapped_at),mapped_at), provenance_json=IF(review_status IN ('proposed','official'),VALUES(provenance_json),provenance_json), review_status=IF(review_status='proposed','official',review_status)`,
        [sourceOccupationId, targetOccupationId, mapping.mappingKind, mapping.confidenceScore, mapping.confidenceLevel, config.crosswalkUrl, config.accessDate, JSON.stringify({ source: 'European Commission ESCO O*NET crosswalk', sourceUrl: config.crosswalkUrl, technicalReport: OFFICIAL_CROSSWALK_REPORT, row: mapping.sourceRow })],
      );
      importedCrosswalks += 1;
      confidenceDistribution[mapping.confidenceLevel] += 1;
    }

    await connection.commit();
    return { sourceId: config.sourceId, contentSha256: dataset.contentSha256, occupations: dataset.occupations.length, skills: dataset.skills.length, occupationSkillRelations: importedSkillRelations, crosswalks: importedCrosswalks, confidenceDistribution };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
};

const importEscoCatalog = async (env = process.env, dependencies = {}) => {
  const config = createConfig(env);
  const dataset = dependencies.dataset || await loadEscoDataset(config, dependencies);
  const pool = dependencies.pool || createDatabasePool(env);
  try { return await persistEscoDataset({ config, dataset, pool }); }
  finally { if (!dependencies.pool) await pool.end(); }
};

if (require.main === module) {
  importEscoCatalog().then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)).catch((error) => { process.stderr.write(`ESCO import failed: ${error.message}\n`); process.exitCode = 1; });
}

module.exports = { LICENSE_NAME, LICENSE_URL, OFFICIAL_CROSSWALK_REPORT, OFFICIAL_CROSSWALK_URL, OFFICIAL_DOWNLOAD_PAGE, confidenceDetails, createConfig, downloadBuffer, importEscoCatalog, listFor, loadEscoDataset, normalizeOnetCode, parseCrosswalk, parseCsv, parseOccupationSkillRelations, parseOccupations, parseSkills, persistEscoDataset, sha256 };
