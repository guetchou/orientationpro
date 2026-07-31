import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobListPage from '../JobListPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  listPublishedJobs: vi.fn(),
}));

import { getCapabilityRegistry, listPublishedJobs } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};
const disabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'disabled', configured: false, publicLimitations: [] }],
};

const renderPage = () => render(<MemoryRouter><JobListPage /></MemoryRouter>);

describe('JobListPage', () => {
  it('affiche une carte "non activé" quand la capacité est désactivée', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(disabledRegistry);
    renderPage();
    await waitFor(() => expect(screen.getByText(/indisponible/i)).toBeInTheDocument());
    expect(listPublishedJobs).not.toHaveBeenCalled();
  });

  it('liste les offres publiées quand la capacité est active', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listPublishedJobs as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'job-1', title: 'Comptable', description: 'Gestion comptable.', status: 'published' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Comptable')).toBeInTheDocument());
  });

  it('affiche un état vide quand aucune offre n’est publiée', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listPublishedJobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/Aucune offre publiée/)).toBeInTheDocument());
  });

  it('affiche une erreur contrôlée si le chargement échoue', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listPublishedJobs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
