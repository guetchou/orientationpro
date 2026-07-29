import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createProfileSynthesis,
  listProfileSyntheses,
  type ProfileSynthesisEnvelope,
} from './profileSynthesisApi';
import ProfileSynthesisPanel from './ProfileSynthesisPanel';

vi.mock('./profileSynthesisApi', () => ({
  createProfileSynthesis: vi.fn(),
  listProfileSyntheses: vi.fn(),
}));

const payload: ProfileSynthesisEnvelope = {
  snapshot: {
    id: 'synthesis-1', immutable: true, schemaVersion: 'profile-synthesis-v1',
    engineVersion: 'profile-synthesis-engine-v1', orientationResultId: 'result-1',
    recommendationSnapshotId: 'recommendation-1', riasecAlgorithmVersion: 'riasec-makoki-scoring-v2',
    recommendationAlgorithmVersion: 'career-profile-context-v2', inputFingerprint: 'a'.repeat(64),
    createdAt: '2026-07-29T00:00:00.000Z',
  },
  synthesis: {
    schemaVersion: 'profile-synthesis-v1', engineVersion: 'profile-synthesis-engine-v1',
    inputFingerprint: 'a'.repeat(64),
    summary: {
      headline: 'Profil RIASEC S/E-I orienté vers l’objectif : rechercher un emploi.',
      keySignals: {
        riasecDisplayCode: 'S/E-I', riasecPrimaryCode: null, riasecCodeStatus: 'tied',
        highestEducationLevel: 'licence', confirmedEscoSkillCount: 1,
        confirmedHypothesisCount: 1, rejectedHypothesisCount: 0, recommendationCount: 1,
      },
      strengths: ['analyser des données'], explorationPriorities: [], missingInformation: [],
      nextActions: ['Comparer les pistes.'],
    },
    sources: { recommendations: { topMatches: [{
      occupationId: 'occupation-1', preferredLabel: 'Analyste de données',
      recommendationScore: 88, riasecFitScore: 84,
    }] } },
    provenance: {
      riasecAlgorithmVersion: 'riasec-makoki-scoring-v2',
      recommendationAlgorithmVersion: 'career-profile-context-v2',
      preparationAdapterVersion: 'onet-job-zone-adapter-v1',
      onetSources: [{ version: '30.3' }], escoSources: [{ version: '1.2.1' }],
    },
    limitations: ['Synthèse exploratoire.'],
  },
};

describe('ProfileSynthesisPanel', () => {
  beforeEach(() => {
    vi.mocked(listProfileSyntheses).mockReset();
    vi.mocked(createProfileSynthesis).mockReset();
  });

  it('affiche la synthèse immutable la plus récente', async () => {
    vi.mocked(listProfileSyntheses).mockResolvedValue({ syntheses: [payload] });
    render(<ProfileSynthesisPanel />);
    expect(await screen.findByText(payload.synthesis.summary.headline)).toBeInTheDocument();
    expect(screen.getByText(/Analyste de données/)).toBeInTheDocument();
    expect(screen.getByText('immutable')).toBeInTheDocument();
  });

  it('crée une synthèse lorsque le compte n’en possède pas', async () => {
    vi.mocked(listProfileSyntheses).mockResolvedValue({ syntheses: [] });
    vi.mocked(createProfileSynthesis).mockResolvedValue({ ...payload, created: true });
    render(<ProfileSynthesisPanel />);
    fireEvent.click(await screen.findByRole('button', { name: 'Créer la synthèse' }));
    await waitFor(() => expect(createProfileSynthesis).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(payload.synthesis.summary.headline)).toBeInTheDocument();
  });
});
