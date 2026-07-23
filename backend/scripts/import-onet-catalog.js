const crypto = require('node:crypto');
const { createDatabasePool } = require('../src/db/pool');
const { displayCode, DIMENSIONS } = require('../src/career/matching');

const VERSION = process.env.ONET_VERSION || '30.3';
const VERSION_PATH = VERSION.replaceAll('.', '_');
const BASE_URL = process.env.ONET_BASE_URL || `https://www.onetcenter.org/dl_files/database/db_${VERSION_PATH}_json`;
const SOURCE_ID = `onet:${VERSION}:en`;
const LICENSE_NAME = 'Creative Commons Attribution 4.0 International';
const LICENSE_URL = `https://www.onetcenter.org/license_db.html`;
const MIN_OCCUPATIONS = Number(process.env.ONET_MIN_OCCUPATIONS || 1000);
const MIN_DIRECT_PROFILES = Number(process.env.ONET_MIN_DIRECT_PROFILES || 900);

const URLS = Object.freeze({
  occupations: `${BASE_URL}/occupation_data.json`,
  interests: `${BASE_URL}/career_interest_types.json`,
  scales: `${BASE_URL}/scales_reference.json`,
});

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const downloadJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'MAKOKI occupation catalog importer/1.0',
    },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  const text = await response.text();
  const payload = JSON.parse(text);
  if (!Array.isArray(payload.row)) throw new Error(`Invalid O*NET JSON payload at ${url}`);
  return { text, rows: payload.row };
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
      date: row.date || null,
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

const importOnetCatalog = async (env = process.env) => {
  const [occupationFile, interestFile, scaleFile] = await Promise.all([
    downloadJson(URLS.occupations),
    downloadJson(URLS.interests),
    downloadJson(URLS.scales),
  ]);

  if (occupationFile.rows.length < MIN_OCCUPATIONS) {
    throw new Error(`O*NET occupation count ${occupationFile.rows.length} is below ${MIN_OCCUPATIONS}`);
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

  if (directProfileCount < MIN_DIRECT_PROFILES) {
    throw new Error(`O*NET direct RIASEC profile count ${directProfileCount} is below ${MIN_DIRECT_PROFILES}`);
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
      [SOURCE_ID],
    );
    if (existing && existing.content_sha256 !== combinedHash && env.ALLOW_SOURCE_REPLACE !== 'true') {
      throw new Error(
        `Pinned source ${SOURCE_ID} changed (${existing.content_sha256} -> ${combinedHash}); ` +
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
        SOURCE_ID,
        VERSION,
        `O*NET ${VERSION} Database`,
        'https://www.onetcenter.org/database.html',
        LICENSE_NAME,
        LICENSE_URL,
        `Includes information from the O*NET ${VERSION} Database by the U.S. Department of Labor, ` +
          'Employment and Training Administration (USDOL/ETA). Used under CC BY 4.0. ' +
          'O*NET® is a trademark of USDOL/ETA. MAKOKI normalizes RIASEC values to a 0-100 scale; ' +
          'USDOL/ETA has not approved, endorsed, or tested these modifications.',
        combinedHash,
        occupationFile.rows.length,
        JSON.stringify({
          urls: URLS,
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
      const id = `${SOURCE_ID}:${sourceCode}`;
      const profile = profiles.get(sourceCode);
      const hasDirectProfile = Boolean(profile && DIMENSIONS.every((dimension) => (
        Number.isFinite(profile.normalized[dimension])
      )));
      const normalized = hasDirectProfile ? profile.normalized : {};
      const provenance = hasDirectProfile ? {
        source: 'O*NET Database',
        sourceVersion: VERSION,
        sourceUrl: URLS.interests,
        license: LICENSE_NAME,
        licenseUrl: LICENSE_URL,
        scale: { id: 'OI', ...oiScale },
        rawScores: profile.raw,
        normalization: '(raw - minimum) / (maximum - minimum) * 100',
        elementProvenance: profile.provenance,
      } : {
        source: 'O*NET Database',
        sourceVersion: VERSION,
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
          SOURCE_ID,
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
      [SOURCE_ID],
    );
    if (Number(counts.occupation_count) < MIN_OCCUPATIONS || Number(counts.direct_profile_count) < MIN_DIRECT_PROFILES) {
      throw new Error(`Imported catalog verification failed: ${JSON.stringify(counts)}`);
    }

    await connection.commit();
    return {
      sourceId: SOURCE_ID,
      version: VERSION,
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

module.exports = { importOnetCatalog, normalize, requireScale };
