import type { RiasecDimensionCode } from '@/types/riasec';

export type CareerRiasecVector = Record<RiasecDimensionCode, number | null>;
export type CompleteCareerRiasecVector = Record<RiasecDimensionCode, number>;
export type CareerProfileStatus = 'direct' | 'mapped' | 'reviewed' | 'missing';
export type CareerLocalRelevanceStatus = 'unreviewed' | 'relevant' | 'limited' | 'excluded';
export type CareerTranslationStatus = 'available' | 'native' | 'unavailable';
export type CareerCrosswalkReviewStatus = 'proposed' | 'official' | 'reviewed' | 'rejected';
export type CareerConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';
export type CareerRecommendationSignal = 'riasec' | 'skills' | 'education';

export interface CareerSource {
  id: string;
  kind: string;
  version: string;
  title: string;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
}

export interface CareerCrosswalk {
  mappingKind: 'exact' | 'close' | 'broad' | 'narrow' | 'manual';
  confidenceScore: number | null;
  confidenceLevel: CareerConfidenceLevel;
  reviewStatus: CareerCrosswalkReviewStatus;
  sourceReference: string | null;
  sourceVersion: string | null;
  mappedAt: string | null;
  provenance: unknown;
}

export interface CareerOccupationAlias {
  locale: string;
  label: string;
  kind: string;
  sourceReference?: string | null;
}

export interface CareerOccupationSkill {
  id: string;
  locale: string;
  preferredLabel: string;
  description: string;
  kind: string;
  relationKind: string;
  importanceScore: number | null;
  provenance: unknown;
}

export interface CareerOccupation {
  id: string;
  sourceCode: string;
  requestedLocale: string;
  locale: string;
  fallbackLocale: string | null;
  translationStatus: CareerTranslationStatus;
  preferredLabel: string;
  description: string;
  status: string;
  iscoCode: string | null;
  jobZone: number | null;
  riasec: CareerRiasecVector;
  riasecDisplayCode: string | null;
  riasecProfileStatus: CareerProfileStatus;
  riasecProvenance: unknown;
  localRelevanceStatus: CareerLocalRelevanceStatus;
  localRelevanceNotes: string | null;
  metadata: Record<string, unknown> | null;
  presentationOccupationId: string;
  escoOccupationId: string | null;
  source: CareerSource;
  riasecSource: CareerSource;
  presentationSource: CareerSource;
  crosswalk: CareerCrosswalk | null;
  aliases?: CareerOccupationAlias[];
  skills?: CareerOccupationSkill[];
}

export interface CareerSkillEvidence {
  available: boolean;
  score: number | null;
  confirmedSkillCount: number;
  matchedSkillCount: number;
  matchedSkills: Array<{
    escoUri: string;
    label: string;
    proficiency: string;
    relationKind: string;
    contribution: number;
  }>;
}

export interface CareerEducationReadiness {
  available: boolean;
  score: number | null;
  status: 'missing_education' | 'unknown_job_zone' | 'meets_reference' | 'near_reference' | 'development_gap' | 'large_gap';
  highestEducationLevel: string | null;
  highestEducationStatus: string | null;
  jobZone: number | null;
  requiredRank: number | null;
  gap: number | null;
}

export interface CareerRecommendationExplanation {
  code: string;
  signal: CareerRecommendationSignal;
  score: number | null;
  message: string;
}

export interface CareerMatch {
  occupationId: string;
  sourceCode: string;
  preferredLabel: string;
  locale: string;
  requestedLocale: string;
  fallbackLocale: string | null;
  translationStatus: CareerTranslationStatus;
  presentationSource: CareerSource;
  riasecSource: CareerSource;
  crosswalk: CareerCrosswalk | null;
  fitScore: number;
  algorithmVersion: string;
  userCode: string;
  occupationCode: string;
  components: {
    cosineSimilarity: number;
    rankAgreement: number;
    cosineWeight: number;
    rankWeight: number;
  };
  differentiation: {
    user: number;
    occupation: number;
  };
  provenance: unknown;
  recommendationScore?: number;
  recommendationAlgorithmVersion?: string;
  profileComponents?: {
    riasec: { available: true; score: number };
    skills: CareerSkillEvidence;
    education: CareerEducationReadiness;
    configuredWeights: Record<CareerRecommendationSignal, number>;
    appliedWeights: Record<CareerRecommendationSignal, number>;
  };
  explanations?: CareerRecommendationExplanation[];
  cautions?: string[];
}

export interface CareerResultSummary {
  id: string;
  displayCode: string;
  algorithmVersion: string;
  createdAt: string;
  normalizedScores: CompleteCareerRiasecVector;
}

export interface CareerMatchingSummary {
  requestedLocale: string;
  locale: string;
  eligibleOccupationCount: number;
  translatedOccupationCount: number;
  fallbackOccupationCount: number;
  matches: CareerMatch[];
}

export interface CareerMatchResponse {
  result: CareerResultSummary;
  matching: CareerMatchingSummary;
}

export interface CareerRecommendationContext {
  algorithmVersion: string;
  profileCompletionPercent: number;
  currentSituation: string | null;
  primaryGoal: string | null;
  mobilityScope: string | null;
  highestEducationLevel: string | null;
  highestEducationStatus: string | null;
  confirmedEscoSkillCount: number;
  configuredWeights: Record<CareerRecommendationSignal, number>;
  usedSignals: string[];
  missingSignals: string[];
  limitations: string[];
}

export interface CareerProfileRecommendationResponse {
  result: CareerResultSummary;
  recommendationContext: CareerRecommendationContext;
  matching: CareerMatchingSummary;
}

export interface CareerCatalogSourceSummary {
  id: string;
  kind: string;
  version: string;
  locale: string;
  title: string;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
  contentSha256: string;
  declaredRecordCount: number;
  occupationCount: number;
  matchableCount: number;
  locallyReviewedRelevantCount: number;
  importedAt: string;
}
