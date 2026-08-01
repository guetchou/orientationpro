'use strict';

const {
  AtsJobWorkflowError,
  assertJobPublishable,
  createJobEvent,
  validateJobTransition,
} = require('./job-workflow');

class AtsJobPersistenceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsJobPersistenceError';
    this.code = code;
    this.details = details;
  }
}

const mapJob = (row) => row ? Object.freeze({
  id: row.id,
  ownerAccountId: row.owner_account_id,
  organizationId: row.organization_id,
  title: row.title,
  description: row.description,
  status: row.status,
  version: Number(row.version),
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}) : null;

const JOB_COLUMNS = 'id, owner_account_id, organization_id, title, description, status, version, published_at, created_at, updated_at';

const toSqlDatetime = (date) => date.toISOString().slice(0, 23).replace('T', ' ');

const createJobStore = (pool, { clock = () => new Date() } = {}) => {
  if (!pool || typeof pool.getConnection !== 'function') {
    throw new Error('A MySQL pool is required for ATS job persistence.');
  }

  const insertJobEvent = async (connection, event, organizationId) => {
    await connection.query(
      `INSERT INTO ats_job_events_v1
        (job_id, organization_id, event_type, actor_account_id, actor_role, metadata_json, occurred_at)
       VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), ?)`,
      [
        event.jobId,
        organizationId,
        event.eventType,
        event.actorAccountId,
        event.actorRole,
        JSON.stringify(event.metadata),
        toSqlDatetime(new Date(event.occurredAt)),
      ],
    );
  };

  const getJob = async (jobId) => {
    const [rows] = await pool.query(
      `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE id = ? LIMIT 1`,
      [jobId],
    );
    return mapJob(rows[0]);
  };

  const listAllJobs = async () => {
    const [rows] = await pool.query(
      `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 ORDER BY created_at DESC, id DESC`,
    );
    return rows.map(mapJob);
  };

  const listPublishedJobs = async () => {
    const [rows] = await pool.query(
      `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE status = 'published' ORDER BY created_at DESC, id DESC`,
    );
    return rows.map(mapJob);
  };

  const listJobsForOrganization = async (organizationId) => {
    const [rows] = await pool.query(
      `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE organization_id = ? ORDER BY created_at DESC, id DESC`,
      [organizationId],
    );
    return rows.map(mapJob);
  };

  const listJobsForRecruiter = async ({ organizationId, recruiterAccountId }) => {
    const [rows] = await pool.query(
      `SELECT ${JOB_COLUMNS.split(', ').map((column) => `j.${column}`).join(', ')}
       FROM ats_jobs_v1 j
       JOIN ats_job_recruiters_v1 r ON r.job_id = j.id
       WHERE j.organization_id = ? AND r.recruiter_account_id = ?
       ORDER BY j.created_at DESC, j.id DESC`,
      [organizationId, recruiterAccountId],
    );
    return rows.map(mapJob);
  };

  const listRecruiters = async (jobId) => {
    const [rows] = await pool.query(
      `SELECT job_id, recruiter_account_id, assigned_by_account_id, assigned_at
       FROM ats_job_recruiters_v1 WHERE job_id = ? ORDER BY assigned_at ASC`,
      [jobId],
    );
    return rows.map((row) => Object.freeze({
      jobId: row.job_id,
      recruiterAccountId: row.recruiter_account_id,
      assignedByAccountId: row.assigned_by_account_id,
      assignedAt: row.assigned_at,
    }));
  };

  const listJobEvents = async (jobId) => {
    const [rows] = await pool.query(
      `SELECT id, job_id, event_type, actor_account_id, actor_role, metadata_json, occurred_at
       FROM ats_job_events_v1 WHERE job_id = ? ORDER BY occurred_at ASC, id ASC`,
      [jobId],
    );
    return rows.map((row) => Object.freeze({
      id: Number(row.id),
      jobId: row.job_id,
      eventType: row.event_type,
      actorAccountId: row.actor_account_id,
      actorRole: row.actor_role,
      metadata: typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json,
      occurredAt: row.occurred_at,
    }));
  };

  const createJob = async ({ id, ownerAccountId, organizationId, title, description, actorAccountId, actorRole }) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      try {
        await connection.query(
          `INSERT INTO ats_jobs_v1 (id, owner_account_id, organization_id, title, description, status, version)
           VALUES (?, ?, ?, ?, ?, 'draft', 1)`,
          [id, ownerAccountId, organizationId, title, description],
        );
      } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new AtsJobPersistenceError('ATS_JOB_ALREADY_EXISTS', 'ATS job already exists.');
        }
        throw error;
      }

      const event = createJobEvent({
        jobId: id,
        eventType: 'job.created',
        actorAccountId,
        actorRole,
        occurredAt: clock(),
      });
      await insertJobEvent(connection, event, organizationId);
      await connection.commit();
      return getJob(id);
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsJobPersistenceError || error instanceof AtsJobWorkflowError) throw error;
      throw new AtsJobPersistenceError('ATS_JOB_PERSISTENCE_FAILED', 'ATS job persistence failed.');
    } finally {
      connection.release();
    }
  };

  const transitionJob = async ({
    jobId,
    expectedVersion,
    to,
    actorAccountId,
    actorRole,
    eventType,
    occurredAt,
    extraColumns = {},
    resultOverrides = {},
    authorize,
  }) => {
    if (!Number.isSafeInteger(Number(expectedVersion)) || Number(expectedVersion) < 1) {
      throw new AtsJobPersistenceError('ATS_JOB_VERSION_REQUIRED', 'A positive expectedVersion is required.');
    }
    if (typeof authorize !== 'function') {
      throw new AtsJobPersistenceError('ATS_JOB_AUTHORIZATION_REQUIRED', 'Resource authorization is required.');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE id = ? FOR UPDATE`,
        [jobId],
      );
      const job = mapJob(rows[0]);
      if (!job) {
        throw new AtsJobPersistenceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
      }
      if (job.version !== Number(expectedVersion)) {
        throw new AtsJobPersistenceError('ATS_JOB_VERSION_CONFLICT', 'ATS job version conflict.', {
          expectedVersion: Number(expectedVersion),
          actualVersion: job.version,
        });
      }

      const allowed = await authorize({ job, actorAccountId, actorRole, connection });
      if (allowed !== true) {
        throw new AtsJobPersistenceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Actor is not authorized for this ATS job.');
      }

      validateJobTransition({ from: job.status, to });
      if (to === 'published') assertJobPublishable(job);

      const event = createJobEvent({ jobId, eventType, actorAccountId, actorRole, occurredAt });

      const setClauses = ['status = ?', 'version = version + 1', 'updated_at = ?'];
      const params = [to, toSqlDatetime(new Date(event.occurredAt))];
      for (const [column, value] of Object.entries(extraColumns)) {
        setClauses.push(`${column} = ?`);
        params.push(value);
      }
      params.push(jobId, job.version);

      const [updateResult] = await connection.query(
        `UPDATE ats_jobs_v1 SET ${setClauses.join(', ')} WHERE id = ? AND version = ?`,
        params,
      );
      if (updateResult.affectedRows !== 1) {
        throw new AtsJobPersistenceError('ATS_JOB_VERSION_CONFLICT', 'Concurrent ATS job update detected.');
      }

      await insertJobEvent(connection, event, job.organizationId);
      await connection.commit();
      return Object.freeze({ ...job, status: to, version: job.version + 1, ...resultOverrides });
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsJobPersistenceError || error instanceof AtsJobWorkflowError) throw error;
      throw new AtsJobPersistenceError('ATS_JOB_PERSISTENCE_FAILED', 'ATS job persistence failed.');
    } finally {
      connection.release();
    }
  };

  const publishJob = ({ jobId, expectedVersion, actorAccountId, actorRole, authorize }) => {
    const occurredAt = clock();
    return transitionJob({
      jobId,
      expectedVersion,
      to: 'published',
      actorAccountId,
      actorRole,
      eventType: 'job.published',
      occurredAt,
      extraColumns: { published_at: toSqlDatetime(occurredAt) },
      resultOverrides: { publishedAt: occurredAt },
      authorize,
    });
  };

  const closeJob = ({ jobId, expectedVersion, actorAccountId, actorRole, authorize }) => transitionJob({
    jobId,
    expectedVersion,
    to: 'closed',
    actorAccountId,
    actorRole,
    eventType: 'job.closed',
    occurredAt: clock(),
    authorize,
  });

  const assignRecruiter = async ({ jobId, recruiterAccountId, assignedByAccountId, actorRole, authorize }) => {
    if (typeof authorize !== 'function') {
      throw new AtsJobPersistenceError('ATS_JOB_AUTHORIZATION_REQUIRED', 'Resource authorization is required.');
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE id = ? FOR UPDATE`,
        [jobId],
      );
      const job = mapJob(rows[0]);
      if (!job) {
        throw new AtsJobPersistenceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
      }

      const allowed = await authorize({ job, actorAccountId: assignedByAccountId, actorRole, connection });
      if (allowed !== true) {
        throw new AtsJobPersistenceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Actor is not authorized to assign recruiters.');
      }

      try {
        await connection.query(
          `INSERT INTO ats_job_recruiters_v1 (job_id, recruiter_account_id, assigned_by_account_id)
           VALUES (?, ?, ?)`,
          [jobId, recruiterAccountId, assignedByAccountId],
        );
      } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new AtsJobPersistenceError('ATS_RECRUITER_ALREADY_ASSIGNED', 'Recruiter is already assigned to this job.');
        }
        if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
          throw new AtsJobPersistenceError('ATS_RECRUITER_ACCOUNT_NOT_FOUND', 'The recruiter account does not exist.');
        }
        throw error;
      }

      const event = createJobEvent({
        jobId,
        eventType: 'job.recruiter_assigned',
        actorAccountId: assignedByAccountId,
        actorRole,
        occurredAt: clock(),
        metadata: { recruiterAccountId },
      });
      await insertJobEvent(connection, event, job.organizationId);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsJobPersistenceError || error instanceof AtsJobWorkflowError) throw error;
      throw new AtsJobPersistenceError('ATS_JOB_PERSISTENCE_FAILED', 'ATS job persistence failed.');
    } finally {
      connection.release();
    }
  };

  const removeRecruiter = async ({ jobId, recruiterAccountId, actorAccountId, actorRole, authorize }) => {
    if (typeof authorize !== 'function') {
      throw new AtsJobPersistenceError('ATS_JOB_AUTHORIZATION_REQUIRED', 'Resource authorization is required.');
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT ${JOB_COLUMNS} FROM ats_jobs_v1 WHERE id = ? FOR UPDATE`,
        [jobId],
      );
      const job = mapJob(rows[0]);
      if (!job) {
        throw new AtsJobPersistenceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
      }

      const allowed = await authorize({ job, actorAccountId, actorRole, connection });
      if (allowed !== true) {
        throw new AtsJobPersistenceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Actor is not authorized to remove recruiters.');
      }

      const [result] = await connection.query(
        'DELETE FROM ats_job_recruiters_v1 WHERE job_id = ? AND recruiter_account_id = ?',
        [jobId, recruiterAccountId],
      );
      if (result.affectedRows !== 1) {
        throw new AtsJobPersistenceError('ATS_RECRUITER_NOT_ASSIGNED', 'Recruiter is not assigned to this job.');
      }

      const event = createJobEvent({
        jobId,
        eventType: 'job.recruiter_removed',
        actorAccountId,
        actorRole,
        occurredAt: clock(),
        metadata: { recruiterAccountId },
      });
      await insertJobEvent(connection, event, job.organizationId);
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      if (error instanceof AtsJobPersistenceError || error instanceof AtsJobWorkflowError) throw error;
      throw new AtsJobPersistenceError('ATS_JOB_PERSISTENCE_FAILED', 'ATS job persistence failed.');
    } finally {
      connection.release();
    }
  };

  return Object.freeze({
    getJob,
    listAllJobs,
    listPublishedJobs,
    listJobsForOrganization,
    listJobsForRecruiter,
    listRecruiters,
    listJobEvents,
    createJob,
    publishJob,
    closeJob,
    assignRecruiter,
    removeRecruiter,
  });
};

module.exports = { AtsJobPersistenceError, createJobStore, mapJob };
