'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SYNTHESIS_ENGINE_VERSION,
  SYNTHESIS_SCHEMA_VERSION,
  buildProfileSynthesis,
} = require('../src/profile/synthesis-builder');

const input = () => ({
  profile: {
    first_name: 'Maya', last_name: 'Test', phone: '+33 000000000', city: 'Paris',
    country_code: 'FR', current_situation: 'job_seeker', primary_goal: 'find_job',
    mobility_scope: 'international', profile_summary: 'Profil de test.', completion_percent: 100,
    updated_at: '2026-07-29T00:00:00.000Z',
  },
  education: [{
    education_level: 'licence', status: 'completed', diploma_name: 'Licence',
    field_of_study: 'Informatique', institution: 'Université', country_code: 'FR',
    start_year: 2021, end_year: 2024, updated_at: '2026-07-29T00:00:00.000Z',
  }],
  skills: [{
    label: 'analyser des données', esco_uri: 'http://data.europa.eu/esco/skill/test',
    proficiency: 'advanced', source: 'declared', evidence: null,
    updated_at: '2026-07-29T00:00:00.000Z',
  }],
  hypotheses: [{
    id: '11111111-1111-4111-8111-111111111111', hypothesis_type: 'goal_clarification',
    value_json: { title: 'Objectif confirmé' }, rationale: 'Test', confidence: 0.8,
    status: 'confirmed', updated_at: '2026-07-29T00:00:00.000Z',
  }, {
    id: '22222222-2222-4222-8222-222222222222', hypothesis_type: 'mobility',
    value_json: { title: 'Hypothèse non décidée' }, rationale: 'Test', confidence: 0.7,
    status: 'proposed', updated_at: '2026-07-29T00:00:00.000Z',
  }],
  orientationResult: {
    id: '33333333-3333-4333-8333-333333333333', instrument_id: 'riasec-makoki-fr-draft-v2',
    algorithm_version: 'riasec-makoki-scoring-v2', primary_code: null, display_code: 'S/E-I',
    scores_json: { S: { normalized: 80 }, E: { normalized: 80 } },
    ranking_json: { codeStatus: 'tied', tieGroups: [{ score: 80, dimensions: ['S', 'E'] }] },
    differentiation_json: { kind: 'descriptive', range: 30, percentile: null },
    created_at: '2026-07-29T00:00:00.000Z',
  },
  recommendationSnapshot: {
    id: '44444444-4444-4444-8444-444444444444', input_fingerprint: 'a'.repeat(64),
    profile_fingerprint: 'b'.repeat(64), recommendation_algorithm_version: 'career-profile-context-v2',
    riasec_algorithm_version: 'riasec-makoki-scoring-v2',
    preparation_adapter_version: 'onet-job-zone-adapter-v1', requested_locale: 'fr',
    onet_sources_json: [{ version: '30.3' }], esco_sources_json: [{ version: '1.2.1' }],
    created_at: '2026-07-29T00:00:00.000Z',
    snapshot_json: { matching: { matches: [{
      occupationId: 'occupation-1', preferredLabel: 'Analyste de données', recommendationScore: 88,
      fitScore: 84, profileComponents: { skills: { matchedSkills: [{ label: 'analyser des données' }] } },
      explanations: [{ message: 'Signal de test.' }],
    }] } },
  },
});

test('profile synthesis is deterministic, versioned and excludes phone and undecided hypotheses', () => {
  const first = buildProfileSynthesis(input());
  const second = buildProfileSynthesis(input());
  assert.equal(first.inputFingerprint, second.inputFingerprint);
  assert.deepEqual(first.snapshot, second.snapshot);
  assert.equal(first.snapshot.schemaVersion, SYNTHESIS_SCHEMA_VERSION);
  assert.equal(first.snapshot.engineVersion, SYNTHESIS_ENGINE_VERSION);
  assert.equal(first.snapshot.sources.profile.phone, undefined);
  assert.equal(first.snapshot.sources.decidedHypotheses.length, 1);
  assert.equal(first.snapshot.sources.orientation.ranking.codeStatus, 'tied');
  assert.equal(first.snapshot.summary.keySignals.riasecPrimaryCode, null);
  assert.equal(first.snapshot.summary.keySignals.riasecDisplayCode, 'S/E-I');
  assert.equal(first.snapshot.sources.recommendations.topMatches[0].preferredLabel, 'Analyste de données');
});

test('changing a confirmed source changes the fingerprint', () => {
  const first = input();
  const second = input();
  second.skills[0].proficiency = 'expert';
  assert.notEqual(buildProfileSynthesis(first).inputFingerprint, buildProfileSynthesis(second).inputFingerprint);
});
