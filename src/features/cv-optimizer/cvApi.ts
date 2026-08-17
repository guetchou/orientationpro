import { ApiError, apiDownload, apiFetch, apiUpload } from '@/lib/apiClient';
import type { AtsAnalysis, AtsAnalysisPage } from './types';

const BASE = '/v1/cv/analyses';
const PREVIEW_PATH = '/v1/cv/preview';
const CV_ALGORITHM_VERSION = 'makoki-cv-rules-v1';

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
    | 'service_unavailable'
    | 'not_found'
    | 'unauthenticated'
    | 'forbidden'
    | 'invalid_file'
    | 'scanned_pdf'
    | 'unreadable'
    | 'network'
    | 'conflict'
    | 'unknown';
  message: string;
  code?: string;
}

export const describeCvError = (error: unknown): CvErrorView => {
  if (error instanceof ApiError) {
    const code = error.code;
    if (error.status === 404) {
      if (code === 'CV_ANALYSIS_NOT_FOUND') return { kind: 'not_found', code, message: "Cette analyse ATS n'existe pas ou plus." };
      return { kind: 'service_unavailable', code, message: "Le service d'analyse ATS n'est pas encore activé. Réessayez plus tard." };
    }
    if (error.status === 401) return { kind: 'unauthenticated', code, message: 'Votre session a expiré. Reconnectez-vous pour lancer une analyse ATS.' };
    if (error.status === 403) return { kind: 'forbidden', code, message: "Votre compte n'est pas autorisé à utiliser l'analyse ATS." };
    if (error.status === 409 && code === 'CV_IDEMPOTENCY_CONFLICT') {
      return { kind: 'conflict', code, message: "Cette reprise d'analyse ne correspond plus au CV d'origine. Relance une nouvelle analyse." };
    }
    if (code === 'CV_PDF_SCANNED') return { kind: 'scanned_pdf', code, message: "Ce PDF semble scanné (sans texte). L'analyse ATS a besoin d'un PDF contenant du texte ou d'un fichier DOCX." };
    if (code === 'CV_TEXT_UNREADABLE' || code === 'CV_TEXT_TOO_SHORT') {
      return { kind: 'unreadable', code, message: "Le texte extrait est trop court ou illisible pour l'analyse ATS. Vérifiez votre fichier." };
    }
    if ([
      'CV_FILE_TOO_LARGE',
      'CV_FILE_TYPE_UNSUPPORTED',
      'CV_FILE_SIGNATURE_INVALID',
      'CV_FILE_CORRUPTED',
      'CV_FILE_REQUIRED',
      'CV_UPLOAD_INVALID',
      'CV_IDEMPOTENCY_INVALID',
    ].includes(code || '')) {
      return { kind: 'invalid_file', code, message: error.message || 'Le fichier fourni est invalide. Utilisez un PDF texte ou un DOCX de moins de 5 Mo.' };
    }
    return { kind: 'unknown', code, message: error.message || "L'analyse ATS a échoué." };
  }
  return { kind: 'network', message: "Le service d'analyse ATS est momentanément injoignable. Vérifiez votre connexion." };
};

export interface CreateAtsAnalysisInput {
  file: File;
  jobTitle?: string;
  jobDescription?: string;
  idempotencyKey?: string;
}

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

const sha256Hex = async (value: ArrayBuffer | string) => {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return toHex(await crypto.subtle.digest('SHA-256', bytes));
};

const normalizedOptional = (value?: string) => {
  const normalized = value?.normalize('NFKC').trim();
  return normalized || null;
};

export const buildCvRequestFingerprint = async (input: CreateAtsAnalysisInput) => {
  const sourceSha256 = await sha256Hex(await input.file.arrayBuffer());
  return sha256Hex(JSON.stringify({
    sourceSha256,
    target: {
      jobTitle: normalizedOptional(input.jobTitle),
      jobDescription: normalizedOptional(input.jobDescription),
      requiredSkills: [],
    },
    algorithmVersion: CV_ALGORITHM_VERSION,
  }));
};

export const createAtsAnalysis = async (input: CreateAtsAnalysisInput): Promise<AtsAnalysis> => {
  const form = new FormData();
  form.append('cv', input.file);
  if (input.jobTitle) form.append('jobTitle', input.jobTitle);
  if (input.jobDescription) form.append('jobDescription', input.jobDescription);
  if (input.idempotencyKey) {
    form.append('idempotencyKey', input.idempotencyKey);
    form.append('requestFingerprint', await buildCvRequestFingerprint(input));
  }
  const payload = await apiUpload<{ analysis: AtsAnalysis }>(BASE, form);
  return payload.analysis;
};

export const createAtsPreview = async (input: CreateAtsAnalysisInput): Promise<CvPreview> => {
  const form = new FormData();
  form.append('cv', input.file);
  if (input.jobTitle) form.append('jobTitle', input.jobTitle);
  if (input.jobDescription) form.append('jobDescription', input.jobDescription);
  const payload = await apiUpload<{ preview: CvPreview }>(PREVIEW_PATH, form);
  return payload.preview;
};

export const listAtsAnalyses = async (limit = 10, offset = 0): Promise<AtsAnalysisPage> =>
  apiFetch<AtsAnalysisPage>(`${BASE}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);

export const getAtsAnalysis = async (id: string): Promise<AtsAnalysis> => {
  const payload = await apiFetch<{ analysis: AtsAnalysis }>(`${BASE}/${encodeURIComponent(id)}`);
  return payload.analysis;
};

export const deleteAtsAnalysis = async (id: string): Promise<void> => {
  await apiFetch<null>(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const downloadAtsReport = async (id: string): Promise<Blob> =>
  apiDownload(`${BASE}/${encodeURIComponent(id)}/report.pdf`);
