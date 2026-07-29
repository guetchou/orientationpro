'use strict';

const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { buildPortableExport } = require('../operations/data-governance');

class DataRightsError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'DataRightsError';
    this.code = code;
    this.status = status;
  }
}

const withTransaction = async (pool, work) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
};

const createDataRightsService = ({
  pool,
  profileStore,
  lifeProjectStore,
  riasecStore,
  cvStore,
  now = () => new Date(),
  deletionReference = () => crypto.randomUUID(),
} = {}) => {
  if (!pool || typeof pool.query !== 'function' || typeof pool.getConnection !== 'function') {
    throw new TypeError('DATA_RIGHTS_POOL_REQUIRED');
  }

  const loadAccount = async (accountId, executor = pool) => {
    const [[row]] = await executor.query(
      `SELECT a.id, a.email, a.password_hash, a.status,
              (SELECT GROUP_CONCAT(ar.role_id ORDER BY ar.role_id SEPARATOR ',')
               FROM auth_account_roles ar WHERE ar.account_id = a.id) AS roles_csv
       FROM auth_accounts a WHERE a.id = ? LIMIT 1`,
      [accountId],
    );
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      status: row.status,
      roles: row.roles_csv ? row.roles_csv.split(',') : [],
    };
  };

  const loadLifeProjects = async (accountId) => {
    const summaries = await lifeProjectStore.list(accountId);
    const projects = [];
    for (const summary of summaries) {
      const loaded = await lifeProjectStore.get(accountId, summary.id);
      if (loaded) projects.push(loaded);
    }
    return projects;
  };

  const loadCvAnalyses = async (accountId) => {
    const output = [];
    let offset = 0;
    while (true) {
      const page = await cvStore.listAnalyses({ accountId, limit: 100, offset });
      for (const summary of page.analyses) {
        const analysis = await cvStore.getAnalysis({ accountId, analysisId: summary.id });
        if (analysis) output.push(analysis);
      }
      offset += page.analyses.length;
      if (offset >= page.pagination.total || page.analyses.length === 0) break;
    }
    return output;
  };

  return {
    async exportAccount(accountId) {
      const account = await loadAccount(accountId);
      if (!account) throw new DataRightsError('ACCOUNT_NOT_FOUND', 'The account does not exist.', 404);
      const [storedProfile, lifeProjects, results, cvAnalyses] = await Promise.all([
        profileStore.getProfile(accountId),
        loadLifeProjects(accountId),
        riasecStore.listResults({ accountId, limit: 100, offset: 0 }),
        loadCvAnalyses(accountId),
      ]);
      const profile = {
        ownerAccountId: accountId,
        id: accountId,
        preferredName: storedProfile?.profile?.first_name || null,
        skills: (storedProfile?.skills || []).map((skill) => skill.label).filter(Boolean),
      };
      return buildPortableExport({
        requesterAccountId: accountId,
        account,
        profile,
        lifeProjects: lifeProjects.map((loaded) => loaded.project),
        results: results.map((result) => ({
          ...result,
          ownerAccountId: result.accountId || accountId,
          completedAt: result.createdAt,
        })),
        cvAnalyses: cvAnalyses.map((analysis) => ({
          id: analysis.id,
          ownerAccountId: accountId,
          status: analysis.status,
          analyzerVersion: analysis.analyzerVersion,
          createdAt: analysis.createdAt,
        })),
        clock: now,
      });
    },

    async correctProfile(accountId, input) {
      return profileStore.upsertProfile(accountId, input);
    },

    async deleteAccount({ accountId, currentPassword, confirmation }) {
      if (confirmation !== 'SUPPRIMER MON COMPTE') {
        throw new DataRightsError('DELETION_CONFIRMATION_REQUIRED', 'Explicit deletion confirmation is required.', 400);
      }
      if (typeof currentPassword !== 'string' || currentPassword.length < 8 || currentPassword.length > 1024) {
        throw new DataRightsError('REAUTHENTICATION_REQUIRED', 'Current password reauthentication is required.', 401);
      }

      return withTransaction(pool, async (connection) => {
        const account = await loadAccount(accountId, connection);
        if (!account) throw new DataRightsError('ACCOUNT_NOT_FOUND', 'The account does not exist.', 404);
        const verified = await bcrypt.compare(currentPassword, account.passwordHash);
        if (!verified) throw new DataRightsError('REAUTHENTICATION_FAILED', 'Reauthentication failed.', 401);
        const deletedAt = now();
        const reference = deletionReference();
        if (typeof reference !== 'string' || !/^[A-Za-z0-9._:-]{8,128}$/.test(reference)) {
          throw new DataRightsError('DELETION_REFERENCE_INVALID', 'Deletion reference generation failed.', 500);
        }

        await connection.query('UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE account_id = ?', [deletedAt, accountId]);
        await connection.query(
          `DELETE refresh FROM auth_refresh_tokens refresh
           INNER JOIN auth_sessions session ON session.id = refresh.session_id
           WHERE session.account_id = ?`,
          [accountId],
        );
        await connection.query('DELETE FROM profile_synthesis_snapshots WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM career_recommendation_snapshots WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM cv_analyses WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM orientation_results WHERE account_id = ?', [accountId]);
        await connection.query(
          `DELETE response FROM orientation_riasec_responses response
           INNER JOIN orientation_riasec_attempts attempt ON attempt.id = response.attempt_id
           WHERE attempt.account_id = ?`,
          [accountId],
        );
        await connection.query('DELETE FROM orientation_riasec_attempts WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM account_profile_hypotheses WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM account_profile_skills WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM account_education_history WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM account_profiles WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM life_projects WHERE owner_account_id = ?', [accountId]);
        await connection.query('DELETE FROM auth_external_identities WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM auth_email_verification_tokens WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM auth_password_reset_tokens WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM auth_account_roles WHERE account_id = ?', [accountId]);
        await connection.query('DELETE FROM auth_sessions WHERE account_id = ?', [accountId]);
        const [deleted] = await connection.query('DELETE FROM auth_accounts WHERE id = ?', [accountId]);
        if (deleted.affectedRows !== 1) throw new DataRightsError('ACCOUNT_DELETE_CONFLICT', 'Account deletion did not complete.', 409);

        return Object.freeze({
          schemaVersion: 'makoki.data-deletion-result.v1',
          deletionReference: reference,
          deletedAt: deletedAt.toISOString(),
          status: 'deleted',
        });
      });
    },
  };
};

module.exports = { DataRightsError, createDataRightsService };
