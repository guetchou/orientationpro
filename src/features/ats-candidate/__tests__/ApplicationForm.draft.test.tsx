import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApplicationForm } from '../ApplicationForm';

vi.mock('@/features/cv-optimizer/cvApi', () => ({
  listAtsAnalyses: vi.fn().mockResolvedValue({
    analyses: [
      {
        id: 'cv-1',
        algorithmVersion: 'v1',
        document: { fileName: 'cv.pdf', mimeType: 'application/pdf', fileSize: 1, pageCount: 1, detectedLanguage: 'fr' },
        scores: {},
        targetTitle: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    pagination: { limit: 10, offset: 0, total: 1 },
  }),
}));

vi.mock('../api', () => ({
  depositApplication: vi.fn(),
}));

import { depositApplication } from '../api';

const DRAFT_KEY = 'makoki.ats-candidate.application-draft.job-1.v1';

describe('ApplicationForm — brouillon local de la sélection CV', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('persiste la sélection puis la restaure au remontage (rafraîchissement simulé)', async () => {
    const { unmount } = render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/cv\.pdf/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toContain('cv-1'));
    unmount();

    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeChecked());
  });

  it('ne réécrase pas un changement de sélection par le brouillon initial', async () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ cvAnalysisId: 'cv-1' }));
    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeChecked());

    fireEvent.click(screen.getByLabelText(/Postuler sans lier/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toBeNull());
    expect(screen.getByLabelText(/Postuler sans lier/)).toBeChecked();
  });

  it('supprime la clé de brouillon quand la sélection redevient "sans CV"', async () => {
    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/cv\.pdf/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull());

    fireEvent.click(screen.getByLabelText(/Postuler sans lier/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toBeNull());
  });

  it('supprime le brouillon après une soumission réussie', async () => {
    (depositApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      application: { id: 'app-1', state: 'submitted' },
      event: {},
    });
    const onDeposited = vi.fn();
    render(<ApplicationForm jobId="job-1" onDeposited={onDeposited} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/cv\.pdf/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull());

    fireEvent.click(screen.getByRole('button', { name: /envoyer ma candidature/i }));
    await waitFor(() => expect(onDeposited).toHaveBeenCalled());
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('ignore une valeur de brouillon corrompue sans planter et nettoie la clé', async () => {
    localStorage.setItem(DRAFT_KEY, '{ceci nest pas du json valide');
    expect(() => render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />)).not.toThrow();
    await waitFor(() => expect(screen.getByLabelText(/Postuler sans lier/)).toBeChecked());
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('ne lève aucune erreur quand localStorage est indisponible', async () => {
    const unavailable = () => { throw new DOMException('insecure', 'SecurityError'); };
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(unavailable);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(unavailable);
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(unavailable);

    try {
      expect(() => render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />)).not.toThrow();
      await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeInTheDocument());
      expect(() => fireEvent.click(screen.getByLabelText(/cv\.pdf/))).not.toThrow();
    } finally {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    }
  });

  it('isole les brouillons par offre (jobId différent = clé différente)', async () => {
    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText(/cv\.pdf/)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/cv\.pdf/));
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).not.toBeNull());
    expect(localStorage.getItem('makoki.ats-candidate.application-draft.job-2.v1')).toBeNull();
  });
});
