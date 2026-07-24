import type { CompleteCareerRiasecVector } from '@/types/career';
import type { RiasecDimensionCode } from '@/types/riasec';

const DIMENSIONS: RiasecDimensionCode[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const TIE_ORDER = [...DIMENSIONS].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
const TIE_INDEX = new Map(TIE_ORDER.map((dimension, index) => [dimension, index]));

export interface CareerFitBand {
  label: string;
  description: string;
}

export const careerFitBand = (score: number): CareerFitBand => {
  if (score >= 90) {
    return {
      label: 'Très forte proximité',
      description: 'Le profil d’intérêts est très proche de celui associé à ce métier.',
    };
  }
  if (score >= 75) {
    return {
      label: 'Forte proximité',
      description: 'Plusieurs intérêts dominants correspondent à ce métier.',
    };
  }
  if (score >= 60) {
    return {
      label: 'Proximité à explorer',
      description: 'Le métier présente des correspondances, mais mérite une exploration complémentaire.',
    };
  }
  return {
    label: 'Piste secondaire',
    description: 'La proximité d’intérêts est plus limitée que pour les métiers mieux classés.',
  };
};

export const percentFromRatio = (value: number) => Math.round(Math.max(0, Math.min(value, 1)) * 100);

export const dominantDimensions = (
  scores: CompleteCareerRiasecVector,
  limit = 3,
): Array<{ dimension: RiasecDimensionCode; score: number }> => DIMENSIONS
  .map((dimension) => ({ dimension, score: scores[dimension] }))
  .sort((left, right) => (
    right.score - left.score ||
    (TIE_INDEX.get(left.dimension) ?? 0) - (TIE_INDEX.get(right.dimension) ?? 0)
  ))
  .slice(0, Math.max(1, Math.min(limit, DIMENSIONS.length)));

export const localRelevanceLabel = (status: string) => {
  if (status === 'relevant') return 'Pertinence Congo validée';
  if (status === 'limited') return 'Pertinence locale limitée';
  if (status === 'excluded') return 'Exclu du contexte local';
  return 'Pertinence Congo à examiner';
};

export const profileStatusLabel = (status: string) => {
  if (status === 'direct') return 'Profil RIASEC direct';
  if (status === 'mapped') return 'Profil RIASEC rapproché';
  if (status === 'reviewed') return 'Profil RIASEC revu';
  return 'Profil RIASEC indisponible';
};
