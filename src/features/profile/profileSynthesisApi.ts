import { apiFetch } from '@/lib/apiClient';

export interface ProfileSynthesisEnvelope {
  snapshot: {
    id: string;
    immutable: true;
    schemaVersion: string;
    engineVersion: string;
    orientationResultId: string;
    recommendationSnapshotId: string;
    riasecAlgorithmVersion: string;
    recommendationAlgorithmVersion: string;
    inputFingerprint: string;
    createdAt: string;
  };
  synthesis: {
    schemaVersion: string;
    engineVersion: string;
    inputFingerprint: string;
    summary: {
      headline: string;
      keySignals: {
        riasecDisplayCode: string;
        riasecPrimaryCode: string | null;
        riasecCodeStatus: string | null;
        highestEducationLevel: string | null;
        confirmedEscoSkillCount: number;
        confirmedHypothesisCount: number;
        rejectedHypothesisCount: number;
        recommendationCount: number;
      };
      strengths: string[];
      explorationPriorities: string[];
      missingInformation: string[];
      nextActions: string[];
    };
    sources: {
      recommendations: {
        topMatches: Array<{
          occupationId: string;
          preferredLabel: string;
          recommendationScore: number;
          riasecFitScore: number;
        }>;
      };
    };
    provenance: {
      riasecAlgorithmVersion: string;
      recommendationAlgorithmVersion: string;
      preparationAdapterVersion: string;
      onetSources: Array<{ version?: string }>;
      escoSources: Array<{ version?: string }>;
    };
    limitations: string[];
  };
  created?: boolean;
}

export const listProfileSyntheses = (limit = 20) =>
  apiFetch<{ syntheses: ProfileSynthesisEnvelope[] }>(
    `/v1/profile/syntheses?limit=${encodeURIComponent(String(limit))}`,
  );

export const getProfileSynthesis = (synthesisId: string) =>
  apiFetch<ProfileSynthesisEnvelope>(
    `/v1/profile/syntheses/${encodeURIComponent(synthesisId)}`,
  );

export const createProfileSynthesis = () =>
  apiFetch<ProfileSynthesisEnvelope>('/v1/profile/syntheses', {
    method: 'POST',
    body: JSON.stringify({}),
  });
