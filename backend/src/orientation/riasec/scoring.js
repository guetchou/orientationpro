const DIMENSIONS = Object.freeze(['R', 'I', 'A', 'S', 'E', 'C']);
const LEGACY_ALGORITHM_VERSION = 'riasec-opc-scoring-v1';
const ALGORITHM_VERSION = 'riasec-makoki-scoring-v2';
const SUPPORTED_ALGORITHM_VERSIONS = Object.freeze([
  LEGACY_ALGORITHM_VERSION,
  ALGORITHM_VERSION,
]);

class RiasecValidationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'RiasecValidationError';
    this.code = code;
    this.details = details;
  }
}

const round = (value, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const standardDeviation = (values) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new RiasecValidationError('INVALID_INSTRUMENT', 'The instrument must contain items.');
  }

  const ids = new Set();
  const counts = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));

  for (const item of items) {
    if (!item || typeof item.id !== 'string' || item.id.length === 0) {
      throw new RiasecValidationError('INVALID_ITEM', 'Every item must have a stable identifier.');
    }
    if (ids.has(item.id)) {
      throw new RiasecValidationError('DUPLICATE_ITEM', 'Instrument item identifiers must be unique.', {
        itemId: item.id,
      });
    }
    if (!DIMENSIONS.includes(item.dimension)) {
      throw new RiasecValidationError('INVALID_DIMENSION', 'Every item must belong to one RIASEC dimension.', {
        itemId: item.id,
        dimension: item.dimension,
      });
    }
    ids.add(item.id);
    counts[item.dimension] += 1;
  }

  const missingDimensions = DIMENSIONS.filter((dimension) => counts[dimension] === 0);
  if (missingDimensions.length > 0) {
    throw new RiasecValidationError(
      'MISSING_DIMENSION_ITEMS',
      'The instrument must contain at least one item for every RIASEC dimension.',
      { missingDimensions },
    );
  }

  return { ids, counts };
};

const validateResponses = (responses, itemIds) => {
  if (!Array.isArray(responses)) {
    throw new RiasecValidationError('INVALID_RESPONSES', 'Responses must be provided as an array.');
  }

  const responseMap = new Map();
  for (const response of responses) {
    const itemId = response?.itemId;
    const value = response?.value;

    if (typeof itemId !== 'string' || !itemIds.has(itemId)) {
      throw new RiasecValidationError('UNKNOWN_ITEM', 'A response references an unknown instrument item.', {
        itemId,
      });
    }
    if (responseMap.has(itemId)) {
      throw new RiasecValidationError('DUPLICATE_RESPONSE', 'Each instrument item must be answered once.', {
        itemId,
      });
    }
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new RiasecValidationError(
        'INVALID_RESPONSE_VALUE',
        'RIASEC responses must be integers from 1 to 5.',
        { itemId, value },
      );
    }
    responseMap.set(itemId, value);
  }

  const missingItemIds = [...itemIds].filter((itemId) => !responseMap.has(itemId));
  if (missingItemIds.length > 0) {
    throw new RiasecValidationError(
      'INCOMPLETE_RESPONSES',
      'Every instrument item must be answered before submission.',
      { missingItemIds },
    );
  }

  return responseMap;
};

const groupRankedScores = (normalizedScores, tieOrder) => {
  const ordered = DIMENSIONS
    .map((dimension) => ({ dimension, score: normalizedScores[dimension] }))
    .sort((left, right) => {
      const scoreDifference = right.score - left.score;
      if (scoreDifference !== 0) return scoreDifference;
      return tieOrder(left.dimension, right.dimension);
    });

  const groups = [];
  for (const entry of ordered) {
    const latest = groups.at(-1);
    if (latest && latest.score === entry.score) {
      latest.dimensions.push(entry.dimension);
    } else {
      groups.push({ score: entry.score, dimensions: [entry.dimension] });
    }
  }

  let covered = 0;
  const leadingGroups = [];
  for (const group of groups) {
    if (covered >= 3) break;
    leadingGroups.push(group);
    covered += group.dimensions.length;
  }

  const hasLeadingTie = leadingGroups.some((group) => group.dimensions.length > 1);
  const primaryCode = !hasLeadingTie && leadingGroups.length === 3
    ? leadingGroups.map((group) => group.dimensions[0]).join('')
    : null;
  const displayCode = leadingGroups
    .map((group) => group.dimensions.join('/'))
    .join('-');

  return {
    ordered,
    groups,
    leadingGroups,
    primaryCode,
    displayCode,
    codeStatus: primaryCode ? 'determinate' : 'tied',
    hasLeadingTie,
  };
};

