'use strict';

const { createDatabasePool } = require('../src/db/pool');

const auditEscoFallbacks = async (pool) => {
  const [[escoSource]] = await pool.query(
    `SELECT id, source_version, locale, content_sha256
     FROM career_catalog_sources
     WHERE source_kind = 'esco' AND locale = 'fr'
     ORDER BY imported_at DESC LIMIT 1`,
  );
  if (!escoSource) throw new Error('No French ESCO catalog source is installed.');

  const [[onetSource]] = await pool.query(
    `SELECT id, source_version, locale, content_sha256
     FROM career_catalog_sources
     WHERE source_kind = 'onet' AND locale = 'en'
     ORDER BY imported_at DESC LIMIT 1`,
  );
  if (!onetSource) throw new Error('No English O*NET catalog source is installed.');

  const [rows] = await pool.query(
    `SELECT
       source.id,
       source.source_code,
       source.preferred_label,
       source.riasec_profile_status,
       source.local_relevance_status,
       COUNT(crosswalk.target_occupation_id) AS stored_crosswalk_count,
       SUM(CASE
         WHEN crosswalk.review_status IN ('official', 'reviewed')
         THEN 1 ELSE 0 END) AS official_or_reviewed_crosswalk_count,
       SUM(CASE
         WHEN crosswalk.review_status IN ('official', 'reviewed')
          AND target.catalog_source_id = ?
          AND target.locale = 'fr'
          AND target.status = 'active'
         THEN 1 ELSE 0 END) AS active_french_esco_crosswalk_count
     FROM career_occupations source
     LEFT JOIN career_occupation_crosswalks crosswalk
       ON crosswalk.source_occupation_id = source.id
     LEFT JOIN career_occupations target
       ON target.id = crosswalk.target_occupation_id
     WHERE source.catalog_source_id = ?
       AND source.locale = 'en'
       AND source.status = 'active'
       AND source.riasec_profile_status IN ('direct', 'mapped', 'reviewed')
     GROUP BY source.id, source.source_code, source.preferred_label,
              source.riasec_profile_status, source.local_relevance_status
     HAVING active_french_esco_crosswalk_count = 0
     ORDER BY source.source_code, source.preferred_label`,
    [escoSource.id, onetSource.id],
  );

  const fallbacks = rows.map((row) => {
    const storedCrosswalkCount = Number(row.stored_crosswalk_count || 0);
    const officialOrReviewedCrosswalkCount = Number(
      row.official_or_reviewed_crosswalk_count || 0,
    );
    const activeFrenchEscoCrosswalkCount = Number(
      row.active_french_esco_crosswalk_count || 0,
    );

    let reason = 'no-stored-crosswalk';
    if (storedCrosswalkCount > 0 && officialOrReviewedCrosswalkCount === 0) {
      reason = 'only-non-approved-crosswalks';
    } else if (
      officialOrReviewedCrosswalkCount > 0
      && activeFrenchEscoCrosswalkCount === 0
    ) {
      reason = 'approved-crosswalk-without-active-french-esco-target';
    }

    const code = String(row.source_code || '');
    return {
      onetCode: code,
      socCode: code.split('.')[0] || null,
      title: row.preferred_label,
      riasecProfileStatus: row.riasec_profile_status,
      localRelevanceStatus: row.local_relevance_status,
      storedCrosswalkCount,
      officialOrReviewedCrosswalkCount,
      activeFrenchEscoCrosswalkCount,
      fallbackReason: reason,
    };
  });

  const reasonDistribution = fallbacks.reduce((summary, fallback) => {
    summary[fallback.fallbackReason] = (summary[fallback.fallbackReason] || 0) + 1;
    return summary;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    sources: {
      onet: {
        id: onetSource.id,
        version: onetSource.source_version,
        contentSha256: onetSource.content_sha256,
      },
      esco: {
        id: escoSource.id,
        version: escoSource.source_version,
        contentSha256: escoSource.content_sha256,
      },
    },
    fallbackCount: fallbacks.length,
    reasonDistribution,
    fallbacks,
    interpretation: {
      listContainsOnlyActiveOnetOccupationsEligibleForRiasec: true,
      approvedCrosswalkStatuses: ['official', 'reviewed'],
      requiredPresentationTarget: 'active French ESCO occupation',
      noAutomaticMappingIsCreatedByThisAudit: true,
    },
  };
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  try {
    const report = await auditEscoFallbacks(pool);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`ESCO fallback audit failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { auditEscoFallbacks };
