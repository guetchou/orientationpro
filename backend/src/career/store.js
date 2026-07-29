'use strict';

const crypto = require('node:crypto');
const { rankOccupations } = require('./matching');
const {
  PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
  profileRecommendationContext,
  rankProfileRecommendations,
} = require('./profile-matching');
const { PREPARATION_ADAPTER_VERSION } = require('./preparation-model');
const { buildRecommendationInputVersion } = require('./profile-version');

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
    locale: row[`${prefix}_source_locale`] || null,
    title: row[`${prefix}_source_title`],
    licenseName: row[`${prefix}_license_name`],
    licenseUrl: row[`${prefix}_license_url`],
    attribution: row[`${prefix}_attribution_text`],
    contentSha256: row[`${prefix}_content_sha256`] || null,
    importedAt: row[`${prefix}_imported_at`] || null,
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
    jobZone: row.job_zone === null ? null : Number(row.job_zone),
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
         riasec_source.locale AS riasec_source_locale,
         riasec_source.title AS riasec_source_title,
         riasec_source.license_name AS riasec_license_name,
         riasec_source.license_url AS riasec_license_url,
         riasec_source.attribution_text AS riasec_attribution_text,
         riasec_source.content_sha256 AS riasec_content_sha256,
         riasec_source.imported_at AS riasec_imported_at,
         presented.id AS presentation_occupation_id,
         presented.locale AS presentation_locale,
         presented.preferred_label AS presentation_preferred_label,
         presented.description AS presentation_description,
         presented.isco_code AS presentation_isco_code,
         presentation_source.id AS presentation_source_id,
         presentation_source.source_kind AS presentation_source_kind,
         presentation_source.source_version AS presentation_source_version,
         presentation_source.locale AS presentation_source_locale,
         presentation_source.title AS presentation_source_title,
         presentation_source.license_name AS presentation_license_name,
         presentation_source.license_url AS presentation_license_url,
         presentation_source.attribution_text AS presentation_attribution_text,
         presentation_source.content_sha256 AS presentation_content_sha256,
         presentation_source.imported_at AS presentation_imported_at,
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

const uniqueSources = (sources = []) => [...new Map(
  sources.filter((source) => source?.id).map((source) => [source.id, source]),
).values()];

const snapshotFromRow = (row) => {
  if (!row) return null;
  return {
    snapshot: {
      id: row.id,
      immutable: true,
      orientationResultId: row.orientation_result_id,
      recommendationAlgorithmVersion: row.recommendation_algorithm_version,
      riasecAlgorithmVersion: row.riasec_algorithm_version,
      preparationAdapterVersion: row.preparation_adapter_version,
      requestedLocale: row.requested_locale,
      includeLocallyExcluded: Boolean(row.include_locally_excluded),
      limit: Number(row.limit_count),
      inputFingerprint: row.input_fingerprint,
      profileFingerprint: row.profile_fingerprint,
      onetSources: parseJson(row.onet_sources_json) || [],
      escoSources: parseJson(row.esco_sources_json) || [],
      createdAt: row.created_at,
    },
    recommendation: parseJson(row.snapshot_json),
  };
};

