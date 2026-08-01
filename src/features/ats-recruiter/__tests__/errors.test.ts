import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { describeAtsRecruiterError } from '../errors';

describe('describeAtsRecruiterError', () => {
  it('401 => session expirée', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 401)).kind).toBe('unauthenticated');
  });

  it('403 => accès refusé, message générique ne révélant jamais l\'organisation ni la raison', () => {
    const view = describeAtsRecruiterError(new ApiError('x', 403, 'ATS_JOB_RESOURCE_FORBIDDEN'));
    expect(view.kind).toBe('forbidden');
    expect(view.message).not.toMatch(/organisation|autre|appartient/i);
  });

  it('404 => introuvable, message générique', () => {
    const view = describeAtsRecruiterError(new ApiError('x', 404, 'ATS_JOB_NOT_FOUND'));
    expect(view.kind).toBe('not_found');
    expect(view.message).not.toMatch(/organisation|autre|appartient/i);
  });

  it('409 ATS_RECRUITER_ALREADY_ASSIGNED => doublon', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 409, 'ATS_RECRUITER_ALREADY_ASSIGNED')).kind)
      .toBe('conflict_duplicate_recruiter');
  });

  it('409 ATS_JOB_NOT_PUBLISHED => offre fermée', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 409, 'ATS_JOB_NOT_PUBLISHED')).kind)
      .toBe('conflict_job_closed');
  });

  it('409 ATS_TRANSITION_NOT_ALLOWED => transition impossible depuis l\'état actuel (pas un conflit de version)', () => {
    const view = describeAtsRecruiterError(new ApiError('x', 409, 'ATS_TRANSITION_NOT_ALLOWED'));
    expect(view.kind).toBe('conflict_transition_not_allowed');
  });

  it('400 ATS_TRANSITION_FORBIDDEN => rôle insuffisant pour cette transition', () => {
    const view = describeAtsRecruiterError(new ApiError('x', 400, 'ATS_TRANSITION_FORBIDDEN'));
    expect(view.kind).toBe('validation_transition_forbidden');
  });

  it('409 générique => conflit de version', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 409, 'ATS_VERSION_CONFLICT')).kind)
      .toBe('conflict_version');
  });

  it('400 ATS_TRANSITION_REASON_REQUIRED => motif requis', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_TRANSITION_REASON_REQUIRED')).kind)
      .toBe('validation_reason_required');
  });

  it('400 ATS_TRANSITION_REASON_CODE_REQUIRED => code de motif requis', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_TRANSITION_REASON_CODE_REQUIRED')).kind)
      .toBe('validation_reason_code_required');
  });

  it('400 ATS_TRANSITION_REASON_CODE_INVALID => code de motif invalide', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_TRANSITION_REASON_CODE_INVALID')).kind)
      .toBe('validation_reason_code_invalid');
  });

  it('400 ATS_EVALUATION_RECOMMENDATION_INVALID => recommandation invalide', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_EVALUATION_RECOMMENDATION_INVALID')).kind)
      .toBe('validation_evaluation_recommendation');
  });

  it('400 ATS_EVALUATION_RATING_INVALID => note invalide', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_EVALUATION_RATING_INVALID')).kind)
      .toBe('validation_evaluation_rating');
  });

  it('400 ATS_EVALUATION_NOTE_TOO_LONG => note interne trop longue', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_EVALUATION_NOTE_TOO_LONG')).kind)
      .toBe('validation_evaluation_note');
  });

  it('400 ATS_APPLICATION_FILTER_INVALID => filtre invalide', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400, 'ATS_APPLICATION_FILTER_INVALID')).kind)
      .toBe('validation_filter');
  });

  it('400 ATS_RECRUITER_NOT_IN_ORGANIZATION => message explicite (pas une fuite : l\'acteur gère déjà cette organisation)', () => {
    const view = describeAtsRecruiterError(new ApiError('x', 400, 'ATS_RECRUITER_NOT_IN_ORGANIZATION'));
    expect(view.kind).toBe('validation_recruiter_not_in_organization');
  });

  it('400/428 sans code connu => validation générique', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 400)).kind).toBe('validation');
    expect(describeAtsRecruiterError(new ApiError('x', 428)).kind).toBe('validation');
  });

  it('autre statut => service indisponible', () => {
    expect(describeAtsRecruiterError(new ApiError('x', 500)).kind).toBe('service_unavailable');
  });

  it('erreur réseau (TypeError) => network', () => {
    expect(describeAtsRecruiterError(new TypeError('Failed to fetch')).kind).toBe('network');
  });

  it('erreur non reconnue => unknown', () => {
    expect(describeAtsRecruiterError('boom').kind).toBe('unknown');
  });
});
