import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import JobsDashboardPage from '../JobsDashboardPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  listJobs: vi.fn(),
  createJob: vi.fn(),
  publishJob: vi.fn(),
  closeJob: vi.fn(),
}));

import { closeJob, createJob, getCapabilityRegistry, listJobs, publishJob } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};
const disabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'disabled', configured: false, publicLimitations: [] }],
};

const renderPage = () => render(<MemoryRouter><JobsDashboardPage /></MemoryRouter>);

describe('JobsDashboardPage', () => {
  it('affiche une carte "non activé" quand la capacité est désactivée', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(disabledRegistry);
    renderPage();
    await waitFor(() => expect(screen.getByText(/indisponible/i)).toBeInTheDocument());
    expect(listJobs).not.toHaveBeenCalled();
  });

  it('liste les offres bornées par le serveur (aucun filtrage client)', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'job-1', title: 'Comptable', description: 'Gestion comptable.', status: 'draft', version: 1 },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Comptable')).toBeInTheDocument());
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
  });

  it('affiche un état vide quand aucune offre n’existe', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/Aucune offre/)).toBeInTheDocument());
  });

  it('crée une offre via le formulaire', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1' });
    renderPage();
    await waitFor(() => expect(screen.getByLabelText(/titre/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/titre/i), { target: { value: 'Développeur' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Construire des services.' } });
    fireEvent.click(screen.getByRole('button', { name: /créer l.offre/i }));

    await waitFor(() => expect(createJob).toHaveBeenCalledWith('Développeur', 'Construire des services.'));
  });

  it('publie une offre en brouillon', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'job-1', title: 'Comptable', description: 'x', status: 'draft', version: 1 },
    ]);
    (publishJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', status: 'published', version: 2 });
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /publier/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /publier/i }));
    await waitFor(() => expect(publishJob).toHaveBeenCalledWith('job-1', 1));
  });

  it('clôture une offre publiée', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (listJobs as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'job-1', title: 'Comptable', description: 'x', status: 'published', version: 2 },
    ]);
    (closeJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', status: 'closed', version: 3 });
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /clôturer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /clôturer/i }));
    await waitFor(() => expect(closeJob).toHaveBeenCalledWith('job-1', 2));
  });
});
