const DIMENSIONS = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C']);
const ALGORITHM_VERSION = 'career-riasec-cosine-rank-v1';

const round = (value, digits = 3) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const toScoreVector = (scores, label) => DIMENSIONS.map((dimension) => {
  const value = Number(scores?.[dimension]);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new TypeError(`${label}.${dimension} must be a finite number between 0 and 100`);
  }
  return value;
});

const cosineSimilarity = (left, right) => {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const leftNorm = Math.sqrt(left.reduce((sum, value) => sum + value ** 2, 0));
  const rightNorm = Math.sqrt(right.reduce((sum, value) => sum + value ** 2, 0));
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (leftNorm * rightNorm);
};

const rankDimensions = (scores) => DIMENSIONS
  .map((dimension) => ({ dimension, score: Number(scores[dimension]) }))
  .sort((left, right) => right.score - left.score || left.dimension.localeCompare(right.dimension));

const topThreeWeights = (scores) => {
  const weights = new Map();
  rankDimensions(scores).slice(0, 3).forEach(({ dimension }, index) => {
    weights.set(dimension, 3 - index);
  });
  return weights;
};

const weightedRankAgreement = (userScores, occupationScores) => {
  const user = topThreeWeights(userScores);
  const occupation = topThreeWeights(occupationScores);
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
  const ranked = rankDimensions(scores);
  const cutoff = ranked[2]?.score;
  if (cutoff === undefined) return '';
  return ranked
    .filter(({ score }) => score >= cutoff)
    .map(({ dimension }) => dimension)
    .join('');
};

const profileDifferentiation = (scores) => {
  const ranked = rankDimensions(scores);
  return ranked[0].score - ranked[ranked.length - 1].score;
};

const matchOccupation = ({ userScores, occupation }) => {
  const occupationScores = occupation?.riasec;
  const userVector = toScoreVector(userScores, 'userScores');
  const occupationVector = toScoreVector(occupationScores, 'occupation.riasec');

  const cosine = cosineSimilarity(userVector, occupationVector);
  const rankAgreement = weightedRankAgreement(userScores, occupationScores);
  const fitScore = 100 * ((0.8 * cosine) + (0.2 * rankAgreement));

  return {
    occupationId: occupation.id,
    sourceCode: occupation.sourceCode,
    preferredLabel: occupation.preferredLabel,
    fitScore: round(fitScore, 2),
    algorithmVersion: ALGORITHM_VERSION,
    userCode: displayCode(userScores),
    occupationCode: occupation.riasecDisplayCode || displayCode(occupationScores),
    components: {
      cosineSimilarity: round(cosine, 6),
      rankAgreement: round(rankAgreement, 6),
      cosineWeight: 0.8,
      rankWeight: 0.2,
    },
    differentiation: {
      user: round(profileDifferentiation(userScores), 3),
      occupation: round(profileDifferentiation(occupationScores), 3),
    },
    provenance: occupation.riasecProvenance || null,
  };
};

const rankOccupations = ({ userScores, occupations, limit = 20 }) => {
  if (!Array.isArray(occupations)) throw new TypeError('occupations must be an array');
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw new TypeError('limit must be an integer between 1 and 200');
  }

  const eligible = occupations.filter((occupation) => (
    occupation &&
    ['direct', 'mapped', 'reviewed'].includes(occupation.riasecProfileStatus) &&
    occupation.riasec &&
    DIMENSIONS.every((dimension) => Number.isFinite(Number(occupation.riasec[dimension])))
  ));

  return eligible
    .map((occupation) => matchOccupation({ userScores, occupation }))
    .sort((left, right) => (
      right.fitScore - left.fitScore ||
      left.preferredLabel.localeCompare(right.preferredLabel) ||
      left.occupationId.localeCompare(right.occupationId)
    ))
    .slice(0, limit);
};

module.exports = {
  ALGORITHM_VERSION,
  DIMENSIONS,
  cosineSimilarity,
  displayCode,
  matchOccupation,
  profileDifferentiation,
  rankDimensions,
  rankOccupations,
  weightedRankAgreement,
};
