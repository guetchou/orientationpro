const crypto = require('node:crypto');
const dns = require('node:dns');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');
const { displayCode, DIMENSIONS } = require('../src/career/matching');

const LICENSE_NAME = 'Creative Commons Attribution 4.0 International';
const LICENSE_URL = 'https://www.onetcenter.org/license_db.html';
const DEFAULT_DOWNLOAD_ATTEMPTS = 4;
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 180_000;

const FILE_NAMES = Object.freeze({
  occupations: 'occupation_data.json',
  interests: 'career_interest_types.json',
  scales: 'scales_reference.json',
});

const positiveInteger = (value, fallback, label) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return parsed;
};

const createConfig = (env = process.env) => {
  const version = env.ONET_VERSION || '30.3';
  const versionPath = version.replaceAll('.', '_');
  const baseUrl = env.ONET_BASE_URL || `https://www.onetcenter.org/dl_files/database/db_${versionPath}_json`;
  const sourceId = `onet:${version}:en`;

  return {
    version,
    sourceId,
    baseUrl,
    urls: Object.freeze({
      occupations: `${baseUrl}/${FILE_NAMES.occupations}`,
      interests: `${baseUrl}/${FILE_NAMES.interests}`,
      scales: `${baseUrl}/${FILE_NAMES.scales}`,
    }),
    minOccupations: positiveInteger(env.ONET_MIN_OCCUPATIONS, 1000, 'ONET_MIN_OCCUPATIONS'),
    minDirectProfiles: positiveInteger(env.ONET_MIN_DIRECT_PROFILES, 900, 'ONET_MIN_DIRECT_PROFILES'),
    downloadAttempts: positiveInteger(
      env.ONET_DOWNLOAD_ATTEMPTS,
      DEFAULT_DOWNLOAD_ATTEMPTS,
      'ONET_DOWNLOAD_ATTEMPTS',
    ),
    downloadTimeoutMs: positiveInteger(
      env.ONET_DOWNLOAD_TIMEOUT_MS,
      DEFAULT_DOWNLOAD_TIMEOUT_MS,
      'ONET_DOWNLOAD_TIMEOUT_MS',
    ),
    cacheDir: env.ONET_CACHE_DIR ? path.resolve(env.ONET_CACHE_DIR) : null,
    forceIpv4: env.ONET_FORCE_IPV4 !== 'false',
  };
};

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const parseJsonPayload = (text, source) => {
  const payload = JSON.parse(text);
  if (!Array.isArray(payload.row)) {
    throw new Error(`Invalid O*NET JSON payload at ${source}`);
  }
  return { text, rows: payload.row };
};

const downloadJson = async (url, options = {}) => {
  const {
    fetchImpl = fetch,
    attempts = DEFAULT_DOWNLOAD_ATTEMPTS,
    timeoutMs = DEFAULT_DOWNLOAD_TIMEOUT_MS,
    sleepImpl = sleep,
  } = options;

  let latestError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: 'application/json',
          'accept-encoding': 'identity',
          'user-agent': 'MAKOKI occupation catalog importer/1.1',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`Download failed (${response.status}) for ${url}`);
      }
      return parseJsonPayload(await response.text(), url);
    } catch (error) {
      latestError = error;
      if (attempt >= attempts) break;
      const delayMs = Math.min(1000 * (2 ** (attempt - 1)), 8000);
      console.warn(
        `O*NET download attempt ${attempt}/${attempts} failed for ${url}: ${error.message}. ` +
        `Retrying in ${delayMs}ms.`,
      );
      await sleepImpl(delayMs);
    }
  }

  throw new Error(`O*NET download failed after ${attempts} attempts for ${url}`, {
    cause: latestError,
  });
};

const readCacheFile = async (filePath) => {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    const parsed = parseJsonPayload(text, filePath);
    console.log(`O*NET cache hit: ${filePath}`);
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    console.warn(`Ignoring unusable O*NET cache file ${filePath}: ${error.message}`);
    return null;
  }
};

const writeCacheFile = async (filePath, text) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporaryPath, text, { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temporaryPath, filePath);
};

const loadJsonSource = async ({ url, fileName, config, fetchImpl, sleepImpl }) => {
  const cachePath = config.cacheDir ? path.join(config.cacheDir, fileName) : null;
  if (cachePath) {
    const cached = await readCacheFile(cachePath);
    if (cached) return cached;
  }

  const downloaded = await downloadJson(url, {
    attempts: config.downloadAttempts,
    timeoutMs: config.downloadTimeoutMs,
    fetchImpl,
    sleepImpl,
  });

  if (cachePath) {
    await writeCacheFile(cachePath, downloaded.text);
    console.log(`O*NET cache stored: ${cachePath}`);
  }

  return downloaded;
};

