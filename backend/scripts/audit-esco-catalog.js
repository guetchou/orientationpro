'use strict';

const { createDatabasePool } = require('../src/db/pool');

const rowsToObject = (rows, key, value = 'count') => Object.fromEntries(
  rows.map((row) => [String(row[key] ?? 'unknown'), Number(row[value] || 0)]),
);

const auditEscoCatalog = async (pool) => {
  const [[escoSource]] = await pool.query(
    `SELECT id, source_version, locale, title, content_sha256, record_count,
            imported_at, metadata_json
     FROM career_catalog_sources
     WHERE source_kind = 'esco'
       AND locale = 'fr'
     ORDER BY imported_at DESC
     LIMIT 1`,
  );
  if (!escoSource) throw new Error('No French ESCO catalog source is installed.');

  const [[onetSource]] = await pool.query(
    `SELECT id, source_version, locale, title, content_sha256, record_count,
            imported_at
     FROM career_catalog_sources
     WHERE source_kind = 'onet'
       AND locale = 'en'
     ORDER BY imported_at DESC
     LIMIT 1`,
  );
  if (!onetSource) throw new Error('No English O*NET catalog source is installed.');

  const [occupationStatusRows] = await pool.query(
    `SELECT status, COUNT(*) AS count
     FROM career_occupations
     WHERE catalog_source_id = ?
     GROUP BY status
     ORDER BY status`,
    [escoSource.id],
  );

  const [[skillCount]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM career_skills
     WHERE catalog_source_id = ?`,
    [escoSource.id],
  );

  const [[skillRelationCount]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM career_occupation_skill_links link
     JOIN career_occupations occupation
       ON occupation.id = link.occupation_id
     WHERE occupation.catalog_source_id = ?
       AND JSON_UNQUOTE(JSON_EXTRACT(link.provenance_json, '$.sourceId')) = ?`,
    [escoSource.id, escoSource.id],
  );

  const [[onetEligible]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM career_occupations
     WHERE catalog_source_id = ?
       AND locale = 'en'
       AND status = 'active'
       AND riasec_profile_status IN ('direct', 'mapped', 'reviewed')`,
    [onetSource.id],
  );

  const [[crosswalkSummary]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COUNT(DISTINCT crosswalk.source_occupation_id) AS source_occupations,
            COUNT(DISTINCT crosswalk.target_occupation_id) AS target_occupations,
            COUNT(DISTINCT CASE WHEN target.status = 'active' THEN crosswalk.source_occupation_id END) AS sources_with_active_target,
            COUNT(DISTINCT CASE WHEN target.status = 'active' THEN crosswalk.target_occupation_id END) AS active_targets,
            SUM(CASE WHEN target.status <> 'active' THEN 1 ELSE 0 END) AS mappings_to_non_active_targets
     FROM career_occupation_crosswalks crosswalk
     JOIN career_occupations source ON source.id = crosswalk.source_occupation_id
     JOIN career_occupations target ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND target.catalog_source_id = ?
       AND crosswalk.review_status IN ('official', 'reviewed')`,
    [onetSource.id, escoSource.id],
  );

  const [mappingKindRows] = await pool.query(
    `SELECT crosswalk.mapping_kind, COUNT(*) AS count
     FROM career_occupation_crosswalks crosswalk
     JOIN career_occupations source ON source.id = crosswalk.source_occupation_id
     JOIN career_occupations target ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND target.catalog_source_id = ?
       AND crosswalk.review_status IN ('official', 'reviewed')
     GROUP BY crosswalk.mapping_kind
     ORDER BY crosswalk.mapping_kind`,
    [onetSource.id, escoSource.id],
  );

  const [confidenceRows] = await pool.query(
    `SELECT crosswalk.confidence_level, COUNT(*) AS count
     FROM career_occupation_crosswalks crosswalk
     JOIN career_occupations source ON source.id = crosswalk.source_occupation_id
     JOIN career_occupations target ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND target.catalog_source_id = ?
       AND crosswalk.review_status IN ('official', 'reviewed')
     GROUP BY crosswalk.confidence_level
     ORDER BY crosswalk.confidence_level`,
    [onetSource.id, escoSource.id],
  );

  const [reviewRows] = await pool.query(
    `SELECT crosswalk.review_status, COUNT(*) AS count
     FROM career_occupation_crosswalks crosswalk
     JOIN career_occupations source ON source.id = crosswalk.source_occupation_id
     JOIN career_occupations target ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND target.catalog_source_id = ?
     GROUP BY crosswalk.review_status
     ORDER BY crosswalk.review_status`,
    [onetSource.id, escoSource.id],
  );

  const [crosswalkSources] = await pool.query(
    `SELECT crosswalk.source_version, crosswalk.source_reference,
            COUNT(*) AS count,
            MIN(crosswalk.mapped_at) AS earliest_mapped_at,
            MAX(crosswalk.mapped_at) AS latest_mapped_at
     FROM career_occupation_crosswalks crosswalk
     JOIN career_occupations source ON source.id = crosswalk.source_occupation_id
     JOIN career_occupations target ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND target.catalog_source_id = ?
       AND crosswalk.review_status IN ('official', 'reviewed')
     GROUP BY crosswalk.source_version, crosswalk.source_reference
     ORDER BY count DESC`,
    [onetSource.id, escoSource.id],
  );

  const occupationStatus = rowsToObject(occupationStatusRows, 'status');
  const eligibleOnet = Number(onetEligible.count || 0);
  const sourcesWithActiveTarget = Number(crosswalkSummary.sources_with_active_target || 0);
  const fallbackCount = Math.max(eligibleOnet - sourcesWithActiveTarget, 0);

  return {
    generatedAt: new Date().toISOString(),
    esco: {
      sourceId: escoSource.id,
      version: escoSource.source_version,
      locale: escoSource.locale,
      contentSha256: escoSource.content_sha256,
      importedAt: escoSource.imported_at,
      declaredRecordCount: Number(escoSource.record_count || 0),
      occupations: {
        total: Object.values(occupationStatus).reduce((sum, value) => sum + value, 0),
        byStatus: occupationStatus,
      },
      skills: Number(skillCount.count || 0),
      occupationSkillRelations: Number(skillRelationCount.count || 0),
    },
    onet: {
      sourceId: onetSource.id,
      version: onetSource.source_version,
      locale: onetSource.locale,
      contentSha256: onetSource.content_sha256,
      importedAt: onetSource.imported_at,
      eligibleRiasecOccupations: eligibleOnet,
    },
    crosswalk: {
      totalOfficialOrReviewed: Number(crosswalkSummary.total || 0),
      distinctOnetSources: Number(crosswalkSummary.source_occupations || 0),
      distinctEscoTargets: Number(crosswalkSummary.target_occupations || 0),
      onetSourcesWithActiveEscoTarget: sourcesWithActiveTarget,
      activeEscoTargets: Number(crosswalkSummary.active_targets || 0),
      mappingsToNonActiveTargets: Number(crosswalkSummary.mappings_to_non_active_targets || 0),
      byMappingKind: rowsToObject(mappingKindRows, 'mapping_kind'),
      byConfidenceLevel: rowsToObject(confidenceRows, 'confidence_level'),
      byReviewStatus: rowsToObject(reviewRows, 'review_status'),
      sources: crosswalkSources.map((row) => ({
        version: row.source_version,
        reference: row.source_reference,
        count: Number(row.count || 0),
        earliestMappedAt: row.earliest_mapped_at,
        latestMappedAt: row.latest_mapped_at,
      })),
    },
    presentationCoverage: {
      eligibleOnetOccupations: eligibleOnet,
      withActiveFrenchEscoPresentation: sourcesWithActiveTarget,
      fallbackToEnglish: fallbackCount,
      percentWithFrenchEscoPresentation: eligibleOnet > 0
        ? Math.round((sourcesWithActiveTarget / eligibleOnet) * 100000) / 1000
        : 0,
    },
    interpretation: {
      confidenceUnknownMeansMissingNumericSourceScore: true,
      crosswalkReviewStatusUsedForPresentation: ['official', 'reviewed'],
      nonActiveEscoTargetsUsedForPresentation: false,
    },
  };
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  try {
    const report = await auditEscoCatalog(pool);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`ESCO audit failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { auditEscoCatalog, rowsToObject };
