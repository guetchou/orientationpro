'use strict';

const { createActionTrackingRecord } = require('./action-tracking');

class ActionTrackingPersistenceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ActionTrackingPersistenceError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const isoDate = (value) => value instanceof Date ? value.toISOString() : new Date(value).toISOString();
const databaseDate = (value) => new Date(value);

const rowToRecord = (row) => createActionTrackingRecord({
  projectId: row.project_id,
  planId: row.plan_id,
  actionId: row.action_id,
  position: Number(row.position_index),
  statusHistory: parseJson(row.status_history_json, []),
  createdAt: isoDate(row.created_at),
  updatedAt: isoDate(row.updated_at),
});

const createActionTrackingStore = (pool) => {
  if (!pool || typeof pool.query !== 'function') {
    throw new TypeError('A MySQL pool is required for action tracking.');
  }

  const assertOwner = async (accountId, projectId) => {
    const [[row]] = await pool.query(
      'SELECT id FROM life_projects WHERE id = ? AND owner_account_id = ? LIMIT 1',
      [projectId, accountId],
    );
    if (!row) {
      throw new ActionTrackingPersistenceError(
        'ACTION_TRACKING_PROJECT_NOT_FOUND',
        'The life project does not exist for this account.',
        { projectId },
      );
    }
  };

  return {
    async list(accountId, projectId) {
      const [rows] = await pool.query(
        `SELECT tracking.*
         FROM life_project_action_tracking tracking
         INNER JOIN life_projects project ON project.id = tracking.project_id
         WHERE tracking.project_id = ? AND project.owner_account_id = ?
         ORDER BY tracking.plan_id, tracking.position_index, tracking.action_id`,
        [projectId, accountId],
      );
      return rows.map(rowToRecord);
    },

    async get(accountId, projectId, actionId) {
      const [[row]] = await pool.query(
        `SELECT tracking.*
         FROM life_project_action_tracking tracking
         INNER JOIN life_projects project ON project.id = tracking.project_id
         WHERE tracking.project_id = ? AND tracking.action_id = ?
           AND project.owner_account_id = ?
         LIMIT 1`,
        [projectId, actionId, accountId],
      );
      return row ? rowToRecord(row) : null;
    },

    async save(accountId, recordInput) {
      const record = createActionTrackingRecord(recordInput);
      await assertOwner(accountId, record.projectId);
      await pool.execute(
        `INSERT INTO life_project_action_tracking (
           project_id, plan_id, action_id, position_index, status_history_json,
           created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           plan_id = VALUES(plan_id),
           position_index = VALUES(position_index),
           status_history_json = VALUES(status_history_json),
           updated_at = VALUES(updated_at)`,
        [
          record.projectId,
          record.planId,
          record.actionId,
          record.position,
          JSON.stringify(record.statusHistory),
          databaseDate(record.createdAt),
          databaseDate(record.updatedAt),
        ],
      );
      return this.get(accountId, record.projectId, record.actionId);
    },

    async deleteMissing(accountId, projectId, actionIds = []) {
      await assertOwner(accountId, projectId);
      if (actionIds.length === 0) {
        await pool.execute(
          'DELETE FROM life_project_action_tracking WHERE project_id = ?',
          [projectId],
        );
        return;
      }
      const placeholders = actionIds.map(() => '?').join(', ');
      await pool.execute(
        `DELETE FROM life_project_action_tracking
         WHERE project_id = ? AND action_id NOT IN (${placeholders})`,
        [projectId, ...actionIds],
      );
    },
  };
};

module.exports = {
  ActionTrackingPersistenceError,
  createActionTrackingStore,
  rowToRecord,
};
