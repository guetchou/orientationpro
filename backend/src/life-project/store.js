'use strict';

const {
  CONTRACT_VERSION,
  createLifeProject,
  createStateHistoryEntry,
} = require('./contracts');

class LifeProjectPersistenceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'LifeProjectPersistenceError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const isoDate = (value) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
};

const databaseDate = (value) => value ? new Date(value) : null;
const serialize = (value) => JSON.stringify(value);

const assertHistoryChronology = (history) => {
  for (let index = 1; index < history.length; index += 1) {
    const previous = Date.parse(history[index - 1].occurredAt);
    const current = Date.parse(history[index].occurredAt);
    if (current < previous) {
      throw new LifeProjectPersistenceError(
        'LIFE_PROJECT_HISTORY_ORDER_INVALID',
        'Life-project history must remain chronological.',
        {
          index,
          previousEventId: history[index - 1].eventId,
          eventId: history[index].eventId,
        },
      );
    }
  }
};

const assertHistoryAppendOnly = (existing, incoming) => {
  if (incoming.length < existing.length) {
    throw new LifeProjectPersistenceError(
      'LIFE_PROJECT_HISTORY_REWRITE',
      'Persisted life-project history cannot be shortened.',
      { persistedLength: existing.length, incomingLength: incoming.length },
    );
  }
  for (let index = 0; index < existing.length; index += 1) {
    if (serialize(existing[index]) !== serialize(incoming[index])) {
      throw new LifeProjectPersistenceError(
        'LIFE_PROJECT_HISTORY_REWRITE',
        'Persisted life-project history cannot be modified.',
        { index, eventId: existing[index].eventId },
      );
    }
  }
};

const withTransaction = async (pool, operation) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Preserve the original failure.
    }
    throw error;
  } finally {
    connection.release();
  }
};

const rowToScenario = (row) => ({
  schemaVersion: row.schema_version,
  id: row.id,
  title: row.title,
  description: row.description,
  horizon: row.horizon,
  status: row.status,
  optionType: row.option_type,
  assumptions: parseJson(row.assumptions_json, []),
  barriers: parseJson(row.barriers_json, []),
  supports: parseJson(row.supports_json, []),
  missingInformation: parseJson(row.missing_information_json, []),
  uncertainty: parseJson(row.uncertainty_json, {}),
  provenance: parseJson(row.provenance_json, {}),
  createdAt: isoDate(row.created_at),
  updatedAt: isoDate(row.updated_at),
});

const rowToCriterion = (row) => ({
  schemaVersion: row.schema_version,
  id: row.id,
  label: row.label,
  description: row.description,
  direction: row.direction,
  importance: row.importance === null ? null : Number(row.importance),
  provenance: parseJson(row.provenance_json, {}),
});

const rowToActionItem = (row) => ({
  schemaVersion: row.schema_version,
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  dueAt: isoDate(row.due_at),
  completedAt: isoDate(row.completed_at),
  evidenceIds: parseJson(row.evidence_ids_json, []),
  blockingReasons: parseJson(row.blocking_reasons_json, []),
  provenance: parseJson(row.provenance_json, {}),
  createdAt: isoDate(row.created_at),
  updatedAt: isoDate(row.updated_at),
});

const rowToHistory = (row) => createStateHistoryEntry({
  eventType: row.event_type,
  eventId: row.event_id,
  from: row.from_state,
  to: row.to_state,
  occurredAt: isoDate(row.occurred_at),
  actor: { kind: row.actor_kind, id: row.actor_id },
  reason: row.reason,
  provenance: parseJson(row.provenance_json, {}),
});

