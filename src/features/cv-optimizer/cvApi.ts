import { ApiError, apiDownload, apiFetch, apiUpload } from '@/lib/apiClient';
import type { CvAnalysis, CvAnalysisPage } from './types';

const BASE = '/v1/cv/analyses';

export interface CvErrorView {
  kind:
    | 'service_unavailable' // flag desactive / route absente
    | 'not_found' // analyse inexistante pour ce compte
    | 'unauthenticated' // session expiree
    | 'forbidden' // permission insuffisante
    | 'invalid_file' // fichier refuse (type, taille, signature, corrompu)
    | 'scanned_pdf' // PDF sans texte
    | 'unreadable' // texte non exploitable
    | 'network' // reseau indisponible
    | 'unknown';
  message: string;
  code?: string;
}

// Traduit une erreur en message honnete, sans jamais simuler de resultat.
export const describeCvError = (error: unknown): CvErrorView => {
  if (error instanceof ApiError) {
    const code = error.code;

    if (error.status === 404) {
      // Une analyse manquante porte un code metier explicite ; sinon, c'est la
      // route qui est absente parce que le service n'est pas encore active.
      if (code === 'CV_ANALYSIS_NOT_FOUND') {
        return { kind: 'not_found', code, message: "Cette analyse n'existe pas ou plus." };
      }
      return {
        kind: 'service_unavailable',
        code,
        message:
          "Le service d'analyse de CV n'est pas encore activé. Réessayez plus tard.",
      };
    }

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
        message: "Votre compte n'est pas autorisé à utiliser cette fonctionnalité.",
      };
    }

    if (code === 'CV_PDF_SCANNED') {
      return {
        kind: 'scanned_pdf',
        code,
        message:
          "Ce PDF semble scanné (sans texte). Utilisez un PDF contenant du texte ou un fichier DOCX.",
      };
    }

    if (code === 'CV_TEXT_UNREADABLE' || code === 'CV_TEXT_TOO_SHORT') {
      return {
        kind: 'unreadable',
        code,
        message:
          "Le texte extrait est trop court ou illisible pour être analysé. Vérifiez votre fichier.",
      };
    }

    if (
      code === 'CV_FILE_TOO_LARGE'
      || code === 'CV_FILE_TYPE_UNSUPPORTED'
      || code === 'CV_FILE_SIGNATURE_INVALID'
      || code === 'CV_FILE_CORRUPTED'
      || code === 'CV_FILE_REQUIRED'
      || code === 'CV_UPLOAD_INVALID'
    ) {
      return {
        kind: 'invalid_file',
        code,
        message:
          error.message
          || 'Le fichier fourni est invalide. Utilisez un PDF texte ou un DOCX de moins de 5 Mo.',
      };
    }

    return { kind: 'unknown', code, message: error.message || "L'analyse a échoué." };
  }

  // Erreur reseau / fetch impossible : on l'annonce sans inventer de resultat.
  return {
    kind: 'network',
    message: "Le service est momentanément injoignable. Vérifiez votre connexion et réessayez.",
  };
};

export interface CreateAnalysisInput {
  file: File;
  jobTitle?: string;
  jobDescription?: string;
}

export const createCvAnalysis = async (
  input: CreateAnalysisInput,
): Promise<CvAnalysis> => {
  const form = new FormData();
  form.append('cv', input.file);
  if (input.jobTitle) form.append('jobTitle', input.jobTitle);
  if (input.jobDescription) form.append('jobDescription', input.jobDescription);

  const payload = await apiUpload<{ analysis: CvAnalysis }>(BASE, form);
  return payload.analysis;
};

export const listCvAnalyses = async (
  limit = 10,
  offset = 0,
): Promise<CvAnalysisPage> =>
  apiFetch<CvAnalysisPage>(
    `${BASE}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
  );

export const getCvAnalysis = async (id: string): Promise<CvAnalysis> => {
  const payload = await apiFetch<{ analysis: CvAnalysis }>(
    `${BASE}/${encodeURIComponent(id)}`,
  );
  return payload.analysis;
};

export const deleteCvAnalysis = async (id: string): Promise<void> => {
  await apiFetch<null>(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const downloadCvReport = async (id: string): Promise<Blob> =>
  apiDownload(`${BASE}/${encodeURIComponent(id)}/report.pdf`);
