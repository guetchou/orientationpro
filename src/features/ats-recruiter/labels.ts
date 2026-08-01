import type { AtsApplicationState, AtsEvaluationRecommendation, AtsRejectionReasonCode } from './types';

// Aucun pourcentage, score ou probabilité, y compris côté recruteur : seul
// l'état atteint est un fait serveur (règle EPIC #183).
export const APPLICATION_STATE_LABELS: Record<AtsApplicationState, string> = {
  submitted: 'Candidature reçue',
  under_review: "En cours d'examen",
  shortlisted: 'Présélectionné(e)',
  interview_planned: 'Entretien prévu',
  interview_completed: 'Entretien réalisé',
  offer_proposed: 'Offre proposée',
  hired: 'Recruté(e)',
  rejected: 'Candidature rejetée',
  withdrawn: 'Candidature retirée',
};

export const EVALUATION_RECOMMENDATION_LABELS: Record<AtsEvaluationRecommendation, string> = {
  advance: 'Faire avancer',
  hold: 'Mettre en attente',
  reject: 'Rejeter',
};

export const REJECTION_REASON_CODE_LABELS: Record<AtsRejectionReasonCode, string> = {
  not_qualified: 'Profil non qualifié',
  position_filled: 'Poste déjà pourvu',
  duplicate_application: 'Candidature en doublon',
  failed_assessment: "Échec à l'évaluation",
  salary_expectation_mismatch: 'Prétentions salariales incompatibles',
  candidate_unresponsive: 'Candidat injoignable',
  role_cancelled: 'Poste annulé',
  other: 'Autre motif',
};
