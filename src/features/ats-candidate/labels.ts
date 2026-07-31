import type { AtsApplicationState } from './types';

// Aucun pourcentage, score ou probabilité : l'état est le seul signal exposé
// au candidat (règle EPIC #183).
export const APPLICATION_STATE_LABELS: Record<AtsApplicationState, string> = {
  submitted: 'Candidature envoyée',
  under_review: "En cours d'examen",
  shortlisted: 'Présélectionné(e)',
  interview_planned: 'Entretien prévu',
  interview_completed: 'Entretien réalisé',
  offer_proposed: 'Offre proposée',
  hired: 'Recruté(e)',
  rejected: 'Candidature non retenue',
  withdrawn: 'Candidature retirée',
};
