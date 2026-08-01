import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobPipelinePage from '../JobPipelinePage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  getJob: vi.fn(),
  listApplicationsForJob: vi.fn(),
}));

import { getCapabilityRegistry, getJob, listApplicationsForJob } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = (jobId = 'job-1') => render(
  <MemoryRouter initialEntries={[`/recruteur/ats/offres/${jobId}/pipeline`]}>
    <Routes>
      <Route path="/recruteur/ats/offres/:jobId/pipeline" element={<JobPipelinePage />} />
    </Routes>
  </MemoryRouter>,
);

describe('JobPipelinePage', () => {
  it('liste les candidatures de l’offre', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listApplicationsForJob as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'app-1', jobId: 'job-1', state: 'under_review', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText("En cours d'examen")).toBeInTheDocument());
    expect(listApplicationsForJob).toHaveBeenCalledWith('job-1', { state: undefined, candidateEmail: undefined });
  });

  it('affiche un état vide sans candidature', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listApplicationsForJob as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByRole('heading', { name: /Aucune candidature/ })).toBeInTheDocument());
  });

  it('un 403 sur le pipeline affiche une erreur générique (isolation organisation)', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    const { ApiError } = await import('@/lib/apiClient');
    (getJob as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 403, 'ATS_JOB_RESOURCE_FORBIDDEN'));
    (listApplicationsForJob as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).not.toMatch(/organisation|autre/i);
  });
});
