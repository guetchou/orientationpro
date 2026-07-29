'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { buildRecommendationInputVersion } = require('../src/career/profile-version');

const baseInput = () => ({
  recommendationAlgorithmVersion: 'career-profile-context-v2',
  result: {
    id: 'result-1',
    algorithmVersion: 'riasec-v1',
    displayCode: 'SIC',
    normalizedScores: { R: 10, I: 60, A: 30, S: 90, E: 20, C: 50 },
    createdAt: '2026-07-29T00:00:00.000Z',
  },
  profile: {
    current_situation: 'job_seeker',
    primary_goal: 'find_job',
    mobility_scope: 'international',
    completion_percent: 100,
  },
  education: [{ education_level: 'licence', status: 'completed', end_year: 2025 }],
  confirmedSkills: [{ label: 'Analyser des données', esco_uri: 'esco:skill:1', proficiency: 'advanced', source: 'declared' }],
  catalogSources: [
    { id: 'onet:30.3:en', kind: 'onet', version: '30.3', locale: 'en', contentSha256: 'a'.repeat(64) },
    { id: 'esco:1.2.1:fr', kind: 'esco', version: '1.2.1', locale: 'fr', contentSha256: 'b'.repeat(64) },
  ],
  locale: 'fr',
  limit: 20,
});

test('semantic input ordering does not change recommendation fingerprints', () => {
  const left = baseInput();
  const right = baseInput();
  right.catalogSources.reverse();
  right.education = [...right.education].reverse();
  const leftVersion = buildRecommendationInputVersion(left);
  const rightVersion = buildRecommendationInputVersion(right);
  assert.equal(leftVersion.fingerprint, rightVersion.fingerprint);
  assert.equal(leftVersion.profileFingerprint, rightVersion.profileFingerprint);
});

test('profile and catalog changes produce distinct fingerprints', () => {
  const baseline = buildRecommendationInputVersion(baseInput());
  const changedProfile = baseInput();
  changedProfile.profile.primary_goal = 'career_change';
  const changedCatalog = baseInput();
  changedCatalog.catalogSources[0].version = '30.4';
  assert.notEqual(buildRecommendationInputVersion(changedProfile).fingerprint, baseline.fingerprint);
  assert.notEqual(buildRecommendationInputVersion(changedProfile).profileFingerprint, baseline.profileFingerprint);
  assert.notEqual(buildRecommendationInputVersion(changedCatalog).fingerprint, baseline.fingerprint);
  assert.equal(buildRecommendationInputVersion(changedCatalog).profileFingerprint, baseline.profileFingerprint);
});
