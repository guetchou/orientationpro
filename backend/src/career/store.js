'use strict';

const { rankOccupations } = require('./matching');

const parseJson = (value) => {
  if (value === null || value === undefined) return value;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const boundedInteger = (value, fallback, minimum, maximum) => {
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return fallback;
  return Math.min(Math.max(numeric, minimum), maximum);
};

const validLocale = (value, fallback = 'fr') => {
  const locale = String(value || fallback).trim();
  return /^[a-z]{2}(?:-[A-Z]{2})?$/u.test(locale) ? locale : fallback;
};

const sourceFromRow = (row, prefix) => {
  const id = row[`${prefix}_source_id`];
  if (!id) return null;
  return {
    id,
    kind: row[`${prefix}_source_kind`],
    version: row[`${prefix}_source_version`],
    title: row[`${prefix}_source_title`],
    licenseName: row[`${prefix}_license_name`],
    licenseUrl: row[`${prefix}_license_url`],
    attribution: row[`${prefix}_attribution_text`],
  };
};

const rowToOccupation = (row, requestedLocale = 'fr') => {
  if (!row) return null;
  const locale = validLocale(requestedLocale);
  const presentationAvailable = Boolean(row.presentation_occupation_id);
  const actualLocale = presentationAvailable ? row.presentation_locale : row.locale;
  const translationStatus = presentationAvailable
    ? 'available'
    : actualLocale === locale
      ? 'native'
      : 'unavailable';
  const baseSource = sourceFromRow(row, 'riasec');
  const presentationSource = presentationAvailable
    ? sourceFromRow(row, 'presentation')
    : baseSource;

  return {
    id: row.id,
    sourceCode: row.source_code,
    requestedLocale: locale,
    locale: actualLocale,
    fallbackLocale: translationStatus === 'unavailable' ? actualLocale : null,
    translationStatus,
    preferredLabel: presentationAvailable ? row.presentation_preferred_label : row.preferred_label,
    description: presentationAvailable ? row.presentation_description : row.description,
    status: row.status,
    iscoCode: presentationAvailable ? row.presentation_isco_code || row.isco_code : row.isco_code,
    jobZone: row.job_zone,
    riasec: {
      R: row.riasec_r === null ? null : Number(row.riasec_r),
      I: row.riasec_i === null ? null : Number(row.riasec_i),
      A: row.riasec_a === null ? null : Number(row.riasec_a),
      S: row.riasec_s === null ? null : Number(row.riasec_s),
      E: row.riasec_e === null ? null : Number(row.riasec_e),
      C: row.riasec_c === null ? null : Number(row.riasec_c),
    },
    riasecDisplayCode: row.riasec_display_code,
    riasecProfileStatus: row.riasec_profile_status,
    riasecProvenance: parseJson(row.riasec_provenance_json),
    localRelevanceStatus: row.local_relevance_status,
    localRelevanceNotes: row.local_relevance_notes,
    metadata: parseJson(row.metadata_json),
    presentationOccupationId: presentationAvailable ? row.presentation_occupation_id : row.id,
    escoOccupationId: presentationAvailable ? row.presentation_occupation_id : null,
    source: baseSource,
    riasecSource: baseSource,
    presentationSource,
    crosswalk: presentationAvailable ? {
      mappingKind: row.crosswalk_mapping_kind,
      confidenceScore: row.crosswalk_confidence_score === null
        ? null
        : Number(row.crosswalk_confidence_score),
      confidenceLevel: row.crosswalk_confidence_level,
      reviewStatus: row.crosswalk_review_status,
      sourceReference: row.crosswalk_source_reference,
      sourceVersion: row.crosswalk_source_version,
      mappedAt: row.crosswalk_mapped_at,
      provenance: parseJson(row.crosswalk_provenance_json),
    } : null,
  };
};

const normalizedResultScores = (scores) => Object.fromEntries(
  ['R', 'I', 'A', 'S', 'E', 'C'].map((dimension) => {
    const normalized = Number(scores?.[dimension]?.normalized);
    if (!Number.isFinite(normalized)) {
      throw new Error(`Orientation result is missing normalized score ${dimension}`);
    }
    return [dimension, normalized];
  }),
);

const presentationSelect = `
  SELECT base.*,
         riasec_source.id AS riasec_source_id,
         riasec_source.source_kind AS riasec_source_kind,
         riasec_source.source_version AS riasec_source_version,
         riasec_source.title AS riasec_source_title,
         riasec_source.license_name AS riasec_license_name,
         riasec_source.license_url AS riasec_license_url,
         riasec_source.attribution_text AS riasec_attribution_text,
         presented.id AS presentation_occupation_id,
         presented.locale AS presentation_locale,
         presented.preferred_label AS presentation_preferred_label,
         presented.description AS presentation_description,
         presented.isco_code AS presentation_isco_code,
         presentation_source.id AS presentation_source_id,
         presentation_source.source_kind AS presentation_source_kind,
         presentation_source.source_version AS presentation_source_version,
         presentation_source.title AS presentation_source_title,
         presentation_source.license_name AS presentation_license_name,
         presentation_source.license_url AS presentation_license_url,
         presentation_source.attribution_text AS presentation_attribution_text,
         selected_crosswalk.mapping_kind AS crosswalk_mapping_kind,
         selected_crosswalk.confidence_score AS crosswalk_confidence_score,
         selected_crosswalk.confidence_level AS crosswalk_confidence_level,
         selected_crosswalk.review_status AS crosswalk_review_status,
         selected_crosswalk.source_reference AS crosswalk_source_reference,
         selected_crosswalk.source_version AS crosswalk_source_version,
         selected_crosswalk.mapped_at AS crosswalk_mapped_at,
         selected_crosswalk.provenance_json AS crosswalk_provenance_json
  FROM career_occupations base
  JOIN career_catalog_sources riasec_source
    ON riasec_source.id = base.catalog_source_id
   AND riasec_source.source_kind = 'onet'
  LEFT JOIN (
    SELECT ranked.*
    FROM (
      SELECT crosswalk.*,
             ROW_NUMBER() OVER (
               PARTITION BY crosswalk.source_occupation_id
               ORDER BY
                 CASE crosswalk.review_status
                   WHEN 'reviewed' THEN 1
                   WHEN 'official' THEN 2
                   ELSE 9
                 END,
                 CASE crosswalk.mapping_kind
                   WHEN 'exact' THEN 1
                   WHEN 'close' THEN 2
                   WHEN 'narrow' THEN 3
                   WHEN 'broad' THEN 4
                   WHEN 'manual' THEN 5
                   ELSE 9
                 END,
                 CASE crosswalk.confidence_level
                   WHEN 'high' THEN 1
                   WHEN 'medium' THEN 2
                   WHEN 'low' THEN 3
                   ELSE 4
                 END,
                 COALESCE(crosswalk.confidence_score, -1) DESC,
                 crosswalk.target_occupation_id
             ) AS presentation_rank
      FROM career_occupation_crosswalks crosswalk
      JOIN career_occupations target_filter
        ON target_filter.id = crosswalk.target_occupation_id
       AND target_filter.locale = ?
       AND target_filter.status = 'active'
      WHERE crosswalk.review_status IN ('official', 'reviewed')
    ) ranked
    WHERE ranked.presentation_rank = 1
  ) selected_crosswalk
    ON selected_crosswalk.source_occupation_id = base.id
  LEFT JOIN career_occupations presented
    ON presented.id = selected_crosswalk.target_occupation_id
  LEFT JOIN career_catalog_sources presentation_source
    ON presentation_source.id = presented.catalog_source_id
`;

const createCareerStore = (pool) => ({
  async getCatalogSummary() {
    const [sources] = await pool.query(
      `SELECT s.id, s.source_kind, s.source_version, s.locale, s.title,
              s.license_name, s.license_url, s.attribution_text,
              s.content_sha256, s.record_count, s.imported_at,
              COUNT(o.id) AS occupation_count,
              SUM(o.riasec_profile_status IN ('direct', 'mapped', 'reviewed')) AS matchable_count,
              SUM(o.local_relevance_status = 'relevant') AS locally_reviewed_relevant_count
       FROM career_catalog_sources s
       LEFT JOIN career_occupations o ON o.catalog_source_id = s.id
       GROUP BY s.id, s.source_kind, s.source_version, s.locale, s.title,
                s.license_name, s.license_url, s.attribution_text,
                s.content_sha256, s.record_count, s.imported_at
       ORDER BY s.source_kind, s.source_version, s.locale`,
    );
    return sources.map((source) => ({
      id: source.id,
      kind: source.source_kind,
      version: source.source_version,
      locale: source.locale,
      title: source.title,
      licenseName: source.license_name,
      licenseUrl: source.license_url,
      attribution: source.attribution_text,
      contentSha256: source.content_sha256,
      declaredRecordCount: Number(source.record_count),
      occupationCount: Number(source.occupation_count),
      matchableCount: Number(source.matchable_count || 0),
      locallyReviewedRelevantCount: Number(source.locally_reviewed_relevant_count || 0),
      importedAt: source.imported_at,
    }));
  },

  async searchOccupations({
    query = '',
    locale = 'fr',
    riasecOnly = false,
    includeLocallyExcluded = false,
    limit = 20,
    offset = 0,
  } = {}) {
    const requestedLocale = validLocale(locale);
    const safeLimit = boundedInteger(limit, 20, 1, 100);
    const safeOffset = boundedInteger(offset, 0, 0, 100_000);
    const normalizedQuery = String(query || '').trim().slice(0, 120);
    const where = [`base.status = 'active'`, `base.locale = 'en'`];
    const parameters = [requestedLocale];

    if (riasecOnly) {
      where.push(`base.riasec_profile_status IN ('direct', 'mapped', 'reviewed')`);
    }
    if (!includeLocallyExcluded) {
      where.push(`base.local_relevance_status <> 'excluded'`);
    }
    if (normalizedQuery) {
      const pattern = `%${normalizedQuery}%`;
      where.push(`(
        COALESCE(presented.preferred_label, base.preferred_label) LIKE ? OR
        COALESCE(presented.description, base.description) LIKE ? OR
        EXISTS (
          SELECT 1 FROM career_occupation_aliases alias
          WHERE alias.occupation_id = COALESCE(presented.id, base.id)
            AND alias.alias LIKE ?
        )
      )`);
      parameters.push(pattern, pattern, pattern);
    }

    const [rows] = await pool.query(
      `${presentationSelect}
       WHERE ${where.join(' AND ')}
       ORDER BY COALESCE(presented.preferred_label, base.preferred_label), base.id
       LIMIT ? OFFSET ?`,
      [...parameters, safeLimit, safeOffset],
    );
    return rows.map((row) => rowToOccupation(row, requestedLocale));
  },

  async getOccupation({ occupationId, locale = 'fr' }) {
    const requestedLocale = validLocale(locale);
    const [[row]] = await pool.query(
      `${presentationSelect}
       WHERE base.id = ? AND base.locale = 'en' AND base.status = 'active'
       LIMIT 1`,
      [requestedLocale, occupationId],
    );
    if (!row) return null;

    const occupation = rowToOccupation(row, requestedLocale);
    const contentOccupationId = occupation.presentationOccupationId;
    const [aliases] = await pool.query(
      `SELECT locale, alias, alias_kind, source_reference
       FROM career_occupation_aliases
       WHERE occupation_id = ?
       ORDER BY locale, alias`,
      [contentOccupationId],
    );
    const [skills] = await pool.query(
      `SELECT skill.id, skill.locale, skill.preferred_label, skill.description, skill.skill_kind,
              link.relation_kind, link.importance_score, link.provenance_json
       FROM career_occupation_skill_links link
       JOIN career_skills skill ON skill.id = link.skill_id
       WHERE link.occupation_id = ?
       ORDER BY
         CASE link.relation_kind WHEN 'essential' THEN 1 ELSE 2 END,
         link.importance_score DESC,
         skill.preferred_label`,
      [contentOccupationId],
    );

    return {
      ...occupation,
      aliases: aliases.map((alias) => ({
        locale: alias.locale,
        label: alias.alias,
        kind: alias.alias_kind,
        sourceReference: alias.source_reference,
      })),
      skills: skills.map((skill) => ({
        id: skill.id,
        locale: skill.locale,
        preferredLabel: skill.preferred_label,
        description: skill.description,
        kind: skill.skill_kind,
        relationKind: skill.relation_kind,
        importanceScore: skill.importance_score === null ? null : Number(skill.importance_score),
        provenance: parseJson(skill.provenance_json),
      })),
    };
  },

  async matchOrientationResult({
    accountId,
    resultId,
    locale = 'fr',
    includeLocallyExcluded = false,
    limit = 20,
  }) {
    const requestedLocale = validLocale(locale);
    const [[resultRow]] = await pool.query(
      `SELECT id, scores_json, display_code, algorithm_version, created_at
       FROM orientation_results
       WHERE id = ? AND account_id = ?
       LIMIT 1`,
      [resultId, accountId],
    );
    if (!resultRow) return null;

    const where = [
      `base.status = 'active'`,
      `base.locale = 'en'`,
      `base.riasec_profile_status IN ('direct', 'mapped', 'reviewed')`,
    ];
    if (!includeLocallyExcluded) where.push(`base.local_relevance_status <> 'excluded'`);

    const [rows] = await pool.query(
      `${presentationSelect}
       WHERE ${where.join(' AND ')}`,
      [requestedLocale],
    );
    const occupations = rows.map((row) => rowToOccupation(row, requestedLocale));
    const userScores = normalizedResultScores(parseJson(resultRow.scores_json));
    const matches = rankOccupations({
      userScores,
      occupations,
      limit: boundedInteger(limit, 20, 1, 100),
    });

    return {
      result: {
        id: resultRow.id,
        displayCode: resultRow.display_code,
        algorithmVersion: resultRow.algorithm_version,
        createdAt: resultRow.created_at,
        normalizedScores: userScores,
      },
      matching: {
        requestedLocale,
        locale: requestedLocale,
        eligibleOccupationCount: occupations.length,
        translatedOccupationCount: occupations.filter(
          (occupation) => occupation.translationStatus === 'available',
        ).length,
        fallbackOccupationCount: occupations.filter(
          (occupation) => occupation.translationStatus === 'unavailable',
        ).length,
        matches,
      },
    };
  },
});

module.exports = {
  createCareerStore,
  normalizedResultScores,
  rowToOccupation,
  validLocale,
};