const dimensionByName = Object.freeze({
  realistic: 'R',
  investigative: 'I',
  artistic: 'A',
  social: 'S',
  enterprising: 'E',
  conventional: 'C',
});

const normalize = ({ value, minimum, maximum }) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new TypeError(`Invalid O*NET interest value: ${value}`);
  if (numeric < minimum || numeric > maximum) {
    throw new RangeError(`O*NET interest value ${numeric} outside scale ${minimum}-${maximum}`);
  }
  return Math.round((((numeric - minimum) / (maximum - minimum)) * 100) * 1000) / 1000;
};

const buildProfiles = ({ interestRows, minimum, maximum }) => {
  const grouped = new Map();
  for (const row of interestRows) {
    if (row.scale_id !== 'OI') continue;
    const dimension = dimensionByName[String(row.element_name || '').trim().toLowerCase()];
    if (!dimension) continue;
    const current = grouped.get(row.onetsoc_code) || { raw: {}, normalized: {}, provenance: {} };
    current.raw[dimension] = Number(row.data_value);
    current.normalized[dimension] = normalize({ value: row.data_value, minimum, maximum });
    current.provenance[dimension] = {
      date: row.date_updated || row.date || null,
      domainSource: row.domain_source || null,
      elementId: row.element_id || null,
    };
    grouped.set(row.onetsoc_code, current);
  }
  return grouped;
};

const requireScale = (scaleRows, scaleId) => {
  const row = scaleRows.find((candidate) => candidate.scale_id === scaleId);
  if (!row) throw new Error(`O*NET scale ${scaleId} not found`);
  const minimum = Number(row.minimum);
  const maximum = Number(row.maximum);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum <= minimum) {
    throw new Error(`Invalid O*NET scale ${scaleId}: ${row.minimum}-${row.maximum}`);
  }
  return { minimum, maximum, name: row.scale_name || scaleId };
};