const loadProject = async (executor, accountId, projectId) => {
  const [[projectRow]] = await executor.query(
    `SELECT project.*, active.scenario_id AS active_scenario_id
     FROM life_projects project
     LEFT JOIN life_project_active_scenarios active ON active.project_id = project.id
     WHERE project.id = ? AND project.owner_account_id = ?
     LIMIT 1`,
    [projectId, accountId],
  );
  if (!projectRow) return null;

  const [scenarioRows] = await executor.query(
    `SELECT * FROM life_project_scenarios
     WHERE project_id = ?
     ORDER BY created_at, id`,
    [projectId],
  );
  const [criterionRows] = await executor.query(
    `SELECT * FROM life_project_criteria
     WHERE project_id = ?
     ORDER BY id`,
    [projectId],
  );
  const [planRows] = await executor.query(
    `SELECT * FROM life_project_action_plans
     WHERE project_id = ?
     ORDER BY created_at, id`,
    [projectId],
  );
  const [itemRows] = await executor.query(
    `SELECT * FROM life_project_action_items
     WHERE project_id = ?
     ORDER BY created_at, id`,
    [projectId],
  );
  const [eventRows] = await executor.query(
    `SELECT * FROM life_project_events
     WHERE project_id = ?
     ORDER BY sequence_no`,
    [projectId],
  );

  const itemsByPlan = new Map();
  for (const row of itemRows) {
    const items = itemsByPlan.get(row.action_plan_id) || [];
    items.push(rowToActionItem(row));
    itemsByPlan.set(row.action_plan_id, items);
  }

  const actionPlans = planRows.map((row) => ({
    schemaVersion: row.schema_version,
    id: row.id,
    scenarioId: row.scenario_id,
    title: row.title,
    status: row.status,
    items: itemsByPlan.get(row.id) || [],
    missingInformation: parseJson(row.missing_information_json, []),
    provenance: parseJson(row.provenance_json, {}),
    createdAt: isoDate(row.created_at),
    updatedAt: isoDate(row.updated_at),
  }));

  return {
    project: createLifeProject({
      schemaVersion: projectRow.schema_version,
      id: projectRow.id,
      ownerAccountId: projectRow.owner_account_id,
      title: projectRow.title,
      purpose: projectRow.purpose,
      state: projectRow.state,
      activeScenarioId: projectRow.active_scenario_id,
      scenarios: scenarioRows.map(rowToScenario),
      criteria: criterionRows.map(rowToCriterion),
      actionPlans,
      stateHistory: eventRows.map(rowToHistory),
      diagnostic: parseJson(projectRow.diagnostic_json, null),
      recommendation: parseJson(projectRow.recommendation_json, null),
      missingInformation: parseJson(projectRow.missing_information_json, []),
      uncertainty: parseJson(projectRow.uncertainty_json, {}),
      provenance: parseJson(projectRow.provenance_json, {}),
      createdAt: isoDate(projectRow.created_at),
      updatedAt: isoDate(projectRow.updated_at),
    }),
    persistenceVersion: Number(projectRow.lock_version),
  };
};

const insertProjectRow = async (connection, project, lockVersion = 1) => {
  await connection.execute(
    `INSERT INTO life_projects (
       id, owner_account_id, schema_version, title, purpose, state,
       diagnostic_json, recommendation_json, missing_information_json,
       uncertainty_json, provenance_json, lock_version, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project.id,
      project.ownerAccountId,
      CONTRACT_VERSION,
      project.title,
      project.purpose,
      project.state,
      project.diagnostic === null ? null : serialize(project.diagnostic),
      project.recommendation === null ? null : serialize(project.recommendation),
      serialize(project.missingInformation),
      serialize(project.uncertainty),
      serialize(project.provenance),
      lockVersion,
      databaseDate(project.createdAt),
      databaseDate(project.updatedAt),
    ],
  );
};

const insertScenarios = async (connection, project) => {
  for (const scenario of project.scenarios) {
    await connection.execute(
      `INSERT INTO life_project_scenarios (
         id, project_id, schema_version, title, description, horizon, status,
         option_type, assumptions_json, barriers_json, supports_json,
         missing_information_json, uncertainty_json, provenance_json,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scenario.id,
        project.id,
        CONTRACT_VERSION,
        scenario.title,
        scenario.description,
        scenario.horizon,
        scenario.status,
        scenario.optionType,
        serialize(scenario.assumptions),
        serialize(scenario.barriers),
        serialize(scenario.supports),
        serialize(scenario.missingInformation),
        serialize(scenario.uncertainty),
        serialize(scenario.provenance),
        databaseDate(scenario.createdAt),
        databaseDate(scenario.updatedAt),
      ],
    );
  }
  if (project.activeScenarioId) {
    await connection.execute(
      `INSERT INTO life_project_active_scenarios (project_id, scenario_id, selected_at)
       VALUES (?, ?, ?)`,
      [project.id, project.activeScenarioId, databaseDate(project.updatedAt)],
    );
  }
};

