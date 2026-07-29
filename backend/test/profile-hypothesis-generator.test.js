'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateProfileHypotheses } = require('../src/profile/hypothesis-generator');

test('generator is deterministic and never confirms hypotheses', () => {
  const payload = {
    profile: { primary_goal: 'choose_studies', mobility_scope: 'unknown', completion_percent: 67, profile_summary: null },
    education: [],
    skills: [{ label: 'Analyser des données', esco_uri: 'esco:skill:1', proficiency: 'unknown', confirmation_status: 'confirmed' }],
  };
  const first = generateProfileHypotheses(payload);
  const second = generateProfileHypotheses(payload);
  assert.equal(first.profileFingerprint, second.profileFingerprint);
  assert.deepEqual(first.candidates, second.candidates);
  assert.ok(first.candidates.some((item) => item.hypothesisType === 'mobility_clarification'));
  assert.ok(first.candidates.some((item) => item.hypothesisType === 'education_context'));
  assert.ok(first.candidates.some((item) => item.hypothesisType === 'skill_proficiency'));
  assert.ok(first.candidates.every((item) => item.value.generator.version === 'profile-hypotheses-v1'));
});

test('semantic changes modify the profile fingerprint', () => {
  const base = { profile: { primary_goal: 'find_job', mobility_scope: 'national', completion_percent: 100 }, education: [], skills: [] };
  const first = generateProfileHypotheses(base);
  const second = generateProfileHypotheses({ ...base, profile: { ...base.profile, mobility_scope: 'international' } });
  assert.notEqual(first.profileFingerprint, second.profileFingerprint);
});
