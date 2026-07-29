'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PROFILE_RECOMMENDATION_ALGORITHM_VERSION,
  educationReadiness,
  profileRecommendationContext,
  rankProfileRecommendations,
  skillEvidence,
} = require('../src/career/profile-matching');

const baseMatch = (id, label, fitScore) => ({
  occupationId: id,
  sourceCode: id,
  preferredLabel: label,
  fitScore,
  algorithmVersion: 'career-riasec-cosine-rank-v1',
  userCode: 'SIC',
  occupationCode: 'SIC',
  components: { cosineSimilarity: fitScore / 100, rankAgreement: 1, cosineWeight: 0.8, rankWeight: 0.2 },
  differentiation: { user: 60, occupation: 55 },
});

const occupation = (id, presentationOccupationId, jobZone = 3, onetVersion = '30.3') => ({
  id,
  presentationOccupationId,
  jobZone,
  localRelevanceStatus: 'unreviewed',
  riasecSource: { id: `onet:${onetVersion}`, kind: 'onet', version: onetVersion },
});

test('skill evidence is deterministic, deduplicated and bounded', () => {
  const evidence = skillEvidence({
    confirmedSkillCount: 2,
    matchedSkills: [
      { escoUri: 'esco:skill:1', label: 'Analyser des données', proficiency: 'expert', relationKind: 'essential' },
      { escoUri: 'esco:skill:1', label: 'Analyser des données', proficiency: 'beginner', relationKind: 'optional' },
      { escoUri: 'esco:skill:2', label: 'Communiquer', proficiency: 'advanced', relationKind: 'important' },
    ],
  });
  assert.equal(evidence.available, true);
  assert.equal(evidence.matchedSkillCount, 2);
  assert.ok(evidence.score > 50 && evidence.score <= 100);
  assert.equal(evidence.matchedSkills[0].escoUri, 'esco:skill:1');
});

test('education readiness selects the preparation framework from the O*NET version', () => {
  const ready = educationReadiness({
    education: [{ education_level: 'licence', status: 'completed' }],
    jobZone: 4,
    onetSourceVersion: '30.3',
  });
  assert.equal(ready.score, 100);
  assert.equal(ready.status, 'meets_reference');
  assert.equal(ready.frameworkKind, 'four_level');

  const historical = educationReadiness({
    education: [{ education_level: 'high_school', status: 'completed' }],
    jobZone: 1,
    onetSourceVersion: '30.1',
  });
  assert.equal(historical.status, 'meets_reference');
  assert.equal(historical.frameworkKind, 'five_level');

  const invalidModernZone = educationReadiness({
    education: [{ education_level: 'master', status: 'completed' }],
    jobZone: 1,
    onetSourceVersion: '30.3',
  });
  assert.equal(invalidModernZone.score, 50);
  assert.equal(invalidModernZone.status, 'unsupported_job_zone');

  const unknownVersion = educationReadiness({
    education: [{ education_level: 'master', status: 'completed' }],
    jobZone: 4,
    onetSourceVersion: 'fixture',
  });
  assert.equal(unknownVersion.score, 50);
  assert.equal(unknownVersion.status, 'unknown_onet_version');
});

test('confirmed ESCO evidence can reorder otherwise close RIASEC matches', () => {
  const occupationsById = new Map([
    ['occupation-a', occupation('occupation-a', 'esco-occupation-a', 4)],
    ['occupation-b', occupation('occupation-b', 'esco-occupation-b', 4)],
  ]);
  const skillLinksByOccupation = new Map([
    ['esco-occupation-b', [
      { escoUri: 'esco:skill:analysis', label: 'Analyser des données', proficiency: 'expert', relationKind: 'essential' },
      { escoUri: 'esco:skill:communication', label: 'Communiquer', proficiency: 'advanced', relationKind: 'important' },
      { escoUri: 'esco:skill:planning', label: 'Planifier', proficiency: 'advanced', relationKind: 'essential' },
    ]],
  ]);
  const recommendations = rankProfileRecommendations({
    baseMatches: [baseMatch('occupation-a', 'Métier A', 92), baseMatch('occupation-b', 'Métier B', 88)],
    occupationsById,
    profile: { primary_goal: 'find_job', mobility_scope: 'international' },
    education: [{ education_level: 'licence', status: 'completed' }],
    confirmedSkills: [{ esco_uri: 'esco:skill:analysis' }, { esco_uri: 'esco:skill:communication' }, { esco_uri: 'esco:skill:planning' }],
    skillLinksByOccupation,
    limit: 2,
  });
  assert.equal(recommendations[0].occupationId, 'occupation-b');
  assert.equal(recommendations[0].recommendationAlgorithmVersion, PROFILE_RECOMMENDATION_ALGORITHM_VERSION);
  assert.equal(recommendations[0].profileComponents.appliedWeights.skills, 0.3);
  assert.equal(recommendations[0].profileComponents.education.frameworkKind, 'four_level');
  assert.ok(recommendations[0].explanations.some((item) => item.code === 'ESCO_SKILL_EVIDENCE'));
  assert.ok(recommendations[0].cautions.every((message) => !message.includes('Congo')));
});

test('missing profile signals are omitted rather than converted into zero scores', () => {
  const recommendations = rankProfileRecommendations({
    baseMatches: [baseMatch('occupation-a', 'Métier A', 91)],
    occupationsById: new Map([['occupation-a', occupation('occupation-a', 'esco-a', 3)]]),
    profile: null,
    education: [],
    confirmedSkills: [],
    skillLinksByOccupation: new Map(),
    limit: 1,
  });
  assert.equal(recommendations[0].recommendationScore, 91);
  assert.deepEqual(recommendations[0].profileComponents.appliedWeights, { riasec: 1, skills: 0, education: 0 });

  const context = profileRecommendationContext({
    profile: null,
    education: [],
    confirmedSkills: [],
    versioning: {
      profileFingerprint: 'a'.repeat(64),
      inputFingerprint: 'b'.repeat(64),
      catalogSources: [],
    },
  });
  assert.deepEqual(context.usedSignals, ['riasec']);
  assert.ok(context.missingSignals.includes('profile'));
  assert.ok(context.missingSignals.includes('confirmed_esco_skills'));
  assert.equal(context.profileFingerprint, 'a'.repeat(64));
  assert.ok(context.limitations.some((message) => message.includes('catalogue national')));
});
