import { ApiError, apiDownload, apiFetch, apiUpload } from '@/lib/apiClient';
import type { AtsAnalysis, AtsAnalysisPage } from './types';

// Le parcours public d'analyse ATS consomme exclusivement l'API /api/v1/cv/*.
// Aucun score n'est calcule cote frontend ; en cas d'echec, on affiche un etat
// honnete, jamais un resultat simule.
const BASE = '/v1/cv/analyses';
const PREVIEW_PATH = '/v1/cv/preview';

export interface CvPreview {
  kind: 'cv-preview-v1';
  score: number;
  targetScore: number | null;
  sectionsPresent: number;
  sectionsTotal: number;
  highlights: string[];
  priorityAction: string;
  authenticationRequiredFor: Array<'full_report' | 'export' | 'save'>;
}

export interface CvErrorView {
  kind:
    | 'service_unavailable' // flag desactive / route absente
    | 'not_found' // analyse ATS inexistante pour ce compte
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

export const describeCvError = (error: unknown): CvErrorView => {
  if (error instanceof ApiError) {
    const code = error.code;

    if (error.status === 404) {
      if (code === 'CV_ANALYSIS_NOT_FOUND') {
        return { kind: 'not_found', code, message: "Cette analyse ATS n'existe pas ou plus." };
      }
      return {
        kind: 'service_unavailable',
        code,
        message:
          "Le service d'analyse ATS n'est pas encore activé. Réessayez plus tard.",
      };
    }

    if (error.status === 401) {
      return {
        kind: 'unauthenticated',
        code,
        message: 'Votre session a expiré. Reconnectez-vous pour lancer une analyse ATS.',
      };
    }

    if (error.status === 403) {
      return {
        kind: 'forbidden',
        code,
        message: "Votre compte n'est pas autorisé à utiliser l'analyse ATS.",
      };
    }

    if (code === 'CV_PDF_SCANNED') {
      return {
        kind: 'scanned_pdf',
        code,
        message:
          "Ce PDF semble scanné (sans texte). L'analyse ATS a besoin d'un PDF contenant du texte ou d'un fichier DOCX.",
      };
    }

    if (code === 'CV_TEXT_UNREADABLE' || code === 'CV_TEXT_TOO_SHORT') {
      return {
        kind: 'unreadable',
        code,
        message:
          "Le texte extrait est trop court ou illisible pour l'analyse ATS. Vérifiez votre fichier.",
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

    return { kind: 'unknown', code, message: error.message || "L'analyse ATS a échoué." };
  }

  return {
    kind: 'network',
    message: "Le service d'analyse ATS est momentanément injoignable. Vérifiez votre connexion.",
  };
};

export interface CreateAtsAnalysisInput {
  file: File;
  jobTitle?: string;
  jobDescription?: string;
}

export const createAtsAnalysis = async (
  input: CreateAtsAnalysisInput,
): Promise<AtsAnalysis> => {
  const form = new FormData();
  form.append('cv', input.file);
  if (input.jobTitle) form.append('jobTitle', input.jobTitle);
  if (input.jobDescription) form.append('jobDescription', input.jobDescription);

  const payload = await apiUpload<{ analysis: AtsAnalysis }>(BASE, form);
  return payload.analysis;
};

export const createAtsPreview = async (
  input: CreateAtsAnalysisInput,
): Promise<CvPreview> => {
  const form = new FormData();
  form.append('cv', input.file);
  if (input.jobTitle) form.append('jobTitle', input.jobTitle);
  if (input.jobDescription) form.append('jobDescription', input.jobDescription);

  const payload = await apiUpload<{ preview: CvPreview }>(PREVIEW_PATH, form);
  return payload.preview;
};

export const listAtsAnalyses = async (
  limit = 10,
  offset = 0,
): Promise<AtsAnalysisPage> =>
  apiFetch<AtsAnalysisPage>(
    `${BASE}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
  );

export const getAtsAnalysis = async (id: string): Promise<AtsAnalysis> => {
  const payload = await apiFetch<{ analysis: AtsAnalysis }>(
    `${BASE}/${encodeURIComponent(id)}`,
  );
  return payload.analysis;
};

export const deleteAtsAnalysis = async (id: string): Promise<void> => {
  await apiFetch<null>(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const downloadAtsReport = async (id: string): Promise<Blob> =>
  apiDownload(`${BASE}/${encodeURIComponent(id)}/report.pdf`);
