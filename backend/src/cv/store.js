'use strict';

const parseJson = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  return typeof value === 'string'
    ? JSON.parse(value)
    : value;
};

const boundedInteger = (
  value,
  fallback,
  minimum,
  maximum,
) => {
  const numeric = Number(value);

  if (!Number.isInteger(numeric)) {
    return fallback;
  }

  return Math.min(
    Math.max(numeric, minimum),
    maximum,
  );
};

const serializeDate = (value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const rowToSummary = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    algorithmVersion: row.algorithm_version,
    document: {
      fileName: row.file_name,
      mimeType: row.mime_type,
      fileSize: Number(row.file_size),
      pageCount:
        row.page_count === null
          ? null
          : Number(row.page_count),
      detectedLanguage: row.detected_language,
    },
    scores: {
      generalReadiness:
        Number(row.general_readiness),
      targetRelevance:
        row.target_relevance === null
          ? null
          : Number(row.target_relevance),
    },
    targetTitle: row.target_title,
    createdAt: serializeDate(row.created_at),
  };
};

const rowToAnalysis = (row) => {
  if (!row) return null;

  return {
    ...rowToSummary(row),
    snapshot: parseJson(row.analysis_snapshot),
  };
};

const ANALYSIS_SELECT = `
  SELECT
    id,
    account_id,
    algorithm_version,
    file_name,
    mime_type,
    file_size,
    page_count,
    detected_language,
    general_readiness,
    target_relevance,
    target_title,
    analysis_snapshot,
    created_at
  FROM cv_analyses
`;

const createCvStore = (pool) => {
  if (
    !pool
    || typeof pool.execute !== 'function'
  ) {
    throw new Error(
      'A MySQL pool is required for the CV store.',
    );
  }

  const getAnalysis = async ({
    accountId,
    analysisId,
  }) => {
    const [[row]] = await pool.execute(
      `${ANALYSIS_SELECT}
       WHERE id = ?
         AND account_id = ?
       LIMIT 1`,
      [analysisId, accountId],
    );

    return rowToAnalysis(row);
  };

  return {
    async createAnalysis({
      id,
      accountId,
      algorithmVersion,
      fileName,
      mimeType,
      fileSize,
      pageCount,
      sourceSha256,
      detectedLanguage,
      generalReadiness,
      targetRelevance,
      targetTitle,
      snapshot,
    }) {
      await pool.execute(
        `INSERT INTO cv_analyses (
           id,
           account_id,
           algorithm_version,
           file_name,
           mime_type,
           file_size,
           page_count,
           source_sha256,
           detected_language,
           general_readiness,
           target_relevance,
           target_title,
           analysis_snapshot
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          accountId,
          algorithmVersion,
          fileName,
          mimeType,
          fileSize,
          pageCount,
          sourceSha256,
          detectedLanguage,
          generalReadiness,
          targetRelevance,
          targetTitle,
          JSON.stringify(snapshot),
        ],
      );

      return getAnalysis({
        accountId,
        analysisId: id,
      });
    },

    async listAnalyses({
      accountId,
      limit = 20,
      offset = 0,
    }) {
      const safeLimit = boundedInteger(
        limit,
        20,
        1,
        100,
      );

      const safeOffset = boundedInteger(
        offset,
        0,
        0,
        100000,
      );

      const [[countRow]] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM cv_analyses
         WHERE account_id = ?`,
        [accountId],
      );

      const [rows] = await pool.execute(
        `SELECT
           id,
           algorithm_version,
           file_name,
           mime_type,
           file_size,
           page_count,
           detected_language,
           general_readiness,
           target_relevance,
           target_title,
           created_at
         FROM cv_analyses
         WHERE account_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        [accountId],
      );

      return {
        analyses: rows.map(rowToSummary),
        pagination: {
          limit: safeLimit,
          offset: safeOffset,
          total: Number(countRow.total),
        },
      };
    },

    getAnalysis,

    async deleteAnalysis({
      accountId,
      analysisId,
    }) {
      const [result] = await pool.execute(
        `DELETE FROM cv_analyses
         WHERE id = ?
           AND account_id = ?`,
        [analysisId, accountId],
      );

      return result.affectedRows === 1;
    },
  };
};

module.exports = {
  boundedInteger,
  createCvStore,
  parseJson,
  rowToAnalysis,
  rowToSummary,
};