const importOnetCatalog = async (env = process.env, dependencies = {}) => {
  const config = createConfig(env);
  if (config.forceIpv4) dns.setDefaultResultOrder('ipv4first');

  const sourceOptions = {
    config,
    fetchImpl: dependencies.fetchImpl,
    sleepImpl: dependencies.sleepImpl,
  };

  // O*NET occasionally closes large concurrent transfers. Download sequentially and cache validated files.
  const occupationFile = await loadJsonSource({
    ...sourceOptions,
    url: config.urls.occupations,
    fileName: FILE_NAMES.occupations,
  });
  const interestFile = await loadJsonSource({
    ...sourceOptions,
    url: config.urls.interests,
    fileName: FILE_NAMES.interests,
  });
  const scaleFile = await loadJsonSource({
    ...sourceOptions,
    url: config.urls.scales,
    fileName: FILE_NAMES.scales,
  });

  if (occupationFile.rows.length < config.minOccupations) {
    throw new Error(`O*NET occupation count ${occupationFile.rows.length} is below ${config.minOccupations}`);
  }

  const oiScale = requireScale(scaleFile.rows, 'OI');
  const profiles = buildProfiles({
    interestRows: interestFile.rows,
    minimum: oiScale.minimum,
    maximum: oiScale.maximum,
  });
  const directProfileCount = [...profiles.values()].filter(({ normalized }) => (
    DIMENSIONS.every((dimension) => Number.isFinite(normalized[dimension]))
  )).length;

  if (directProfileCount < config.minDirectProfiles) {
    throw new Error(
      `O*NET direct RIASEC profile count ${directProfileCount} is below ${config.minDirectProfiles}`,
    );
  }

  const combinedHash = sha256(JSON.stringify({
    occupations: sha256(occupationFile.text),
    interests: sha256(interestFile.text),
    scales: sha256(scaleFile.text),
  }));

  const pool = createDatabasePool(env);
  const connection = await pool.getConnection();
  try {
    const [[existing]] = await connection.query(
      'SELECT content_sha256 FROM career_catalog_sources WHERE id = ? LIMIT 1',
      [config.sourceId],
    );
    if (existing && existing.content_sha256 !== combinedHash && env.ALLOW_SOURCE_REPLACE !== 'true') {
      throw new Error(
        `Pinned source ${config.sourceId} changed (${existing.content_sha256} -> ${combinedHash}); ` +
        'set ALLOW_SOURCE_REPLACE=true only after an explicit source review',
      );
    }

    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO career_catalog_sources (
         id, source_kind, source_version, locale, title, source_url,
         license_name, license_url, attribution_text, content_sha256,
         record_count, metadata_json
       ) VALUES (?, 'onet', ?, 'en', ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), source_url = VALUES(source_url),
         license_name = VALUES(license_name), license_url = VALUES(license_url),
         attribution_text = VALUES(attribution_text), content_sha256 = VALUES(content_sha256),
         record_count = VALUES(record_count), metadata_json = VALUES(metadata_json),
         imported_at = CURRENT_TIMESTAMP(3)`,
      [
        config.sourceId,
        config.version,
        `O*NET ${config.version} Database`,
        'https://www.onetcenter.org/database.html',
        LICENSE_NAME,
        LICENSE_URL,
        `Includes information from the O*NET ${config.version} Database by the U.S. Department of Labor, ` +
          'Employment and Training Administration (USDOL/ETA). Used under CC BY 4.0. ' +
          'O*NET® is a trademark of USDOL/ETA. MAKOKI normalizes RIASEC values to a 0-100 scale; ' +
          'USDOL/ETA has not approved, endorsed, or tested these modifications.',
        combinedHash,
        occupationFile.rows.length,
        JSON.stringify({
          urls: config.urls,
          files: {
            occupationsSha256: sha256(occupationFile.text),
            interestsSha256: sha256(interestFile.text),
            scalesSha256: sha256(scaleFile.text),
          },
          directProfileCount,
          riasecScale: oiScale,
        }),
      ],
    );

    for (const row of occupationFile.rows) {
      const sourceCode = row.onetsoc_code;
      const id = `${config.sourceId}:${sourceCode}`;
      const profile = profiles.get(sourceCode);
      const hasDirectProfile = Boolean(profile && DIMENSIONS.every((dimension) => (
        Number.isFinite(profile.normalized[dimension])
      )));
      const normalized = hasDirectProfile ? profile.normalized : {};
      const provenance = hasDirectProfile ? {
        source: 'O*NET Database',
        sourceVersion: config.version,
        sourceUrl: config.urls.interests,
        license: LICENSE_NAME,
        licenseUrl: LICENSE_URL,
        scale: { id: 'OI', ...oiScale },
        rawScores: profile.raw,
        normalization: '(raw - minimum) / (maximum - minimum) * 100',
        elementProvenance: profile.provenance,
      } : {
        source: 'O*NET Database',
        sourceVersion: config.version,
        status: 'missing-direct-profile',
      };

      await connection.execute(
        `INSERT INTO career_occupations (
           id, catalog_source_id, source_code, locale, preferred_label, description,
           riasec_r, riasec_i, riasec_a, riasec_s, riasec_e, riasec_c,
           riasec_display_code, riasec_profile_status, riasec_provenance_json,
           metadata_json
         ) VALUES (?, ?, ?, 'en', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           preferred_label = VALUES(preferred_label), description = VALUES(description),
           riasec_r = VALUES(riasec_r), riasec_i = VALUES(riasec_i),
           riasec_a = VALUES(riasec_a), riasec_s = VALUES(riasec_s),
           riasec_e = VALUES(riasec_e), riasec_c = VALUES(riasec_c),
           riasec_display_code = VALUES(riasec_display_code),
           riasec_profile_status = VALUES(riasec_profile_status),
           riasec_provenance_json = VALUES(riasec_provenance_json),
           metadata_json = VALUES(metadata_json)`,
        [
          id,
          config.sourceId,
          sourceCode,
          row.title,
          row.description || '',
          normalized.R ?? null,
          normalized.I ?? null,
          normalized.A ?? null,
          normalized.S ?? null,
          normalized.E ?? null,
          normalized.C ?? null,
          hasDirectProfile ? displayCode(normalized) : null,
          hasDirectProfile ? 'direct' : 'missing',
          JSON.stringify(provenance),
          JSON.stringify({ sourceTitle: row.title }),
        ],
      );
    }

    const [[counts]] = await connection.query(
      `SELECT COUNT(*) AS occupation_count,
              SUM(riasec_profile_status = 'direct') AS direct_profile_count
       FROM career_occupations
       WHERE catalog_source_id = ?`,
      [config.sourceId],
    );
    if (
      Number(counts.occupation_count) < config.minOccupations ||
      Number(counts.direct_profile_count) < config.minDirectProfiles
    ) {
      throw new Error(`Imported catalog verification failed: ${JSON.stringify(counts)}`);
    }

    await connection.commit();
    return {
      sourceId: config.sourceId,
      version: config.version,
      contentSha256: combinedHash,
      occupationCount: Number(counts.occupation_count),
      directProfileCount: Number(counts.direct_profile_count),
    };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

if (require.main === module) {
  importOnetCatalog()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = {
  createConfig,
  downloadJson,
  importOnetCatalog,
  normalize,
  requireScale,
};
