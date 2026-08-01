'use strict';

const EVALUATION_RECOMMENDATIONS = Object.freeze(['advance', 'hold', 'reject']);

const mapEvaluation = (row) => row ? Object.freeze({
  id: Number(row.id),
  applicationId: row.application_id,
  organizationId: row.organization_id,
  evaluatorAccountId: row.evaluator_account_id,
  evaluatorRole: row.evaluator_role,
  applicationStateAtEvaluation: row.application_state_at_evaluation,
  rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
  recommendation: row.recommendation,
  note: row.note,
  occurredAt: row.occurred_at,
}) : null;

const toSqlDatetime = (date) => date.toISOString().slice(0, 23).replace('T', ' ');

// Append-only : chaque évaluation est une nouvelle ligne, jamais une mise à jour.
// Aucun verrou de version — il n'y a pas de ressource mutable à protéger.
const createEvaluationStore = (pool, { clock = () => new Date() } = {}) => {
  if (!pool || typeof pool.query !== 'function') {
    throw new Error('A MySQL pool is required for ATS evaluation persistence.');
  }

  const createEvaluation = async ({
    applicationId, organizationId, evaluatorAccountId, evaluatorRole,
    applicationStateAtEvaluation, rating = null, recommendation, note = null,
  }) => {
    const occurredAt = clock();
    const [result] = await pool.query(
      `INSERT INTO ats_application_evaluations_v1
        (application_id, organization_id, evaluator_account_id, evaluator_role,
         application_state_at_evaluation, rating, recommendation, note, occurred_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        applicationId, organizationId, evaluatorAccountId, evaluatorRole,
        applicationStateAtEvaluation, rating, recommendation, note, toSqlDatetime(occurredAt),
      ],
    );
    return Object.freeze({
      id: result.insertId,
      applicationId,
      organizationId,
      evaluatorAccountId,
      evaluatorRole,
      applicationStateAtEvaluation,
      rating,
      recommendation,
      note,
      occurredAt,
    });
  };

  const listEvaluations = async (applicationId) => {
    const [rows] = await pool.query(
      `SELECT id, application_id, organization_id, evaluator_account_id, evaluator_role,
              application_state_at_evaluation, rating, recommendation, note, occurred_at
       FROM ats_application_evaluations_v1
       WHERE application_id = ?
       ORDER BY occurred_at ASC, id ASC`,
      [applicationId],
    );
    return rows.map(mapEvaluation);
  };

  return Object.freeze({ createEvaluation, listEvaluations });
};

module.exports = { createEvaluationStore, EVALUATION_RECOMMENDATIONS, mapEvaluation };