const insertCriteria = async (connection, project) => {
  for (const criterion of project.criteria) {
    await connection.execute(
      `INSERT INTO life_project_criteria (
         id, project_id, schema_version, label, description, direction,
         importance, provenance_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        criterion.id,
        project.id,
        CONTRACT_VERSION,
        criterion.label,
        criterion.description,
        criterion.direction,
        criterion.importance,
        serialize(criterion.provenance),
      ],
    );
  }
};

const insertActionPlans = async (connection, project) => {
  for (const plan of project.actionPlans) {
    await connection.execute(
      `INSERT INTO life_project_action_plans (
         id, project_id, scenario_id, schema_version, title, status,
         missing_information_json, provenance_json, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        plan.id,
        project.id,
        plan.scenarioId,
        CONTRACT_VERSION,
        plan.title,
        plan.status,
        serialize(plan.missingInformation),
        serialize(plan.provenance),
        databaseDate(plan.createdAt),
        databaseDate(plan.updatedAt),
      ],
    );
    for (const item of plan.items) {
      await connection.execute(
        `INSERT INTO life_project_action_items (
           id, project_id, action_plan_id, schema_version, title, description,
           status, due_at, completed_at, evidence_ids_json,
           blocking_reasons_json, provenance_json, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          project.id,
          plan.id,
          CONTRACT_VERSION,
          item.title,
          item.description,
          item.status,
          databaseDate(item.dueAt),
          databaseDate(item.completedAt),
          serialize(item.evidenceIds),
          serialize(item.blockingReasons),
          serialize(item.provenance),
          databaseDate(item.createdAt),
          databaseDate(item.updatedAt),
        ],
      );
    }
  }
};

const insertEvents = async (connection, projectId, events, offset = 0) => {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    await connection.execute(
      `INSERT INTO life_project_events (
         event_id, project_id, sequence_no, event_type, from_state, to_state,
         occurred_at, actor_kind, actor_id, reason, provenance_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.eventId,
        projectId,
        offset + index + 1,
        event.eventType,
        event.from,
        event.to,
        databaseDate(event.occurredAt),
        event.actor.kind,
        event.actor.id,
        event.reason,
        serialize(event.provenance),
      ],
    );
  }
};

const insertChildren = async (connection, project) => {
  await insertScenarios(connection, project);
  await insertCriteria(connection, project);
  await insertActionPlans(connection, project);
};

const deleteChildren = async (connection, projectId) => {
  await connection.execute('DELETE FROM life_project_active_scenarios WHERE project_id = ?', [projectId]);
  await connection.execute('DELETE FROM life_project_action_items WHERE project_id = ?', [projectId]);
  await connection.execute('DELETE FROM life_project_action_plans WHERE project_id = ?', [projectId]);
  await connection.execute('DELETE FROM life_project_criteria WHERE project_id = ?', [projectId]);
  await connection.execute('DELETE FROM life_project_scenarios WHERE project_id = ?', [projectId]);
};

const createLifeProjectStore = (pool) => {
  if (!pool || typeof pool.getConnection !== 'function') {
    throw new TypeError('A MySQL pool is required.');
  }

  return {
    async create(projectInput) {
      const project = createLifeProject(projectInput);
      assertHistoryChronology(project.stateHistory);
      try {
        await withTransaction(pool, async (connection) => {
          await insertProjectRow(connection, project, 1);
          await insertChildren(connection, project);
          await insertEvents(connection, project.id, project.stateHistory);
        });
      } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new LifeProjectPersistenceError(
            'LIFE_PROJECT_ALREADY_EXISTS',
            'The life project or one of its globally unique child identifiers already exists.',
            { projectId: project.id },
          );
        }
        throw error;
      }
      return loadProject(pool, project.ownerAccountId, project.id);
    },

    async get(accountId, projectId) {
      return loadProject(pool, accountId, projectId);
    },

    async list(accountId) {
      const [rows] = await pool.query(
        `SELECT project.id, project.title, project.purpose, project.state,
                project.lock_version, project.created_at, project.updated_at,
                active.scenario_id AS active_scenario_id,
                (SELECT COUNT(*) FROM life_project_scenarios scenario
                 WHERE scenario.project_id = project.id) AS scenario_count,
                (SELECT COUNT(*) FROM life_project_action_plans plan
                 WHERE plan.project_id = project.id) AS action_plan_count
         FROM life_projects project
         LEFT JOIN life_project_active_scenarios active ON active.project_id = project.id
         WHERE project.owner_account_id = ?
         ORDER BY project.updated_at DESC, project.id`,
        [accountId],
      );
      return rows.map((row) => Object.freeze({
        id: row.id,
        title: row.title,
        purpose: row.purpose,
        state: row.state,
        activeScenarioId: row.active_scenario_id,
        scenarioCount: Number(row.scenario_count),
        actionPlanCount: Number(row.action_plan_count),
        persistenceVersion: Number(row.lock_version),
        createdAt: isoDate(row.created_at),
        updatedAt: isoDate(row.updated_at),
      }));
    },

    async save(projectInput, { expectedVersion } = {}) {
      const project = createLifeProject(projectInput);
      assertHistoryChronology(project.stateHistory);
      if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
        throw new LifeProjectPersistenceError(
          'LIFE_PROJECT_VERSION_REQUIRED',
          'A positive expectedVersion is required for updates.',
          { expectedVersion },
        );
      }

      const outcome = await withTransaction(pool, async (connection) => {
        const [[locked]] = await connection.query(
          `SELECT lock_version
           FROM life_projects
           WHERE id = ? AND owner_account_id = ?
           FOR UPDATE`,
          [project.id, project.ownerAccountId],
        );
        if (!locked) return { found: false };

        const currentVersion = Number(locked.lock_version);
        if (currentVersion !== expectedVersion) {
          throw new LifeProjectPersistenceError(
            'LIFE_PROJECT_VERSION_CONFLICT',
            'The life project was modified by another operation.',
            { expectedVersion, currentVersion, projectId: project.id },
          );
        }

        const [eventRows] = await connection.query(
          `SELECT * FROM life_project_events
           WHERE project_id = ?
           ORDER BY sequence_no`,
          [project.id],
        );
        const existingHistory = eventRows.map(rowToHistory);
        assertHistoryAppendOnly(existingHistory, project.stateHistory);

        await connection.execute(
          `UPDATE life_projects
           SET schema_version = ?, title = ?, purpose = ?, state = ?,
               diagnostic_json = ?, recommendation_json = ?,
               missing_information_json = ?, uncertainty_json = ?, provenance_json = ?,
               lock_version = lock_version + 1, updated_at = ?
           WHERE id = ? AND owner_account_id = ?`,
          [
            CONTRACT_VERSION,
            project.title,
            project.purpose,
            project.state,
            project.diagnostic === null ? null : serialize(project.diagnostic),
            project.recommendation === null ? null : serialize(project.recommendation),
            serialize(project.missingInformation),
            serialize(project.uncertainty),
            serialize(project.provenance),
            databaseDate(project.updatedAt),
            project.id,
            project.ownerAccountId,
          ],
        );
        await deleteChildren(connection, project.id);
        await insertChildren(connection, project);
        await insertEvents(
          connection,
          project.id,
          project.stateHistory.slice(existingHistory.length),
          existingHistory.length,
        );
        return { found: true };
      });

      if (!outcome.found) return null;
      return loadProject(pool, project.ownerAccountId, project.id);
    },
  };
};

module.exports = {
  LifeProjectPersistenceError,
  assertHistoryAppendOnly,
  assertHistoryChronology,
  createLifeProjectStore,
};