const buildLegacyRanking = (normalizedScores) => groupRankedScores(
  normalizedScores,
  (left, right) => left.localeCompare(right),
);

const buildRanking = (normalizedScores) => {
  const canonicalIndex = new Map(DIMENSIONS.map((dimension, index) => [dimension, index]));
  return groupRankedScores(
    normalizedScores,
    (left, right) => canonicalIndex.get(left) - canonicalIndex.get(right),
  );
};

const describeResponsePattern = (responseValues) => {
  const frequencies = new Map();
  for (const value of responseValues) {
    frequencies.set(value, (frequencies.get(value) || 0) + 1);
  }
  const highestFrequency = Math.max(...frequencies.values());

  return {
    completionRate: 100,
    sameAnswerRatio: round((highestFrequency / responseValues.length) * 100),
    responseStandardDeviation: round(standardDeviation(responseValues)),
  };
};

const scoreRiasec = ({ items, responses, algorithmVersion = ALGORITHM_VERSION }) => {
  if (!SUPPORTED_ALGORITHM_VERSIONS.includes(algorithmVersion)) {
    throw new RiasecValidationError(
      'UNSUPPORTED_RIASEC_ALGORITHM',
      'The requested RIASEC scoring algorithm is not supported.',
      { algorithmVersion, supportedVersions: SUPPORTED_ALGORITHM_VERSIONS },
    );
  }

  const { ids: itemIds, counts } = validateItems(items);
  const responseMap = validateResponses(responses, itemIds);
  const rawScores = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));

  for (const item of items) {
    const response = responseMap.get(item.id);
    const adjustedValue = item.reverseScored ? 6 - response : response;
    rawScores[item.dimension] += adjustedValue;
  }

  const scores = {};
  const normalizedScores = {};
  for (const dimension of DIMENSIONS) {
    const itemCount = counts[dimension];
    const minimum = itemCount;
    const maximum = itemCount * 5;
    const normalized = round(((rawScores[dimension] - minimum) / (maximum - minimum)) * 100);
    scores[dimension] = {
      raw: rawScores[dimension],
      minimum,
      maximum,
      itemCount,
      normalized,
    };
    normalizedScores[dimension] = normalized;
  }

  const ranking = algorithmVersion === LEGACY_ALGORITHM_VERSION
    ? buildLegacyRanking(normalizedScores)
    : buildRanking(normalizedScores);
  const normalizedValues = DIMENSIONS.map((dimension) => normalizedScores[dimension]);
  const responseValues = responses.map((response) => response.value);
  const differentiation = {
    range: round(Math.max(...normalizedValues) - Math.min(...normalizedValues)),
    standardDeviation: round(standardDeviation(normalizedValues)),
  };

  if (algorithmVersion !== LEGACY_ALGORITHM_VERSION) {
    differentiation.kind = 'descriptive';
    differentiation.normativeBasis = null;
    differentiation.percentile = null;
  }

  return {
    algorithmVersion,
    resultSchemaVersion: algorithmVersion === LEGACY_ALGORITHM_VERSION
      ? 'riasec-result-v1'
      : 'riasec-result-v2',
    scale: { minimum: 1, maximum: 5 },
    scores,
    ranking: {
      ordered: ranking.ordered,
      tieGroups: ranking.groups,
      leadingGroups: ranking.leadingGroups,
      primaryCode: ranking.primaryCode,
      displayCode: ranking.displayCode,
      codeStatus: ranking.codeStatus,
      hasLeadingTie: ranking.hasLeadingTie,
    },
    differentiation,
    responsePattern: describeResponsePattern(responseValues),
  };
};

module.exports = {
  ALGORITHM_VERSION,
  LEGACY_ALGORITHM_VERSION,
  SUPPORTED_ALGORITHM_VERSIONS,
  DIMENSIONS,
  RiasecValidationError,
  buildRanking,
  scoreRiasec,
};
