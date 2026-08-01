import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApplicationReviewPage from '../ApplicationReviewPage';

vi.mock('../api', () => ({
  getCapabilityRegistry: vi.fn(),
  getApplication: vi.fn(),
  getApplicationHistory: vi.fn(),
  listEvaluations: vi.fn(),
  transitionApplication: vi.fn(),
  createEvaluation: vi.fn(),
}));

import {
  createEvaluation,
  getApplication,
  getApplicationHistory,
  getCapabilityRegistry,
  listEvaluations,
  transitionApplication,
} from '../api';

const enabledRegistry = {
  schemaVersion: 'x',
  capabilities: [{ id: 'ats.workflow-v1', status: 'experimental', configured: true, publicLimitations: [] }],
};

const renderPage = (applicationId = 'app-1') => render(
  <MemoryRouter initialEntries={[`/recruteur/ats/candidatures/${applicationId}`]}>
    <Routes>
      <Route path="/recruteur/ats/candidatures/:applicationId" element={<ApplicationReviewPage />} />
    </Routes>
  </MemoryRouter>,
);

const selectOption = async (triggerId: string, optionName: RegExp) => {
  const trigger = document.getElementById(triggerId);
  if (!trigger) throw new Error(`Select trigger #${triggerId} not found`);
  fireEvent.click(trigger);
  await waitFor(() => expect(screen.getByRole('option', { name: optionName })).toBeInTheDocument());
  fireEvent.click(screen.getByRole('option', { name: optionName }));
};

describe('ApplicationReviewPage', () => {
  it('affiche l’historique complet, non expurgé (acteur, motif, code de motif visibles)', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', candidateAccountId: 'candidate-1', state: 'rejected', version: 3,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-05T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 1, applicationId: 'app-1', eventType: 'application.transitioned', from: 'under_review', to: 'rejected',
        actorAccountId: 'recruiter-1', actorRole: 'recruiter', reason: 'Profil non retenu.', reasonCode: 'not_qualified',
        metadata: {}, occurredAt: '2026-01-05T00:00:00.000Z',
      },
    ]);
    (listEvaluations as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getAllByText('Candidature rejetée').length).toBeGreaterThan(0));
    expect(screen.getByText(/Profil non qualifié/)).toBeInTheDocument();
  });

  it('masque le formulaire de transition pour un état terminal', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', candidateAccountId: 'candidate-1', state: 'hired', version: 5,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-05T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (listEvaluations as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByText('Recruté(e)')).toBeInTheDocument());
    expect(screen.queryByText(/Faire évoluer la candidature/)).not.toBeInTheDocument();
  });

  it('exige un motif et un code de motif pour un rejet, puis transmet reason+reasonCode', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', candidateAccountId: 'candidate-1', state: 'under_review', version: 2,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (listEvaluations as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (transitionApplication as ReturnType<typeof vi.fn>).mockResolvedValue({ application: {}, event: {} });

    renderPage();
    await waitFor(() => expect(screen.getByLabelText(/nouvel état/i)).toBeInTheDocument());

    await selectOption('transition-next-state', /candidature rejetée/i);
    await waitFor(() => expect(screen.getByLabelText(/motif de rejet/i)).toBeInTheDocument());

    const applyButton = screen.getByRole('button', { name: /appliquer/i });
    expect(applyButton).toBeDisabled();

    await selectOption('rejection-reason-code', /profil non qualifié/i);
    fireEvent.change(screen.getByLabelText(/détail \(visible en interne/i), { target: { value: 'Compétences insuffisantes.' } });

    await waitFor(() => expect(applyButton).not.toBeDisabled());
    fireEvent.click(applyButton);

    await waitFor(() => expect(transitionApplication).toHaveBeenCalledWith('app-1', {
      to: 'rejected',
      expectedVersion: 2,
      reason: 'Compétences insuffisantes.',
      reasonCode: 'not_qualified',
    }));
  });

  it('enregistre une évaluation avec recommandation, note et commentaire interne', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    (getApplication as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'app-1', jobId: 'job-1', candidateAccountId: 'candidate-1', state: 'under_review', version: 2,
      submittedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    });
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (listEvaluations as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createEvaluation as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

    renderPage();
    await waitFor(() => expect(screen.getByLabelText(/recommandation/i)).toBeInTheDocument());

    await selectOption('evaluation-recommendation', /faire avancer/i);
    await selectOption('evaluation-rating', /^4$/);
    fireEvent.change(screen.getByLabelText(/note interne/i), { target: { value: 'Bon entretien technique.' } });
    fireEvent.click(screen.getByRole('button', { name: /enregistrer l.évaluation/i }));

    await waitFor(() => expect(createEvaluation).toHaveBeenCalledWith('app-1', {
      recommendation: 'advance',
      rating: 4,
      note: 'Bon entretien technique.',
    }));
  });

  it('un accès inter-organisation (403) affiche un message générique', async () => {
    (getCapabilityRegistry as ReturnType<typeof vi.fn>).mockResolvedValue(enabledRegistry);
    const { ApiError } = await import('@/lib/apiClient');
    (getApplication as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError('x', 403, 'ATS_RESOURCE_FORBIDDEN'));
    (getApplicationHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (listEvaluations as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).not.toMatch(/organisation|autre/i);
  });
});
