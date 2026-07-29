'use strict';

const crypto = require('node:crypto');

const scalar = (value) => {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
};

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return scalar(value);
};

const canonicalStringify = (value) => JSON.stringify(canonicalize(value));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const normalizeCatalogSources = (sources = []) => [...new Map(
  (Array.isArray(sources) ? sources : [])
    .filter((source) => source?.id)
    .map((source) => [source.id, {
      id: source.id,
      kind: source.kind || null,
      version: source.version || null,
      locale: source.locale || null,
      contentSha256: source.contentSha256 || null,
      importedAt: scalar(source.importedAt),
    }]),
).values()].sort((left, right) => left.kind.localeCompare(right.kind)
  || String(left.version).localeCompare(String(right.version))
  || left.id.localeCompare(right.id));

const normalizeProfile = (profile) => profile ? {
  currentSituation: profile.current_situation ?? null,
  primaryGoal: profile.primary_goal ?? null,
  mobilityScope: profile.mobility_scope ?? null,
  completionPercent: Number(profile.completion_percent || 0),
} : null;

const normalizeEducation = (education = []) => (Array.isArray(education) ? education : [])
  .map((entry) => ({
    educationLevel: entry.education_level ?? null,
    status: entry.status ?? null,
    diplomaName: entry.diploma_name ?? null,
    fieldOfStudy: entry.field_of_study ?? null,
    institution: entry.institution ?? null,
    countryCode: entry.country_code ?? null,
    startYear: entry.start_year === null || entry.start_year === undefined ? null : Number(entry.start_year),
    endYear: entry.end_year === null || entry.end_year === undefined ? null : Number(entry.end_year),
  }))
  .sort((left, right) => canonicalStringify(left).localeCompare(canonicalStringify(right)));

const normalizeSkills = (skills = []) => (Array.isArray(skills) ? skills : [])
  .map((skill) => ({
    escoUri: skill.esco_uri ?? null,
    label: skill.label ?? null,
    proficiency: skill.proficiency ?? null,
    source: skill.source ?? null,
  }))
  .sort((left, right) => canonicalStringify(left).localeCompare(canonicalStringify(right)));

const buildRecommendationInputVersion = ({
  recommendationAlgorithmVersion,
  result,
  profile,
  education,
  confirmedSkills,
  catalogSources,
  locale,
  includeLocallyExcluded = false,
  limit,
} = {}) => {
  const manifest = normalizeCatalogSources(catalogSources);
  const payload = {
    recommendationAlgorithmVersion: recommendationAlgorithmVersion || null,
    result: result ? {
      id: result.id,
      algorithmVersion: result.algorithmVersion,
      displayCode: result.displayCode,
      normalizedScores: result.normalizedScores,
      createdAt: scalar(result.createdAt),
    } : null,
    profile: normalizeProfile(profile),
    education: normalizeEducation(education),
    confirmedSkills: normalizeSkills(confirmedSkills),
    catalogSources: manifest,
    request: {
      locale: locale || 'fr',
      includeLocallyExcluded: includeLocallyExcluded === true,
      limit: Number(limit || 0),
    },
  };
  const canonicalPayload = canonicalStringify(payload);
  return {
    fingerprint: sha256(canonicalPayload),
    profileFingerprint: sha256(canonicalStringify({
      profile: payload.profile,
      education: payload.education,
      confirmedSkills: payload.confirmedSkills,
    })),
    catalogSources: manifest,
    canonicalPayload,
  };
};

module.exports = {
  buildRecommendationInputVersion,
  canonicalStringify,
  canonicalize,
  normalizeCatalogSources,
  sha256,
};
