import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/apiClient';
import { ApplicationForm } from '../ApplicationForm';

vi.mock('@/features/cv-optimizer/cvApi', () => ({
  listAtsAnalyses: vi.fn().mockResolvedValue({ analyses: [], pagination: { limit: 10, offset: 0, total: 0 } }),
}));

vi.mock('../api', () => ({
  depositApplication: vi.fn(),
}));

import { depositApplication } from '../api';

describe('ApplicationForm — soumission', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('appelle onDeposited avec la candidature créée', async () => {
    const application = { id: 'app-1', jobId: 'job-1', state: 'submitted' };
    (depositApplication as ReturnType<typeof vi.fn>).mockResolvedValue({ application, event: {} });
    const onDeposited = vi.fn();
    render(<ApplicationForm jobId="job-1" onDeposited={onDeposited} />);
    await waitFor(() => expect(screen.getByText(/pas encore d’analyse/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /envoyer ma candidature/i }));
    await waitFor(() => expect(onDeposited).toHaveBeenCalledWith(application));
  });

  it('candidature en doublon (409) affiche un message contrôlé sans planter', async () => {
    (depositApplication as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError('conflict', 409, 'ATS_APPLICATION_ALREADY_EXISTS'),
    );
    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/pas encore d’analyse/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /envoyer ma candidature/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/déjà déposé/i));
  });

  it("offre fermée entre-temps (409 ATS_JOB_NOT_PUBLISHED) affiche le message dédié", async () => {
    (depositApplication as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ApiError('conflict', 409, 'ATS_JOB_NOT_PUBLISHED'),
    );
    render(<ApplicationForm jobId="job-1" onDeposited={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/pas encore d’analyse/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /envoyer ma candidature/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/n'accepte plus|n’accepte plus/i));
  });
});
