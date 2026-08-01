import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RecruiterAssignmentPage from '../RecruiterAssignmentPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  getJob: vi.fn(),
  listJobRecruiters: vi.fn(),
  assignRecruiter: vi.fn(),
  removeRecruiter: vi.fn(),
}));

import { assignRecruiter, getCapabilityRegistry, getJob, listJobRecruiters, removeRecruiter } from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = (jobId = 'job-1') => render(
  <MemoryRouter initialEntries={[`/recruteur/ats/offres/${jobId}/equipe`]}>
    <Routes>
      <Route path="/recruteur/ats/offres/:jobId/equipe" element={<RecruiterAssignmentPage />} />
    </Routes>
  </MemoryRouter>,
);

describe('RecruiterAssignmentPage', () => {
  it('liste les recruteurs affectés', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listJobRecruiters as ReturnType<typeof vi.fn>).mockResolvedValue([
      { jobId: 'job-1', recruiterAccountId: 'recruiter-1', assignedByAccountId: 'manager-1', assignedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    renderPage();
    await waitFor(() => expect(screen.getByText('recruiter-1')).toBeInTheDocument());
  });

  it('affiche un état vide sans recruteur affecté', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listJobRecruiters as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/Aucun recruteur affecté/)).toBeInTheDocument());
  });

  it('affecte un recruteur via le formulaire', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listJobRecruiters as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (assignRecruiter as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByLabelText(/identifiant du compte recruteur/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/identifiant du compte recruteur/i), { target: { value: 'recruiter-2' } });
    fireEvent.click(screen.getByRole('button', { name: /^affecter$/i }));
    await waitFor(() => expect(assignRecruiter).toHaveBeenCalledWith('job-1', 'recruiter-2'));
  });

  it('un doublon d\'affectation (409) affiche un message clair', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listJobRecruiters as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const { ApiError } = await import('@/lib/apiClient');
    (assignRecruiter as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 409, 'ATS_RECRUITER_ALREADY_ASSIGNED'));
    renderPage();
    await waitFor(() => expect(screen.getByLabelText(/identifiant du compte recruteur/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/identifiant du compte recruteur/i), { target: { value: 'recruiter-2' } });
    fireEvent.click(screen.getByRole('button', { name: /^affecter$/i }));
    await waitFor(() => expect(screen.getByText(/déjà affecté/i)).toBeInTheDocument());
  });

  it('retire un recruteur affecté', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getJob as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'job-1', title: 'Comptable' });
    (listJobRecruiters as ReturnType<typeof vi.fn>).mockResolvedValue([
      { jobId: 'job-1', recruiterAccountId: 'recruiter-1', assignedByAccountId: 'manager-1', assignedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    (removeRecruiter as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /retirer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /retirer/i }));
    await waitFor(() => expect(removeRecruiter).toHaveBeenCalledWith('job-1', 'recruiter-1'));
  });
});
