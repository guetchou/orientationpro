import type { RiasecDimensionCode, RiasecResult } from '@/types/riasec';
import type { AdvisorRiasecDimension, AdvisorRiasecProfile } from './advisor-types';

export const RIASEC_PROFILE_STORAGE_KEY = 'makoki.life-project.riasec-profile.v1';

export const riasecDimensionLabels: Record<AdvisorRiasecDimension, string> = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};

const dimensions: AdvisorRiasecDimension[] = ['R', 'I', 'A', 'S', 'E', 'C'];

const isDimension = (value: unknown): value is AdvisorRiasecDimension => (
  typeof value === 'string' && dimensions.includes(value as AdvisorRiasecDimension)
);

const normalizedScore = (result: RiasecResult, dimension: RiasecDimensionCode) => {
  const value = Number(result.scores?.[dimension]?.normalized);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
};

export const toAdvisorRiasecProfile = (result: RiasecResult): AdvisorRiasecProfile => ({
  resultId: result.id,
  attemptId: result.attemptId,
  instrumentId: result.instrumentId,
  algorithmVersion: result.algorithmVersion,
  primaryCode: result.primaryCode,
  displayCode: result.displayCode,
  scores: Object.fromEntries(
    dimensions.map((dimension) => [dimension, normalizedScore(result, dimension)]),
  ) as Record<AdvisorRiasecDimension, number>,
  ranking: result.ranking.ordered
    .filter((entry) => isDimension(entry.dimension))
    .map((entry) => ({
      dimension: entry.dimension,
      score: Number.isFinite(Number(entry.score)) ? Number(entry.score) : 0,
    })),
  completedAt: result.createdAt,
});

export const persistRiasecProfile = (profile: AdvisorRiasecProfile) => {
  try {
    localStorage.setItem(RIASEC_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // La persistance locale améliore la reprise mais ne remplace jamais le résultat serveur.
  }
  return profile;
};

export const persistRiasecResult = (result: RiasecResult) => (
  persistRiasecProfile(toAdvisorRiasecProfile(result))
);

export const readPersistedRiasecProfile = (): AdvisorRiasecProfile | null => {
  try {
    const raw = localStorage.getItem(RIASEC_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<AdvisorRiasecProfile>;
    if (!value
      || typeof value.resultId !== 'string'
      || typeof value.attemptId !== 'string'
      || typeof value.instrumentId !== 'string'
      || typeof value.algorithmVersion !== 'string'
      || typeof value.displayCode !== 'string'
      || typeof value.completedAt !== 'string'
      || !Array.isArray(value.ranking)
      || !value.scores) {
      return null;
    }
    const ranking = value.ranking.filter((entry) => (
      entry && isDimension(entry.dimension) && Number.isFinite(Number(entry.score))
    ));
    const scores = Object.fromEntries(dimensions.map((dimension) => [
      dimension,
      Number.isFinite(Number(value.scores?.[dimension]))
        ? Math.max(0, Math.min(100, Number(value.scores?.[dimension])))
        : 0,
    ])) as Record<AdvisorRiasecDimension, number>;
    return {
      resultId: value.resultId,
      attemptId: value.attemptId,
      instrumentId: value.instrumentId,
      algorithmVersion: value.algorithmVersion,
      primaryCode: typeof value.primaryCode === 'string' ? value.primaryCode : null,
      displayCode: value.displayCode,
      scores,
      ranking: ranking.map((entry) => ({
        dimension: entry.dimension,
        score: Number(entry.score),
      })),
      completedAt: value.completedAt,
    };
  } catch {
    return null;
  }
};

export const topRiasecDimensions = (profile: AdvisorRiasecProfile, limit = 3) => (
  profile.ranking.slice(0, Math.max(1, limit)).map((entry) => ({
    ...entry,
    label: riasecDimensionLabels[entry.dimension],
  }))
);
