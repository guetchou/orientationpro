'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { rowToOccupation, validLocale } = require('../src/career/store');
const base = { id: 'onet:job', source_code: '29-1141.00', locale: 'en', preferred_label: 'Registered Nurses', description: 'Assess patients.', status: 'active', isco_code: null, job_zone: 4, riasec_r: 20, riasec_i: 70, riasec_a: 30, riasec_s: 90, riasec_e: 35, riasec_c: 45, riasec_display_code: 'SIC', riasec_profile_status: 'direct', riasec_provenance_json: '{}', local_relevance_status: 'unreviewed', local_relevance_notes: null, metadata_json: '{}', riasec_source_id: 'onet:30.3:en', riasec_source_kind: 'onet', riasec_source_version: '30.3', riasec_source_title: 'O*NET', riasec_license_name: 'CC BY 4.0', riasec_license_url: 'https://example.test', riasec_attribution_text: 'O*NET' };
test('composes ESCO French presentation with O*NET RIASEC', () => {
  const value = rowToOccupation({ ...base, presentation_occupation_id: 'esco:nurse', presentation_locale: 'fr', presentation_preferred_label: 'infirmier/infirmière', presentation_description: 'Dispense des soins.', presentation_isco_code: '2221', presentation_source_id: 'esco:1.2.1:fr', presentation_source_kind: 'esco', presentation_source_version: '1.2.1', presentation_source_title: 'ESCO', presentation_license_name: 'CC BY 4.0', presentation_license_url: 'https://example.test', presentation_attribution_text: 'ESCO', crosswalk_mapping_kind: 'close', crosswalk_confidence_score: null, crosswalk_confidence_level: 'medium', crosswalk_review_status: 'official', crosswalk_source_reference: 'official.csv', crosswalk_source_version: '2023-08', crosswalk_mapped_at: '2026-07-28', crosswalk_provenance_json: '{}' }, 'fr');
  assert.equal(value.id, 'onet:job');
  assert.equal(value.preferredLabel, 'infirmier/infirmière');
  assert.equal(value.translationStatus, 'available');
  assert.equal(value.riasec.S, 90);
  assert.equal(value.riasecSource.kind, 'onet');
  assert.equal(value.presentationSource.kind, 'esco');
  assert.equal(value.crosswalk.reviewStatus, 'official');
});
test('explicitly falls back to English', () => {
  const value = rowToOccupation(base, 'fr');
  assert.equal(value.locale, 'en');
  assert.equal(value.fallbackLocale, 'en');
  assert.equal(value.translationStatus, 'unavailable');
});
test('malformed locale uses French default', () => assert.equal(validLocale('bad locale'), 'fr'));
