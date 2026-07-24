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

const rowToOccupation = (row) => row ? {
  id: row.id,
  sourceCode: row.source_code,
  locale: row.locale,
  preferredLabel: row.preferred_label,
  description: row.description,
  status: row.status,
  iscoCode: row.isco_code,
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
  source: {
    id: row.catalog_source_id,
    kind: row.source_kind,
    version: row.source_version,
    title: row.source_title,
    licenseName: row.license_name,
    licenseUrl: row.license_url,
    attribution: row.attribution_text,
  },
} : null;

const normalizedResultScores = (scores) => Object.fromEntries(
  ['R', 'I', 'A', 'S', 'E', 'C'].map((dimension) => {
    const normalized = Number(scores?.[dimension]?.normalized);
    if (!Number.isFinite(normalized)) {
      throw new Error(`Orientation result is missing normalized score ${dimension}`);
    }
    return [dimension, normalized];
  }),
);

const occupationSelect = `
  SELECT o.*,
         s.source_kind, s.source_version, s.title AS source_title,
         s.license_name, s.license_url, s.attribution_text
  FROM career_occupations o
  JOIN career_catalog_sources s ON s.id = o.catalog_source_id
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
    locale = 'en',
    riasecOnly = false,
    includeLocallyExcluded = false,
    limit = 20,
    offset = 0,
  } = {}) {
    const safeLimit = boundedInteger(limit, 20, 1, 100);
    const safeOffset = boundedInteger(offset, 0, 0, 100_000);
    const normalizedQuery = String(query || '').trim().slice(0, 120);
    const where = [`o.status = 'active'`, 'o.locale = ?'];
    const parameters = [locale];

    if (riasecOnly) {
      where.push(`o.riasec_profile_status IN ('direct', 'mapped', 'reviewed')`);
    }
    if (!includeLocallyExcluded) {
      where.push(`o.local_relevance_status <> 'excluded'`);
    }
    if (normalizedQuery) {
      const pattern = `%${normalizedQuery}%`;
      where.push(`(
        o.preferred_label LIKE ? OR o.description LIKE ? OR EXISTS (
          SELECT 1 FROM career_occupation_aliases a
          WHERE a.occupation_id = o.id AND a.alias LIKE ?
        )
      )`);
      parameters.push(pattern, pattern, pattern);
    }

    const [rows] = await pool.query(
      `${occupationSelect}
       WHERE ${where.join(' AND ')}
       ORDER BY o.preferred_label, o.id
       LIMIT ? OFFSET ?`,
      [...parameters, safeLimit, safeOffset],
    );
    return rows.map(rowToOccupation);
  },

  async getOccupation({ occupationId }) {
    const [[row]] = await pool.query(
      `${occupationSelect} WHERE o.id = ? LIMIT 1`,
      [occupationId],
    );
    if (!row) return null;

    const [aliases] = await pool.query(
      `SELECT locale, alias, alias_kind, source_reference
       FROM career_occupation_aliases
       WHERE occupation_id = ?
       ORDER BY locale, alias`,
      [occupationId],
    );
    const [skills] = await pool.query(
      `SELECT s.id, s.locale, s.preferred_label, s.description, s.skill_kind,
              link.relation_kind, link.importance_score, link.provenance_json
       FROM career_occupation_skill_links link
       JOIN career_skills s ON s.id = link.skill_id
       WHERE link.occupation_id = ?
       ORDER BY link.relation_kind, link.importance_score DESC, s.preferred_label`,
      [occupationId],
    );

    return {
      ...rowToOccupation(row),
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
    locale = 'en',
    includeLocallyExcluded = false,
    limit = 20,
  }) {
    const [[resultRow]] = await pool.query(
      `SELECT id, scores_json, display_code, algorithm_version, created_at
       FROM orientation_results
       WHERE id = ? AND account_id = ?
       LIMIT 1`,
      [resultId, accountId],
    );
    if (!resultRow) return null;

    const where = [
      `o.status = 'active'`,
      `o.locale = ?`,
      `o.riasec_profile_status IN ('direct', 'mapped', 'reviewed')`,
    ];
    if (!includeLocallyExcluded) where.push(`o.local_relevance_status <> 'excluded'`);

    const [rows] = await pool.query(
      `${occupationSelect}
       WHERE ${where.join(' AND ')}`,
      [locale],
    );
    const occupations = rows.map(rowToOccupation);
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
        locale,
        eligibleOccupationCount: occupations.length,
        matches,
      },
    };
  },
});

module.exports = {
  createCareerStore,
  normalizedResultScores,
  rowToOccupation,
};
