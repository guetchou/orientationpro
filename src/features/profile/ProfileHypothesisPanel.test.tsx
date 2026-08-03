import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileHypothesisPanel from './ProfileHypothesisPanel';
import * as api from './profileApi';

vi.mock('./profileApi', async () => {
  const actual = await vi.importActual<typeof import('./profileApi')>('./profileApi');
  return { ...actual, getAdaptiveProfile: vi.fn(), generateProfileHypotheses: vi.fn(), decideProfileHypothesis: vi.fn() };
});

const payload = {
  profile: null,
  education: [],
  skills: [],
  hypotheses: [{
    id: 'hyp-1', hypothesis_type: 'goal_clarification', status: 'proposed' as const, confidence: 0.99,
    rationale: 'Un objectif explicite évite une supposition.',
    value_json: { title: 'Préciser ton objectif principal', question: 'Quel résultat concret attends-tu ?' },
  }],
};

describe('ProfileHypothesisPanel', () => {
  beforeEach(() => {
    vi.mocked(api.getAdaptiveProfile).mockResolvedValue(payload);
    vi.mocked(api.generateProfileHypotheses).mockResolvedValue({
      ...payload,
      hypothesisGeneration: {
        generatorVersion: 'profile-hypotheses-v1', profileFingerprint: 'a'.repeat(64),
        candidateCount: 1, createdCount: 1, reusedCount: 0, preservedDecisionCount: 0, removedObsoleteCount: 0,
      },
    });
    vi.mocked(api.decideProfileHypothesis).mockResolvedValue({ ...payload, hypotheses: [] });
  });

  it('met à jour les suggestions puis permet une décision humaine explicite', async () => {
    const view = render(<ProfileHypothesisPanel />);
    expect(await screen.findByText('Préciser ton objectif principal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /mettre à jour les suggestions/i }));
    await waitFor(() => expect(api.generateProfileHypotheses).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(api.decideProfileHypothesis).toHaveBeenCalledWith('hyp-1', 'confirmed'));

    const copy = view.container.textContent || '';
    expect(copy).not.toContain('profile-hypotheses-v1');
    expect(copy).not.toContain('Confiance technique');
  });
});
