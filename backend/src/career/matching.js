'use strict';

const DIMENSIONS = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C']);
const ALGORITHM_VERSION = 'career-riasec-cosine-rank-v1';
const DIMENSION_TIE_ORDER = Object.freeze([...DIMENSIONS].sort());
const DIMENSION_TIE_INDEX = new Map(DIMENSION_TIE_ORDER.map((dimension, index) => [dimension, index]));
const round = (value, digits = 3) => Math.round(value * (10 ** digits)) / (10 ** digits);
const toScoreVector = (scores, label) => DIMENSIONS.map((dimension) => {
  const value = Number(scores?.[dimension]);
  if (!Number.isFinite(value) || value < 0 || value > 100) throw new TypeError(`${label}.${dimension} must be a finite number between 0 and 100`);
  return value;
});
const cosineSimilarity = (left, right) => {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const leftNorm = Math.sqrt(left.reduce((sum, value) => sum + value ** 2, 0));
  const rightNorm = Math.sqrt(right.reduce((sum, value) => sum + value ** 2, 0));
  return leftNorm === 0 || rightNorm === 0 ? 0 : dot / (leftNorm * rightNorm);
};
const rankDimensions = (scores) => DIMENSIONS.map((dimension) => ({ dimension, score: Number(scores[dimension]) })).sort((left, right) => right.score - left.score || DIMENSION_TIE_INDEX.get(left.dimension) - DIMENSION_TIE_INDEX.get(right.dimension));
const rankGroups = (scores) => {
  const groups = [];
  for (const entry of rankDimensions(scores)) {
    const latest = groups.at(-1);
    if (latest && latest.score === entry.score) latest.dimensions.push(entry.dimension);
    else groups.push({ score: entry.score, dimensions: [entry.dimension] });
  }
  return groups;
};
const leadingGroups = (scores, count = 3) => {
  let covered = 0;
  const selected = [];
  for (const group of rankGroups(scores)) {
    if (covered >= count) break;
    selected.push(group);
    covered += group.dimensions.length;
  }
  return selected;
};
const dominantWeights = (scores) => {
  const weights = new Map();
  leadingGroups(scores).forEach((group, index) => group.dimensions.forEach((dimension) => weights.set(dimension, Math.max(3 - index, 1))));
  return weights;
};
const weightedRankAgreement = (userScores, occupationScores) => {
  const user = dominantWeights(userScores);
  const occupation = dominantWeights(occupationScores);
  let intersection = 0;
  let union = 0;
  for (const dimension of DIMENSIONS) {
    const userWeight = user.get(dimension) || 0;
    const occupationWeight = occupation.get(dimension) || 0;
    intersection += Math.min(userWeight, occupationWeight);
    union += Math.max(userWeight, occupationWeight);
  }
  return union === 0 ? 0 : intersection / union;
};
const displayCode = (scores) => {
  const groups = leadingGroups(scores);
  const dimensions = groups.flatMap((group) => group.dimensions);
  return groups.some((group) => group.dimensions.length > 1) ? dimensions.sort((left, right) => DIMENSION_TIE_INDEX.get(left) - DIMENSION_TIE_INDEX.get(right)).join('') : dimensions.join('');
};
const profileDifferentiation = (scores) => {
  const ranked = rankDimensions(scores);
  return ranked[0].score - ranked.at(-1).score;
};
const matchOccupation = ({ userScores, occupation }) => {
  const userVector = toScoreVector(userScores, 'userScores');
  const occupationVector = toScoreVector(occupation?.riasec, 'occupation.riasec');
  const cosine = cosineSimilarity(userVector, occupationVector);
  const rankAgreement = weightedRankAgreement(userScores, occupation.riasec);
  return {
    occupationId: occupation.id,
    sourceCode: occupation.sourceCode,
    preferredLabel: occupation.preferredLabel,
    locale: occupation.locale,
    requestedLocale: occupation.requestedLocale,
    fallbackLocale: occupation.fallbackLocale,
    translationStatus: occupation.translationStatus,
    presentationSource: occupation.presentationSource || occupation.source || null,
    riasecSource: occupation.riasecSource || occupation.source || null,
    crosswalk: occupation.crosswalk || null,
    fitScore: round(100 * ((0.8 * cosine) + (0.2 * rankAgreement)), 2),
    algorithmVersion: ALGORITHM_VERSION,
    userCode: displayCode(userScores),
    occupationCode: occupation.riasecDisplayCode || displayCode(occupation.riasec),
    components: { cosineSimilarity: round(cosine, 6), rankAgreement: round(rankAgreement, 6), cosineWeight: 0.8, rankWeight: 0.2 },
    differentiation: { user: round(profileDifferentiation(userScores), 3), occupation: round(profileDifferentiation(occupation.riasec), 3) },
    provenance: occupation.riasecProvenance || null,
  };
};
const rankOccupations = ({ userScores, occupations, limit = 20 }) => {
  if (!Array.isArray(occupations)) throw new TypeError('occupations must be an array');
  if (!Number.isInteger(limit) || limit < 1 || limit > 2000) throw new TypeError('limit must be an integer between 1 and 2000');
  return occupations.filter((occupation) => occupation && ['direct', 'mapped', 'reviewed'].includes(occupation.riasecProfileStatus) && occupation.riasec && DIMENSIONS.every((dimension) => Number.isFinite(Number(occupation.riasec[dimension])))).map((occupation) => matchOccupation({ userScores, occupation })).sort((left, right) => right.fitScore - left.fitScore || left.preferredLabel.localeCompare(right.preferredLabel) || left.occupationId.localeCompare(right.occupationId)).slice(0, limit);
};

module.exports = { ALGORITHM_VERSION, DIMENSIONS, cosineSimilarity, displayCode, matchOccupation, profileDifferentiation, rankDimensions, rankOccupations, weightedRankAgreement };
