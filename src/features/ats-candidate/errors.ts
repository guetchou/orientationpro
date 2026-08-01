import { ApiError } from '@/lib/apiClient';

// Messages volontairement génériques sur 403/404 : ne jamais révéler pourquoi
// un accès est refusé, ni l'existence/l'identité de la ressource d'un autre
// candidat (règle EPIC #183 : pas de fuite d'information).
export interface AtsErrorView {
  kind:
    | 'service_unavailable'
    | 'not_found'
    | 'unauthenticated'
    | 'forbidden'
    | 'conflict_duplicate'
    | 'conflict_job_closed'
    | 'conflict_version'
    | 'validation'
    | 'network'
    | 'unknown';
  message: string;
  code?: string;
}

export const describeAtsError = (error: unknown): AtsErrorView => {
  if (error instanceof ApiError) {
    const code = error.code;

    if (error.status === 401) {
      return {
        kind: 'unauthenticated',
        code,
        message: 'Votre session a expiré. Reconnectez-vous pour continuer.',
      };
    }

    if (error.status === 403) {
      return {
        kind: 'forbidden',
        code,
        message: "Vous n'avez pas accès à cette ressource.",
      };
    }

    if (error.status === 404) {
      return {
        kind: 'not_found',
        code,
        message: "Cette offre ou cette candidature n'existe pas ou plus.",
      };
    }

    if (error.status === 409) {
      if (code === 'ATS_APPLICATION_ALREADY_EXISTS') {
        return {
          kind: 'conflict_duplicate',
          code,
          message: 'Vous avez déjà déposé une candidature pour cette offre.',
        };
      }
      if (code === 'ATS_JOB_NOT_PUBLISHED') {
        return {
          kind: 'conflict_job_closed',
          code,
          message: "Cette offre n'accepte plus de candidatures.",
        };
      }
      return {
        kind: 'conflict_version',
        code,
        message: 'Cette candidature a été modifiée entre-temps. Rechargez la page avant de réessayer.',
      };
    }

    if (error.status === 400 || error.status === 428) {
      return {
        kind: 'validation',
        code,
        message: 'La demande est invalide ou incomplète.',
      };
    }

    return {
      kind: 'service_unavailable',
      code,
      message: "Le service candidature n'est pas disponible pour le moment.",
    };
  }

  if (error instanceof TypeError) {
    return { kind: 'network', message: 'Connexion réseau indisponible. Réessayez.' };
  }

  return { kind: 'unknown', message: 'Une erreur inattendue est survenue.' };
};
