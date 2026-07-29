'use strict';

const crypto = require('node:crypto');
const {
  SYNTHESIS_ENGINE_VERSION,
  SYNTHESIS_SCHEMA_VERSION,
  buildProfileSynthesis,
} = require('./synthesis-builder');

class ProfileSynthesisError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'ProfileSynthesisError';
    this.code = code;
    this.status = status;
  }
}

const parseJson = (value) => {
  if (value === null || value === undefined) return value;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const mapSynthesis = (row) => row ? {
  snapshot: {
    id: row.id,
    immutable: true,
    schemaVersion: row.synthesis_schema_version,
    engineVersion: row.synthesis_engine_version,
    orientationResultId: row.orientation_result_id,
    recommendationSnapshotId: row.career_recommendation_snapshot_id,
    riasecAlgorithmVersion: row.riasec_algorithm_version,
    recommendationAlgorithmVersion: row.recommendation_algorithm_version,
    inputFingerprint: row.input_fingerprint,
    createdAt: row.created_at,
  },
  synthesis: parseJson(row.snapshot_json),
} : null;

const createProfileSynthesisStore = (pool) => {
  if (!pool || typeof pool.query !== 'function') {
    throw new Error('A MySQL pool is required for the profile synthesis store.');
  }

  const loadOrientationResult = async (accountId, resultId) => {
    const parameters = resultId ? [resultId, accountId] : [accountId];
    const condition = resultId ? 'id = ? AND account_id = ?' : 'account_id = ?';
    const [[row]] = await pool.query(
      `SELECT id, account_id, instrument_id, algorithm_version, primary_code,
              display_code, scores_json, ranking_json, differentiation_json, created_at
       FROM orientation_results
       WHERE ${condition}
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      parameters,
    );
    if (!row) {
      throw new ProfileSynthesisError(
        'PROFILE_SYNTHESIS_RIASEC_REQUIRED',
        'A versioned RIASEC result is required before creating a profile synthesis.',
        409,
      );
    }
    return {
      ...row,
      scores_json: parseJson(row.scores_json),
      ranking_json: parseJson(row.ranking_json),
      differentiation_json: parseJson(row.differentiation_json),
    };
  };

  const loadRecommendationSnapshot = async (accountId, resultId, snapshotId) => {
    const parameters = snapshotId
      ? [snapshotId, accountId, resultId]
      : [accountId, resultId];
    const condition = snapshotId
      ? 'id = ? AND account_id = ? AND orientation_result_id = ?'
      : 'account_id = ? AND orientation_result_id = ?';
    const [[row]] = await pool.query(
      `SELECT *
       FROM career_recommendation_snapshots
       WHERE ${condition}
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      parameters,
    );
    if (!row) {
      throw new ProfileSynthesisError(
        snapshotId
          ? 'PROFILE_SYNTHESIS_RECOMMENDATION_NOT_FOUND'
          : 'PROFILE_SYNTHESIS_RECOMMENDATION_REQUIRED',
        snapshotId
          ? 'The requested recommendation snapshot does not exist for this account and RIASEC result.'
          : 'An immutable recommendation snapshot is required before creating a profile synthesis.',
        snapshotId ? 404 : 409,
      );
    }
    return {
      ...row,
      onet_sources_json: parseJson(row.onet_sources_json),
      esco_sources_json: parseJson(row.esco_sources_json),
      snapshot_json: parseJson(row.snapshot_json),
    };
  };

  const loadProfileSources = async (accountId) => {
    const [[[profile]], [education], [skills], [hypotheses]] = await Promise.all([
      pool.query(
        `SELECT first_name, last_name, city, country_code, current_situation,
                primary_goal, mobility_scope, profile_summary, completion_percent, updated_at
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
        `SELECT label, esco_uri, proficiency, source, evidence, updated_at
         FROM account_profile_skills
         WHERE account_id = ?
           AND confirmation_status = 'confirmed'
           AND esco_uri IS NOT NULL
           AND esco_uri <> ''
         ORDER BY esco_uri, label`,
        [accountId],
      ),
      pool.query(
        `SELECT id, hypothesis_type, value_json, rationale, confidence, status,
                created_at, updated_at
         FROM account_profile_hypotheses
         WHERE account_id = ?
           AND status IN ('confirmed', 'rejected')
         ORDER BY id`,
        [accountId],
      ),
    ]);
    return {
      profile: profile || null,
      education,
      skills,
      hypotheses: hypotheses.map((item) => ({
        ...item,
        value_json: parseJson(item.value_json),
        confidence: item.confidence === null ? null : Number(item.confidence),
      })),
    };
  };

  const findByInput = async (accountId, inputFingerprint) => {
    const [[row]] = await pool.query(
      `SELECT *
       FROM profile_synthesis_snapshots
       WHERE account_id = ?
         AND synthesis_engine_version = ?
         AND input_fingerprint = ?
       LIMIT 1`,
      [accountId, SYNTHESIS_ENGINE_VERSION, inputFingerprint],
    );
    return mapSynthesis(row);
  };

  return {
    async create({ accountId, orientationResultId = null, recommendationSnapshotId = null }) {
      const orientationResult = await loadOrientationResult(accountId, orientationResultId);
      const recommendationSnapshot = await loadRecommendationSnapshot(
        accountId,
        orientationResult.id,
        recommendationSnapshotId,
      );
      const profileSources = await loadProfileSources(accountId);
      const built = buildProfileSynthesis({
        ...profileSources,
        orientationResult,
        recommendationSnapshot,
      });

      const existing = await findByInput(accountId, built.inputFingerprint);
      if (existing) return { ...existing, created: false };

      const id = crypto.randomUUID();
      try {
        await pool.query(
          `INSERT INTO profile_synthesis_snapshots (
             id, account_id, orientation_result_id, career_recommendation_snapshot_id,
             synthesis_schema_version, synthesis_engine_version,
             riasec_algorithm_version, recommendation_algorithm_version,
             input_fingerprint, snapshot_json
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            accountId,
            orientationResult.id,
            recommendationSnapshot.id,
            SYNTHESIS_SCHEMA_VERSION,
            SYNTHESIS_ENGINE_VERSION,
            orientationResult.algorithm_version,
            recommendationSnapshot.recommendation_algorithm_version,
            built.inputFingerprint,
            JSON.stringify(built.snapshot),
          ],
        );
      } catch (error) {
        if (error?.code !== 'ER_DUP_ENTRY') throw error;
        const raced = await findByInput(accountId, built.inputFingerprint);
        if (raced) return { ...raced, created: false };
        throw error;
      }

      const created = await findByInput(accountId, built.inputFingerprint);
      return { ...created, created: true };
    },

    async list(accountId, limit = 20) {
      const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
      const [rows] = await pool.query(
        `SELECT *
         FROM profile_synthesis_snapshots
         WHERE account_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT ?`,
        [accountId, safeLimit],
      );
      return rows.map(mapSynthesis);
    },

    async get(accountId, synthesisId) {
      const [[row]] = await pool.query(
        `SELECT *
         FROM profile_synthesis_snapshots
         WHERE id = ? AND account_id = ?
         LIMIT 1`,
        [synthesisId, accountId],
      );
      return mapSynthesis(row);
    },
  };
};

module.exports = {
  ProfileSynthesisError,
  createProfileSynthesisStore,
};
