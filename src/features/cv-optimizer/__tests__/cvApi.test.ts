import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { describeCvError, createAtsAnalysis, listAtsAnalyses } from '../cvApi';

describe('describeCvError', () => {
  it('404 sans code metier => service ATS non active (flag desactive)', () => {
    const view = describeCvError(new ApiError('Not Found', 404));
    expect(view.kind).toBe('service_unavailable');
    expect(view.message).toMatch(/analyse ATS.*pas encore activé/i);
  });

  it('404 CV_ANALYSIS_NOT_FOUND => introuvable', () => {
    const view = describeCvError(new ApiError('x', 404, 'CV_ANALYSIS_NOT_FOUND'));
    expect(view.kind).toBe('not_found');
  });

  it('401 => session expiree', () => {
    expect(describeCvError(new ApiError('x', 401)).kind).toBe('unauthenticated');
  });

  it('403 => permission insuffisante', () => {
    expect(describeCvError(new ApiError('x', 403, 'PERMISSION_DENIED')).kind).toBe('forbidden');
  });

  it('PDF scanne => message dedie', () => {
    const view = describeCvError(new ApiError('x', 422, 'CV_PDF_SCANNED'));
    expect(view.kind).toBe('scanned_pdf');
    expect(view.message).toMatch(/scanné/i);
  });

  it('fichier trop grand => invalid_file', () => {
    expect(describeCvError(new ApiError('x', 413, 'CV_FILE_TOO_LARGE')).kind).toBe('invalid_file');
  });

  it('erreur non-API (reseau) => network, sans simuler de resultat', () => {
    const view = describeCvError(new TypeError('Failed to fetch'));
    expect(view.kind).toBe('network');
  });
});

describe('appels API ATS', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('createAtsAnalysis envoie un multipart FormData avec la session HttpOnly', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ analysis: { id: 'a1' } }),
    });

    const file = new File(['%PDF-1.4 contenu'], 'cv.pdf', { type: 'application/pdf' });
    await createAtsAnalysis({ file, jobTitle: 'Comptable' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.credentials).toBe('include');
    const headers = new Headers(init.headers);
    expect(headers.get('Content-Type')).toBeNull();
    expect(headers.get('Authorization')).toBeNull();
    const body = init.body as FormData;
    expect(body.get('cv')).toBeInstanceOf(File);
    expect(body.get('jobTitle')).toBe('Comptable');
  });

  it('listAtsAnalyses passe limit et offset', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ analyses: [], pagination: { limit: 10, offset: 0, total: 0 } }),
    });
    await listAtsAnalyses(10, 20);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('limit=10');
    expect(String(url)).toContain('offset=20');
  });
});
