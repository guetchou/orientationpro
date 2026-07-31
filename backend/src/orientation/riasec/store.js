const crypto = require('node:crypto');

class RiasecStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'RiasecStoreError';
    this.code = code;
  }
}

const parseJson = (value) => {
  if (value === null || value === undefined) return value;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const normalizeOwner = ({ accountId = null, guestSessionId = null } = {}) => {
  const account = accountId || null;
  const guest = guestSessionId || null;
  if (Boolean(account) === Boolean(guest)) {
    throw new RiasecStoreError(
      'INVALID_ORIENTATION_OWNER',
      'Exactly one orientation owner is required.',
    );
  }
  return { accountId: account, guestSessionId: guest };
};

const ownerPredicate = (owner, alias = '') => {
  const prefix = alias ? `${alias}.` : '';
  return owner.accountId
    ? { sql: `${prefix}account_id = ?`, params: [owner.accountId] }
    : { sql: `${prefix}guest_session_id = ?`, params: [owner.guestSessionId] };
};

const mapInstrument = (row, items) => row ? {
  id: row.id,
  slug: row.slug,
  version: row.version,
  locale: row.locale,
  status: row.status,
  title: row.title,
  responseScale: parseJson(row.response_scale),
  dimensions: parseJson(row.dimensions_json),
  methodology: row.methodology,
  source: {
    kind: row.source_kind,
    reference: row.source_reference,
    license: row.license_text,
  },
  disclaimer: row.disclaimer,
  scoringVersion: row.scoring_version,
  contentHash: row.content_hash,
  items: items.map((item) => ({
    id: item.id,
    position: item.position,
    dimension: item.dimension,
    prompt: item.prompt,
    reverseScored: Boolean(item.reverse_scored),
  })),
} : null;

const mapResult = (row) => row ? {
  id: row.id,
  attemptId: row.attempt_id,
  accountId: row.account_id || undefined,
  ownerType: row.account_id ? 'account' : 'guest',
  instrumentId: row.instrument_id,
  resultType: row.result_type,
  algorithmVersion: row.algorithm_version,
  primaryCode: row.primary_code,
  displayCode: row.display_code,
  scores: parseJson(row.scores_json),
  ranking: parseJson(row.ranking_json),
  differentiation: parseJson(row.differentiation_json),
  responsePattern: parseJson(row.response_pattern_json),
  snapshot: parseJson(row.result_snapshot),
  createdAt: row.created_at,
} : null;

const transaction = async (pool, work) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const selectResultByAttempt = async (connection, attemptId, ownerInput) => {
  const owner = normalizeOwner(ownerInput);
  const predicate = ownerPredicate(owner);
  const [[row]] = await connection.query(
    `SELECT *
     FROM orientation_results
     WHERE attempt_id = ? AND ${predicate.sql}`,
    [attemptId, ...predicate.params],
  );
  return mapResult(row);
};

const createRiasecStore = (pool) => ({
  async getInstrument(instrumentId) {
    const [[row]] = await pool.query(
      `SELECT *
       FROM orientation_riasec_instruments
       WHERE id = ?`,
      [instrumentId],
    );
    if (!row) return null;

    const [items] = await pool.query(
      `SELECT id, position, dimension, prompt, reverse_scored
       FROM orientation_riasec_items
       WHERE instrument_id = ?
       ORDER BY position`,
      [instrumentId],
    );
    return mapInstrument(row, items);
  },

  async createAttempt({ accountId, guestSessionId, instrumentId, itemOrder }) {
    const owner = normalizeOwner({ accountId, guestSessionId });
    const attemptId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO orientation_riasec_attempts (
         id, account_id, guest_session_id, instrument_id, status, item_order
       ) VALUES (?, ?, ?, ?, 'in_progress', ?)`,
      [attemptId, owner.accountId, owner.guestSessionId, instrumentId, JSON.stringify(itemOrder)],
    );
    return {
      id: attemptId,
      accountId: owner.accountId || undefined,
      ownerType: owner.accountId ? 'account' : 'guest',
      instrumentId,
      status: 'in_progress',
      itemOrder,
    };
  },

  async getAttempt({ accountId, guestSessionId, attemptId }) {
    const owner = normalizeOwner({ accountId, guestSessionId });
    const predicate = ownerPredicate(owner);
    const [[row]] = await pool.query(
      `SELECT id, account_id, guest_session_id, instrument_id, status, item_order, started_at, completed_at
       FROM orientation_riasec_attempts
       WHERE id = ? AND ${predicate.sql}`,
      [attemptId, ...predicate.params],
    );
    if (!row) return null;

    const [responses] = await pool.query(
      `SELECT item_id, value, answered_at
       FROM orientation_riasec_responses
       WHERE attempt_id = ?
       ORDER BY answered_at, item_id`,
      [attemptId],
    );
    return {
      id: row.id,
      accountId: row.account_id || undefined,
      ownerType: row.account_id ? 'account' : 'guest',
      instrumentId: row.instrument_id,
      status: row.status,
      itemOrder: parseJson(row.item_order),
      startedAt: row.started_at,
      completedAt: row.completed_at,
      responses: responses.map((response) => ({
        itemId: response.item_id,
        value: response.value,
        answeredAt: response.answered_at,
      })),
    };
  },

  async completeAttempt({ accountId, guestSessionId, attemptId, instrumentId, responses, result, snapshot }) {
    const owner = normalizeOwner({ accountId, guestSessionId });
    const predicate = ownerPredicate(owner);
    return transaction(pool, async (connection) => {
      const [[attempt]] = await connection.query(
        `SELECT id, account_id, guest_session_id, instrument_id, status
         FROM orientation_riasec_attempts
         WHERE id = ? AND ${predicate.sql}
         FOR UPDATE`,
        [attemptId, ...predicate.params],
      );

      if (!attempt) {
        throw new RiasecStoreError('ATTEMPT_NOT_FOUND', 'The RIASEC attempt does not exist.');
      }
      if (attempt.instrument_id !== instrumentId) {
        throw new RiasecStoreError('INSTRUMENT_MISMATCH', 'The attempt belongs to another instrument version.');
      }
      if (attempt.status === 'completed') {
        return {
          status: 'already_completed',
          result: await selectResultByAttempt(connection, attemptId, owner),
        };
      }
      if (attempt.status !== 'in_progress') {
        throw new RiasecStoreError('ATTEMPT_NOT_SUBMITTABLE', 'The RIASEC attempt cannot be submitted.');
      }

      for (const response of responses) {
        await connection.query(
          `INSERT INTO orientation_riasec_responses (attempt_id, item_id, value)
           VALUES (?, ?, ?)`,
          [attemptId, response.itemId, response.value],
        );
      }

      const resultId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO orientation_results (
           id, attempt_id, account_id, guest_session_id, instrument_id, result_type,
           algorithm_version, primary_code, display_code, scores_json,
           ranking_json, differentiation_json, response_pattern_json,
           result_snapshot
         ) VALUES (?, ?, ?, ?, ?, 'riasec', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultId,
          attemptId,
          owner.accountId,
          owner.guestSessionId,
          instrumentId,
          result.algorithmVersion,
          result.ranking.primaryCode,
          result.ranking.displayCode,
          JSON.stringify(result.scores),
          JSON.stringify(result.ranking),
          JSON.stringify(result.differentiation),
          JSON.stringify(result.responsePattern),
          JSON.stringify(snapshot),
        ],
      );
      await connection.query(
        `UPDATE orientation_riasec_attempts
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?`,
        [attemptId],
      );

      return {
        status: 'completed',
        result: await selectResultByAttempt(connection, attemptId, owner),
      };
    });
  },

  async listResults({ accountId, guestSessionId, limit = 20, offset = 0 }) {
    const owner = normalizeOwner({ accountId, guestSessionId });
    const predicate = ownerPredicate(owner);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safeOffset = Math.max(Number(offset) || 0, 0);
    const [rows] = await pool.query(
      `SELECT *
       FROM orientation_results
       WHERE ${predicate.sql}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...predicate.params, safeLimit, safeOffset],
    );
    return rows.map(mapResult);
  },

  async getResult({ accountId, guestSessionId, resultId }) {
    const owner = normalizeOwner({ accountId, guestSessionId });
    const predicate = ownerPredicate(owner);
    const [[row]] = await pool.query(
      `SELECT *
       FROM orientation_results
       WHERE id = ? AND ${predicate.sql}`,
      [resultId, ...predicate.params],
    );
    return mapResult(row);
  },
});

module.exports = {
  RiasecStoreError,
  createRiasecStore,
  normalizeOwner,
  ownerPredicate,
};
