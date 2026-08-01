import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobDetailPage from '../JobDetailPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  getJob: vi.fn(),
  listMyApplications: vi.fn(),
  depositApplication: vi.fn(),
}));
vi.mock('@/features/cv-optimizer/cvApi', () => ({
  listAtsAnalyses: vi.fn().mockResolvedValue({ analyses: [], pagination: { limit: 10, offset: 0, total: 0 } }),
}));

import { getCapabilityRegistry, getJob, listMyApplications } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = (jobId = 'job-1') => render(
  <MemoryRouter initialEntries={[`/offres/${jobId}`]}>
    <Routes>
      <Route path="/offres/:jobId" element={<JobDetailPage />} />
    </Routes>
  </MemoryRouter>,
);

describe('JobDetailPage', () => {
  it('affiche le détail de l’offre et le formulaire de candidature quand aucune candidature n’existe', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'job-1', title: 'Comptable', description: 'Gestion comptable.', status: 'published',
    });
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByText('Comptable')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /envoyer ma candidature/i })).toBeInTheDocument();
  });

  it('affiche un lien vers la candidature existante au lieu du formulaire en cas de doublon', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'job-1', title: 'Comptable', description: 'x', status: 'published',
    });
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'app-1', jobId: 'job-1', state: 'submitted' },
    ]);

    renderPage();
    await waitFor(() => expect(screen.getByText(/déjà déposé/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /envoyer ma candidature/i })).not.toBeInTheDocument();
  });

  it('affiche une erreur générique sur 404 sans détail de la ressource', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    const { ApiError } = await import('@/lib/apiClient');
    (getJob as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 404, 'ATS_JOB_NOT_FOUND'));
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
