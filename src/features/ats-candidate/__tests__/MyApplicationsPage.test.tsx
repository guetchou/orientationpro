import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyApplicationsPage from '../MyApplicationsPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  listMyApplications: vi.fn(),
  getJob: vi.fn(),
}));

import { getCapabilityRegistry, getJob, listMyApplications } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = () => render(<MemoryRouter><MyApplicationsPage /></MemoryRouter>);

describe('MyApplicationsPage', () => {
  it('affiche un état vide avec un lien vers les offres', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/Aucune candidature/)).toBeInTheDocument());
  });

  it('liste les candidatures avec le libellé français et jamais un score', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'app-1', jobId: 'job-1', state: 'under_review', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });

    renderPage();
    await waitFor(() => expect(screen.getByText('Comptable')).toBeInTheDocument());
    expect(screen.getByText("En cours d'examen")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument();
  });

  it('retombe sur un titre générique si la récupération du titre échoue', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listMyApplications as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'app-1', jobId: 'job-1', state: 'submitted', submittedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    (getJob as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('gone'));

    renderPage();
    await waitFor(() => expect(screen.getByText('Offre')).toBeInTheDocument());
  });
});
