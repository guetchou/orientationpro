import { ApiError } from '@/lib/apiClient';

// Messages volontairement génériques sur 403/404 : ne jamais révéler pourquoi
// un accès est refusé, ni l'existence d'une ressource d'une autre organisation
// (règle EPIC #183 / #199 : pas de fuite d'information inter-organisation).
export interface AtsRecruiterErrorView {
  kind:
    | 'service_unavailable'
    | 'not_found'
    | 'unauthenticated'
    | 'forbidden'
    | 'conflict_duplicate_recruiter'
    | 'conflict_job_closed'
    | 'conflict_version'
    | 'conflict_transition_not_allowed'
    | 'validation_transition_forbidden'
    | 'validation_reason_required'
    | 'validation_reason_code_required'
    | 'validation_reason_code_invalid'
    | 'validation_evaluation_recommendation'
    | 'validation_evaluation_rating'
    | 'validation_evaluation_note'
    | 'validation_filter'
    | 'validation_recruiter_not_in_organization'
    | 'validation'
    | 'network'
    | 'unknown';
  message: string;
  code?: string;
}

export const describeAtsRecruiterError = (error: unknown): AtsRecruiterErrorView => {
  if (error instanceof ApiError) {
    const code = error.code;

    if (error.status === 401) {
      return { kind: 'unauthenticated', code, message: 'Votre session a expiré. Reconnectez-vous pour continuer.' };
    }

    if (error.status === 403) {
      return { kind: 'forbidden', code, message: "Vous n'avez pas accès à cette ressource." };
    }

    if (error.status === 404) {
      return { kind: 'not_found', code, message: "Cette offre ou cette candidature n'existe pas ou plus." };
    }

    if (error.status === 409) {
      if (code === 'ATS_RECRUITER_ALREADY_ASSIGNED') {
        return { kind: 'conflict_duplicate_recruiter', code, message: 'Ce recruteur est déjà affecté à cette offre.' };
      }
      if (code === 'ATS_JOB_NOT_PUBLISHED') {
        return { kind: 'conflict_job_closed', code, message: "Cette offre n'est plus publiée." };
      }
      if (['ATS_TRANSITION_NOT_ALLOWED', 'ATS_TERMINAL_STATE', 'ATS_TRANSITION_NOOP', 'ATS_JOB_TRANSITION_NOT_ALLOWED'].includes(code ?? '')) {
        return {
          kind: 'conflict_transition_not_allowed',
          code,
          message: "Cette transition n'est pas possible depuis l'état actuel. Rechargez la page pour voir l'état à jour.",
        };
      }
      return {
        kind: 'conflict_version',
        code,
        message: 'Cette ressource a été modifiée entre-temps. Rechargez la page avant de réessayer.',
      };
    }

    if (error.status === 400 || error.status === 428) {
      if (code === 'ATS_TRANSITION_FORBIDDEN') {
        return {
          kind: 'validation_transition_forbidden',
          code,
          message: 'Votre rôle ne permet pas cette transition.',
        };
      }
      if (code === 'ATS_TRANSITION_REASON_REQUIRED') {
        return { kind: 'validation_reason_required', code, message: 'Un motif est requis pour rejeter cette candidature.' };
      }
      if (code === 'ATS_TRANSITION_REASON_CODE_REQUIRED') {
        return {
          kind: 'validation_reason_code_required',
          code,
          message: 'Sélectionnez un motif de rejet dans la liste.',
        };
      }
      if (code === 'ATS_TRANSITION_REASON_CODE_INVALID') {
        return { kind: 'validation_reason_code_invalid', code, message: 'Ce motif de rejet est inconnu.' };
      }
      if (code === 'ATS_EVALUATION_RECOMMENDATION_INVALID') {
        return {
          kind: 'validation_evaluation_recommendation',
          code,
          message: 'Sélectionnez une recommandation valide.',
        };
      }
      if (code === 'ATS_EVALUATION_RATING_INVALID') {
        return { kind: 'validation_evaluation_rating', code, message: 'La note doit être un entier entre 1 et 5.' };
      }
      if (code === 'ATS_EVALUATION_NOTE_TOO_LONG') {
        return { kind: 'validation_evaluation_note', code, message: 'La note interne est trop longue.' };
      }
      if (code === 'ATS_APPLICATION_FILTER_INVALID') {
        return { kind: 'validation_filter', code, message: 'Ce filtre est invalide.' };
      }
      if (code === 'ATS_RECRUITER_NOT_IN_ORGANIZATION') {
        return {
          kind: 'validation_recruiter_not_in_organization',
          code,
          message: "Ce compte recruteur n'appartient pas à votre organisation.",
        };
      }
      return { kind: 'validation', code, message: 'La demande est invalide ou incomplète.' };
    }

    return { kind: 'service_unavailable', code, message: "Le service recrutement n'est pas disponible pour le moment." };
  }

  if (error instanceof TypeError) {
    return { kind: 'network', message: 'Connexion réseau indisponible. Réessayez.' };
  }

  return { kind: 'unknown', message: 'Une erreur inattendue est survenue.' };
};
