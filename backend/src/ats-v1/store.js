'use strict';

const { createTransitionEvent, AtsWorkflowError } = require('./workflow');

class AtsPersistenceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsPersistenceError';
    this.code = code;
    this.details = details;
  }
}

const mapApplication = (row) => row ? Object.freeze({
  id: row.id,
  jobId: row.job_id,
  candidateAccountId: row.candidate_account_id,
  cvAnalysisId: row.cv_analysis_id || null,
  state: row.state,
  version: Number(row.version),
  submittedAt: row.submitted_at,
  updatedAt: row.updated_at,
}) : null;

const createAtsStore = (pool, { clock = () => new Date() } = {}) => {
  if (!pool || typeof pool.getConnection !== 'function') {
    throw new Error('A MySQL pool is required for ATS persistence.');
  }

  const getApplication = async (applicationId) => {
    const [rows] = await pool.query(
      `SELECT id, job_id, candidate_account_id, cv_analysis_id, state, version, submitted_at, updated_at
       FROM ats_applications_v1 WHERE id = ? LIMIT 1`,
      [applicationId],
    );
    return mapApplication(rows[0]);
  };

  const listApplicationsForCandidate = async (candidateAccountId) => {
    const [rows] = await pool.query(
      `SELECT id, job_id, candidate_account_id, cv_analysis_id, state, version, submitted_at, updated_at
       FROM ats_applications_v1
       WHERE candidate_account_id = ?
       ORDER BY submitted_at DESC, id DESC`,
      [candidateAccountId],
    );
    return rows.map(mapApplication);
  };

  const createApplication = async ({ id, jobId, candidateAccountId, cvAnalysisId = null, occurredAt }) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [jobRows] = await connection.query(
        'SELECT id, status FROM ats_jobs_v1 WHERE id = ? FOR UPDATE',
        [jobId],
      );
      const job = jobRows[0];
      if (!job) {
        throw new AtsPersistenceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
      }
      if (job.status !== 'published') {
        throw new AtsPersistenceError('ATS_JOB_NOT_PUBLISHED', 'The job is not open for applications.');
      }

      const timestamp = occurredAt instanceof Date ? occurredAt : new Date(occurredAt || clock());
      const timestampSql = timestamp.toISOString().slice(0, 23).replace('T', ' ');

      try {
        await connection.query(
          `INSERT INTO ats_applications_v1
            (id, job_id, candidate_account_id, cv_analysis_id, state, version, submitted_at, updated_at)
           VALUES (?, ?, ?, ?, 'submitted', 1, ?, ?)`,
          [id, jobId, candidateAccountId, cvAnalysisId, timestampSql, timestampSql],
        );
      } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new AtsPersistenceError('ATS_APPLICATION_ALREADY_EXISTS', 'A candidate may only apply once per job.');
        }
        throw error;
      }

      const event = Object.freeze({
        schemaVersion: 'makoki-ats-workflow-event-v1',
        applicationId: id,
        eventType: 'application.submitted',
        from: 'submitted',
        to: 'submitted',
        actorAccountId: candidateAccountId,
        actorRole: 'candidate',
        reason: null,
        occurredAt: timestamp.toISOString(),
        metadata: Object.freeze(cvAnalysisId ? { cvAnalysisId } : {}),
      });

      await connection.query(
        `INSERT INTO ats_application_events_v1
          (application_id, event_type, from_state, to_state, actor_account_id,
           actor_role, reason, metadata_json, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
          event.applicationId,
          event.eventType,
          event.from,
          event.to,
          event.actorAccountId,
          event.actorRole,
          event.reason,
          JSON.stringify(event.metadata),
          timestampSql,
        ],
      );

      await connection.commit();
      return Object.freeze({
        application: Object.freeze({
          id,
          jobId,
          candidateAccountId,
          cvAnalysisId: cvAnalysisId || null,
          state: 'submitted',
          version: 1,
          submittedAt: timestamp,
          updatedAt: timestamp,
        }),
        event,
      });
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsPersistenceError) throw error;
      throw new AtsPersistenceError('ATS_PERSISTENCE_FAILED', 'ATS workflow persistence failed.');
    } finally {
      connection.release();
    }
  };

  const listHistory = async (applicationId) => {
    const [rows] = await pool.query(
      `SELECT id, application_id, event_type, from_state, to_state,
              actor_account_id, actor_role, reason, metadata_json, occurred_at
       FROM ats_application_events_v1
       WHERE application_id = ?
       ORDER BY occurred_at ASC, id ASC`,
      [applicationId],
    );
    return rows.map((row) => Object.freeze({
      id: Number(row.id),
      applicationId: row.application_id,
      eventType: row.event_type,
      from: row.from_state,
      to: row.to_state,
      actorAccountId: row.actor_account_id,
      actorRole: row.actor_role,
      reason: row.reason,
      metadata: typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json,
      occurredAt: row.occurred_at,
    }));
  };

  const transition = async ({
    applicationId,
    expectedVersion,
    to,
    actorAccountId,
    actorRole,
    reason,
    metadata = {},
    authorize,
  }) => {
    if (!Number.isSafeInteger(Number(expectedVersion)) || Number(expectedVersion) < 1) {
      throw new AtsPersistenceError('ATS_VERSION_REQUIRED', 'A positive expectedVersion is required.');
    }
    if (typeof authorize !== 'function') {
      throw new AtsPersistenceError('ATS_AUTHORIZATION_REQUIRED', 'Resource authorization is required.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT id, job_id, candidate_account_id, cv_analysis_id, state, version, submitted_at, updated_at
         FROM ats_applications_v1 WHERE id = ? FOR UPDATE`,
        [applicationId],
      );
      const application = mapApplication(rows[0]);
      if (!application) {
        throw new AtsPersistenceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
      }
      if (application.version !== Number(expectedVersion)) {
        throw new AtsPersistenceError('ATS_VERSION_CONFLICT', 'ATS application version conflict.', {
          expectedVersion: Number(expectedVersion),
          actualVersion: application.version,
        });
      }

      const allowed = await authorize({ application, actorAccountId, actorRole, to, connection });
      if (allowed !== true) {
        throw new AtsPersistenceError('ATS_RESOURCE_FORBIDDEN', 'Actor is not authorized for this ATS resource.');
      }

      const event = createTransitionEvent({
        applicationId,
        from: application.state,
        to,
        actorAccountId,
        actorRole,
        reason,
        occurredAt: clock(),
        metadata,
      });

      const [updateResult] = await connection.query(
        `UPDATE ats_applications_v1
         SET state = ?, version = version + 1, updated_at = ?
         WHERE id = ? AND version = ?`,
        [event.to, event.occurredAt.slice(0, 23).replace('T', ' '), applicationId, application.version],
      );
      if (updateResult.affectedRows !== 1) {
        throw new AtsPersistenceError('ATS_VERSION_CONFLICT', 'Concurrent ATS application update detected.');
      }

      await connection.query(
        `INSERT INTO ats_application_events_v1
          (application_id, event_type, from_state, to_state, actor_account_id,
           actor_role, reason, metadata_json, occurred_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
        [
          event.applicationId,
          event.eventType,
          event.from,
          event.to,
          event.actorAccountId,
          event.actorRole,
          event.reason,
          JSON.stringify(event.metadata),
          event.occurredAt.slice(0, 23).replace('T', ' '),
        ],
      );

      await connection.commit();
      return Object.freeze({
        application: Object.freeze({ ...application, state: event.to, version: application.version + 1 }),
        event,
      });
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsPersistenceError || error instanceof AtsWorkflowError) throw error;
      throw new AtsPersistenceError('ATS_PERSISTENCE_FAILED', 'ATS workflow persistence failed.');
    } finally {
      connection.release();
    }
  };

  return Object.freeze({
    getApplication,
    listApplicationsForCandidate,
    listHistory,
    transition,
    createApplication,
  });
};

module.exports = { AtsPersistenceError, createAtsStore, mapApplication };