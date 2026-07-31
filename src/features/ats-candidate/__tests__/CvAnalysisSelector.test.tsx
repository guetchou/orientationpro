import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CvAnalysisSelector } from '../CvAnalysisSelector';

vi.mock('@/features/cv-optimizer/cvApi', () => ({
  listAtsAnalyses: vi.fn(),
}));

import { listAtsAnalyses } from '@/features/cv-optimizer/cvApi';

const summary = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'cv-1',
  algorithmVersion: 'v1',
  document: { fileName: 'cv.pdf', mimeType: 'application/pdf', fileSize: 100, pageCount: 1, detectedLanguage: 'fr' },
  scores: {},
  targetTitle: 'Comptable',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('CvAnalysisSelector', () => {
  it('affiche les analyses et propose de postuler sans CV', async () => {
    (listAtsAnalyses as ReturnType<typeof vi.fn>).mockResolvedValue({
      analyses: [summary()],
      pagination: { limit: 10, offset: 0, total: 1 },
    });
    const onChange = vi.fn();
    render(<CvAnalysisSelector value={undefined} onChange={onChange} />);

    await waitFor(() => expect(screen.getByText(/cv\.pdf/)).toBeInTheDocument());
    expect(screen.getByText(/Postuler sans lier/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/cv\.pdf/));
    expect(onChange).toHaveBeenCalledWith('cv-1');
  });

  it('revient à "sans CV" quand on sélectionne cette option', async () => {
    (listAtsAnalyses as ReturnType<typeof vi.fn>).mockResolvedValue({
      analyses: [summary()],
      pagination: { limit: 10, offset: 0, total: 1 },
    });
    const onChange = vi.fn();
    render(<CvAnalysisSelector value="cv-1" onChange={onChange} />);
    await waitFor(() => expect(screen.getByText(/cv\.pdf/)).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText(/Postuler sans lier/));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('affiche un état vide quand aucune analyse n’existe', async () => {
    (listAtsAnalyses as ReturnType<typeof vi.fn>).mockResolvedValue({
      analyses: [],
      pagination: { limit: 10, offset: 0, total: 0 },
    });
    render(<CvAnalysisSelector value={undefined} onChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/pas encore d’analyse/)).toBeInTheDocument());
  });

  it('affiche un message dégradé si le chargement échoue, sans planter', async () => {
    (listAtsAnalyses as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    render(<CvAnalysisSelector value={undefined} onChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/pas disponibles/)).toBeInTheDocument());
  });
});
