import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CvOptimizerPage } from '../CvOptimizerPage';
import { createAtsAnalysis } from '../cvApi';
import { clearCvGuestDraft, loadCvGuestDraft } from '../cvGuestDraftStore';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../cvApi', () => ({
  createAtsAnalysis: vi.fn(),
  createAtsPreview: vi.fn(),
  describeCvError: vi.fn(() => ({ kind: 'unknown', message: 'error' })),
}));

vi.mock('../cvGuestDraftStore', () => ({
  loadCvGuestDraft: vi.fn(),
  saveCvGuestDraft: vi.fn(),
  clearCvGuestDraft: vi.fn(),
}));

vi.mock('../CvUploadStep', () => ({ CvUploadStep: () => <div>upload-step</div> }));
vi.mock('../JobTargetStep', () => ({ JobTargetStep: () => <div>target-step</div> }));
vi.mock('../AtsAnalysisResult', () => ({ AtsAnalysisResult: () => <div>full-analysis</div> }));
vi.mock('../CvGuestPreview', () => ({ CvGuestPreview: () => <div>guest-preview</div> }));
vi.mock('../states', () => ({
  CvLoading: () => <div>loading-analysis</div>,
  CvErrorState: () => <div>analysis-error</div>,
}));

const authenticatedAnalysis = {
  id: 'analysis-1',
  snapshot: {
    scores: { global: 80 },
    targetMatch: null,
  },
};

describe('CvOptimizerPage resume flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reprend automatiquement le CV invité après authentification', async () => {
    const file = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'account-1' } } as ReturnType<typeof useAuth>);
    vi.mocked(loadCvGuestDraft).mockResolvedValue({
      file,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    });
    vi.mocked(createAtsAnalysis).mockResolvedValue(authenticatedAnalysis as never);

    render(
      <MemoryRouter>
        <CvOptimizerPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(createAtsAnalysis).toHaveBeenCalledWith({ file });
    });
    await waitFor(() => {
      expect(clearCvGuestDraft).toHaveBeenCalled();
      expect(screen.getByText('full-analysis')).toBeInTheDocument();
    });
  });

  it('restaure l’aperçu invité après un rechargement sans renvoyer le fichier au serveur', async () => {
    const file = new File(['cv content'], 'cv.pdf', { type: 'application/pdf' });
    const preview = {
      kind: 'cv-preview-v1' as const,
      score: 72,
      targetScore: null,
      sectionsPresent: 4,
      sectionsTotal: 6,
      highlights: ['Coordonnées détectées'],
      priorityAction: 'Renforcer les expériences.',
      authenticationRequiredFor: ['full_report', 'export', 'save'] as const,
    };
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    vi.mocked(loadCvGuestDraft).mockResolvedValue({
      file,
      preview,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    });

    render(
      <MemoryRouter>
        <CvOptimizerPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('guest-preview')).toBeInTheDocument();
    expect(createAtsAnalysis).not.toHaveBeenCalled();
  });
});
