import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApplicationDetailPage from '../ApplicationDetailPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  getApplication: vi.fn(),
  getApplicationHistory: vi.fn(),
  withdrawApplication: vi.fn(),
}));

import {
  getApplication,
  getApplicationHistory,
  getCapabilityRegistry,
  withdrawApplication,
} from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = (applicationId = 'app-1') => render(
  <MemoryRouter initialEntries={[`/mes-candidatures/${applicationId}`]}>
    <Routes>
      <Route path="/mes-candidatures/:applicationId" element={<ApplicationDetailPage />} />
    </Routes>
  </MemoryRouter>,
);

describe('ApplicationDetailPage', () => {
  it('affiche l’état et l’historique public sans exposer de métadonnées internes', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', state: 'under_review', version: 2,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, applicationId: 'app-1', eventType: 'application.submitted', from: 'submitted', to: 'submitted', actorAccountId: 'x', actorRole: 'candidate', reason: null, metadata: { internalNote: 'secret' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    ]);

    renderPage();
    await waitFor(() => expect(screen.getByText("En cours d'examen")).toBeInTheDocument());
    expect(screen.queryByText(/secret|internalNote/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retirer ma candidature/i })).toBeInTheDocument();
  });

  it('cache le bouton de retrait pour un état terminal', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', state: 'hired', version: 5,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-05T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByText('Recruté(e)')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /retirer ma candidature/i })).not.toBeInTheDocument();
  });

  it('demande confirmation avant de retirer, puis met à jour l’état après succès', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    const submitted = {
      id: 'app-1', jobId: 'job-1', state: 'submitted', version: 1,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const withdrawn = {
      id: 'app-1', jobId: 'job-1', state: 'withdrawn', version: 2,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-06T00:00:00.000Z',
    };
    (getApplication as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(submitted)
      .mockResolvedValueOnce(withdrawn);
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (withdrawApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      application: withdrawn,
      event: {},
    });

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /retirer ma candidature/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retirer ma candidature/i }));
    expect(withdrawApplication).not.toHaveBeenCalled();
    expect(screen.getByText(/Confirmez-vous le retrait/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirmer le retrait/i }));
    await waitFor(() => expect(withdrawApplication).toHaveBeenCalledWith('app-1', 1));
    await waitFor(() => expect(screen.getByText('Candidature retirée')).toBeInTheDocument());
  });

  it('un conflit de version (409) sur le retrait affiche un message et ne casse pas la page', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', state: 'submitted', version: 1,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { ApiError } = await import('@/lib/apiClient');
    (withdrawApplication as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 409, 'ATS_VERSION_CONFLICT'));

    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /retirer ma candidature/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retirer ma candidature/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer le retrait/i }));

    await waitFor(() => expect(screen.getByText(/modifiée entre-temps/)).toBeInTheDocument());
  });

  it('403/404 au chargement affichent une vue générique, jamais un vidage brut', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    const { ApiError } = await import('@/lib/apiClient');
    (getApplication as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 403, 'ATS_RESOURCE_FORBIDDEN'));
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/accès/i));
  });
});