const createCareerStore = (pool) => {
  const loadMatchContext = async ({
    accountId,
    resultId,
    locale = 'fr',
    includeLocallyExcluded = false,
    candidateLimit = 100,
  }) => {
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
    const safeCandidateLimit = Math.min(
      Math.max(Number(candidateLimit) || 1, 1),
      Math.max(Math.min(occupations.length, 2000), 1),
    );
    const matches = occupations.length > 0
      ? rankOccupations({ userScores, occupations, limit: safeCandidateLimit })
      : [];

    return {
      result: {
        id: resultRow.id,
        displayCode: resultRow.display_code,
        algorithmVersion: resultRow.algorithm_version,
        createdAt: resultRow.created_at,
        normalizedScores: userScores,
      },
      summary: {
        requestedLocale,
        locale: requestedLocale,
        eligibleOccupationCount: occupations.length,
        translatedOccupationCount: occupations.filter(
          (occupation) => occupation.translationStatus === 'available',
        ).length,
        fallbackOccupationCount: occupations.filter(
          (occupation) => occupation.translationStatus === 'unavailable',
        ).length,
      },
      occupations,
      matches,
    };
  };

  const loadProfileContext = async (accountId) => {
    const [[[profile]], [education], [confirmedSkills]] = await Promise.all([
      pool.query(
        `SELECT account_id, current_situation, primary_goal, mobility_scope,
                completion_percent, updated_at
         FROM account_profiles
         WHERE account_id = ?
         LIMIT 1`,
        [accountId],
      ),
      pool.query(
        `SELECT education_level, status, diploma_name, field_of_study, institution,
                country_code, start_year, end_year, updated_at
         FROM account_education_history
         WHERE account_id = ?
         ORDER BY start_year DESC, created_at DESC`,
        [accountId],
      ),
      pool.query(
        `SELECT label, esco_uri, proficiency, source, updated_at
         FROM account_profile_skills
         WHERE account_id = ?
           AND confirmation_status = 'confirmed'
           AND esco_uri IS NOT NULL
           AND esco_uri <> ''
         ORDER BY label, esco_uri`,
        [accountId],
      ),
    ]);
    return { profile: profile || null, education, confirmedSkills };
  };

  const loadSkillLinks = async ({ accountId, occupations, confirmedSkills }) => {
    const linksByOccupation = new Map();
    const sources = [];
    if (!confirmedSkills.length || !occupations.length) return { linksByOccupation, sources };
    const occupationIds = [...new Set(
      occupations.map((occupation) => occupation.presentationOccupationId).filter(Boolean),
    )];
    if (!occupationIds.length) return { linksByOccupation, sources };
    const placeholders = occupationIds.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT link.occupation_id,
              profile_skill.esco_uri,
              catalog_skill.preferred_label AS label,
              profile_skill.proficiency,
              link.relation_kind,
              link.importance_score,
              skill_source.id AS skill_source_id,
              skill_source.source_kind AS skill_source_kind,
              skill_source.source_version AS skill_source_version,
              skill_source.locale AS skill_source_locale,
              skill_source.title AS skill_source_title,
              skill_source.license_name AS skill_license_name,
              skill_source.license_url AS skill_license_url,
              skill_source.attribution_text AS skill_attribution_text,
              skill_source.content_sha256 AS skill_content_sha256,
              skill_source.imported_at AS skill_imported_at
       FROM account_profile_skills profile_skill
       JOIN career_skills catalog_skill
         ON catalog_skill.source_code = profile_skill.esco_uri
       JOIN career_catalog_sources skill_source
         ON skill_source.id = catalog_skill.catalog_source_id
        AND skill_source.source_kind = 'esco'
       JOIN career_occupation_skill_links link
         ON link.skill_id = catalog_skill.id
       WHERE profile_skill.account_id = ?
         AND profile_skill.confirmation_status = 'confirmed'
         AND profile_skill.esco_uri IS NOT NULL
         AND link.occupation_id IN (${placeholders})
       ORDER BY link.occupation_id,
                CASE link.relation_kind WHEN 'essential' THEN 1 WHEN 'important' THEN 2 ELSE 3 END,
                catalog_skill.preferred_label`,
      [accountId, ...occupationIds],
    );
    for (const row of rows) {
      const current = linksByOccupation.get(row.occupation_id) || [];
      current.push({
        escoUri: row.esco_uri,
        label: row.label,
        proficiency: row.proficiency,
        relationKind: row.relation_kind,
        importanceScore: row.importance_score === null ? null : Number(row.importance_score),
      });
      linksByOccupation.set(row.occupation_id, current);
      sources.push(sourceFromRow(row, 'skill'));
    }
    return { linksByOccupation, sources: uniqueSources(sources) };
  };

  const recommendProfileCareers = async ({
    accountId,
    resultId,
    locale = 'fr',
    includeLocallyExcluded = false,
    limit = 20,
  }) => {
    const safeLimit = boundedInteger(limit, 20, 1, 100);
    const requestedLocale = validLocale(locale);
    const context = await loadMatchContext({
      accountId,
      resultId,
      locale: requestedLocale,
      includeLocallyExcluded,
      candidateLimit: 2000,
    });
    if (!context) return null;
    const profileData = await loadProfileContext(accountId);
    const skillLinkData = await loadSkillLinks({
      accountId,
      occupations: context.occupations,
      confirmedSkills: profileData.confirmedSkills,
    });
    const occupationsById = new Map(
      context.occupations.map((occupation) => [occupation.id, occupation]),
    );
    const catalogSources = uniqueSources([
      ...context.occupations.flatMap((occupation) => [occupation.riasecSource, occupation.presentationSource]),
      ...skillLinkData.sources,
    ]);
    const inputVersion = buildRecommendationInputVersion({
      recommendationAlgorithmVersion: PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
      result: context.result,
      profile: profileData.profile,
      education: profileData.education,
      confirmedSkills: profileData.confirmedSkills,
      catalogSources,
      locale: requestedLocale,
      includeLocallyExcluded,
      limit: safeLimit,
    });
    const matches = rankProfileRecommendations({
      baseMatches: context.matches,
      occupationsById,
      profile: profileData.profile,
      education: profileData.education,
      confirmedSkills: profileData.confirmedSkills,
      skillLinksByOccupation: skillLinkData.linksByOccupation,
      limit: safeLimit,
    });
    const versioning = {
      recommendationAlgorithmVersion: PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
      riasecAlgorithmVersion: context.result.algorithmVersion,
      preparationAdapterVersion: PREPARATION_ADAPTER_VERSION,
      inputFingerprint: inputVersion.fingerprint,
      profileFingerprint: inputVersion.profileFingerprint,
      catalogSources: inputVersion.catalogSources,
      calculatedAt: new Date().toISOString(),
    };

    return {
      result: context.result,
      versioning,
      recommendationContext: profileRecommendationContext({
        ...profileData,
        versioning,
      }),
      matching: {
        ...context.summary,
        matches,
      },
    };
  };

  const findSnapshotByInput = async ({
    accountId,
    resultId,
    locale,
    includeLocallyExcluded,
    limit,
    inputFingerprint,
  }) => {
    const [[row]] = await pool.query(
      `SELECT *
       FROM career_recommendation_snapshots
       WHERE account_id = ?
         AND orientation_result_id = ?
         AND recommendation_algorithm_version = ?
         AND requested_locale = ?
         AND include_locally_excluded = ?
         AND limit_count = ?
         AND input_fingerprint = ?
       LIMIT 1`,
      [
        accountId,
        resultId,
        PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
        locale,
        includeLocallyExcluded ? 1 : 0,
        limit,
        inputFingerprint,
      ],
    );
    return snapshotFromRow(row);
  };

  const createRecommendationSnapshot = async ({
    accountId,
    resultId,
    locale = 'fr',
    includeLocallyExcluded = false,
    limit = 20,
  }) => {
    const safeLimit = boundedInteger(limit, 20, 1, 100);
    const requestedLocale = validLocale(locale);
    const recommendation = await recommendProfileCareers({
      accountId,
      resultId,
      locale: requestedLocale,
      includeLocallyExcluded,
      limit: safeLimit,
    });
    if (!recommendation) return null;
    const existing = await findSnapshotByInput({
      accountId,
      resultId,
      locale: requestedLocale,
      includeLocallyExcluded,
      limit: safeLimit,
      inputFingerprint: recommendation.versioning.inputFingerprint,
    });
    if (existing) return { ...existing, created: false };

    const snapshotId = crypto.randomUUID();
    const onetSources = recommendation.versioning.catalogSources.filter((source) => source.kind === 'onet');
    const escoSources = recommendation.versioning.catalogSources.filter((source) => source.kind === 'esco');
    try {
      await pool.execute(
        `INSERT INTO career_recommendation_snapshots (
           id, account_id, orientation_result_id,
           recommendation_algorithm_version, riasec_algorithm_version,
           preparation_adapter_version, requested_locale,
           include_locally_excluded, limit_count, input_fingerprint,
           profile_fingerprint, onet_sources_json, esco_sources_json,
           snapshot_json
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          snapshotId,
          accountId,
          resultId,
          recommendation.versioning.recommendationAlgorithmVersion,
          recommendation.versioning.riasecAlgorithmVersion,
          recommendation.versioning.preparationAdapterVersion,
          requestedLocale,
          includeLocallyExcluded ? 1 : 0,
          safeLimit,
          recommendation.versioning.inputFingerprint,
          recommendation.versioning.profileFingerprint,
          JSON.stringify(onetSources),
          JSON.stringify(escoSources),
          JSON.stringify(recommendation),
        ],
      );
    } catch (error) {
      if (error?.code !== 'ER_DUP_ENTRY') throw error;
      const raced = await findSnapshotByInput({
        accountId,
        resultId,
        locale: requestedLocale,
        includeLocallyExcluded,
        limit: safeLimit,
        inputFingerprint: recommendation.versioning.inputFingerprint,
      });
      if (raced) return { ...raced, created: false };
      throw error;
    }
    const created = await findSnapshotByInput({
      accountId,
      resultId,
      locale: requestedLocale,
      includeLocallyExcluded,
      limit: safeLimit,
      inputFingerprint: recommendation.versioning.inputFingerprint,
    });
    return { ...created, created: true };
  };

  return {
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

      if (riasecOnly) where.push(`base.riasec_profile_status IN ('direct', 'mapped', 'reviewed')`);
      if (!includeLocallyExcluded) where.push(`base.local_relevance_status <> 'excluded'`);
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
      const safeLimit = boundedInteger(limit, 20, 1, 100);
      const context = await loadMatchContext({
        accountId,
        resultId,
        locale,
        includeLocallyExcluded,
        candidateLimit: safeLimit,
      });
      if (!context) return null;
      return {
        result: context.result,
        matching: {
          ...context.summary,
          matches: context.matches.slice(0, safeLimit),
        },
      };
    },

    recommendProfileCareers,
    createRecommendationSnapshot,

    async getRecommendationSnapshot({ accountId, snapshotId }) {
      const [[row]] = await pool.query(
        `SELECT *
         FROM career_recommendation_snapshots
         WHERE id = ? AND account_id = ?
         LIMIT 1`,
        [snapshotId, accountId],
      );
      return snapshotFromRow(row);
    },
  };
};

module.exports = {
  createCareerStore,
  normalizedResultScores,
  rowToOccupation,
  validLocale,
};
