'use strict';

const PREPARATION_ADAPTER_VERSION = 'onet-job-zone-adapter-v1';

const HISTORICAL_FIVE_LEVEL = Object.freeze({
  id: 'onet-job-zone-five-level-through-30.1',
  kind: 'five_level',
  validZones: Object.freeze([1, 2, 3, 4, 5]),
  requiredRanks: Object.freeze({ 1: 2, 2: 3, 3: 5, 4: 6, 5: 7 }),
  labels: Object.freeze({
    1: 'Job Zone One',
    2: 'Job Zone Two',
    3: 'Job Zone Three',
    4: 'Job Zone Four',
    5: 'Job Zone Five',
  }),
});

const CURRENT_FOUR_LEVEL = Object.freeze({
  id: 'onet-job-zone-four-level-from-30.2',
  kind: 'four_level',
  validZones: Object.freeze([2, 3, 4, 5]),
  requiredRanks: Object.freeze({ 2: 3, 3: 5, 4: 6, 5: 7 }),
  labels: Object.freeze({
    2: 'Job Zone 1-2',
    3: 'Job Zone Three',
    4: 'Job Zone Four',
    5: 'Job Zone Five',
  }),
});

const parseOnetVersion = (value) => {
  const match = String(value || '').trim().match(/^(\d+)\.(\d+)(?:\.(\d+))?/u);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3] || 0),
    normalized: `${Number(match[1])}.${Number(match[2])}${match[3] ? `.${Number(match[3])}` : ''}`,
  };
};

const compareVersion = (left, right) => {
  for (const key of ['major', 'minor', 'patch']) {
    const difference = Number(left[key]) - Number(right[key]);
    if (difference !== 0) return difference;
  }
  return 0;
};

const frameworkForOnetVersion = (sourceVersion) => {
  const parsed = parseOnetVersion(sourceVersion);
  if (!parsed) {
    return {
      adapterVersion: PREPARATION_ADAPTER_VERSION,
      sourceVersion: sourceVersion || null,
      frameworkId: null,
      frameworkKind: 'unknown',
      validZones: [],
      reason: 'unknown_onet_version',
    };
  }
  const threshold = { major: 30, minor: 2, patch: 0 };
  const framework = compareVersion(parsed, threshold) >= 0
    ? CURRENT_FOUR_LEVEL
    : HISTORICAL_FIVE_LEVEL;
  return {
    adapterVersion: PREPARATION_ADAPTER_VERSION,
    sourceVersion: parsed.normalized,
    frameworkId: framework.id,
    frameworkKind: framework.kind,
    validZones: [...framework.validZones],
    reason: null,
  };
};

const resolvePreparationReference = ({ sourceVersion, jobZone } = {}) => {
  const frameworkInfo = frameworkForOnetVersion(sourceVersion);
  const normalizedZone = Number(jobZone);
  if (!frameworkInfo.frameworkId) {
    return {
      ...frameworkInfo,
      available: false,
      jobZone: Number.isInteger(normalizedZone) ? normalizedZone : null,
      zoneLabel: null,
      requiredRank: null,
    };
  }
  const framework = frameworkInfo.frameworkKind === 'four_level'
    ? CURRENT_FOUR_LEVEL
    : HISTORICAL_FIVE_LEVEL;
  if (!Number.isInteger(normalizedZone) || !framework.validZones.includes(normalizedZone)) {
    return {
      ...frameworkInfo,
      available: false,
      reason: 'unsupported_job_zone',
      jobZone: Number.isInteger(normalizedZone) ? normalizedZone : null,
      zoneLabel: null,
      requiredRank: null,
    };
  }
  return {
    ...frameworkInfo,
    available: true,
    jobZone: normalizedZone,
    zoneLabel: framework.labels[normalizedZone],
    requiredRank: framework.requiredRanks[normalizedZone],
  };
};

module.exports = {
  CURRENT_FOUR_LEVEL,
  HISTORICAL_FIVE_LEVEL,
  PREPARATION_ADAPTER_VERSION,
  frameworkForOnetVersion,
  parseOnetVersion,
  resolvePreparationReference,
};
