import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { describeAtsError } from '../errors';

describe('describeAtsError', () => {
  it('401 => session expirée', () => {
    expect(describeAtsError(new ApiError('x', 401)).kind).toBe('unauthenticated');
  });

  it('403 => accès refusé, message générique sans détail', () => {
    const view = describeAtsError(new ApiError('x', 403, 'ATS_RESOURCE_FORBIDDEN'));
    expect(view.kind).toBe('forbidden');
    expect(view.message).not.toMatch(/autre candidat|appartient à|un autre/i);
  });

  it("404 => introuvable, message générique sans détail", () => {
    const view = describeAtsError(new ApiError('x', 404, 'ATS_JOB_NOT_FOUND'));
    expect(view.kind).toBe('not_found');
    expect(view.message).not.toMatch(/autre candidat|appartient à|un autre/i);
  });

  it('409 ATS_APPLICATION_ALREADY_EXISTS => doublon', () => {
    const view = describeAtsError(new ApiError('x', 409, 'ATS_APPLICATION_ALREADY_EXISTS'));
    expect(view.kind).toBe('conflict_duplicate');
  });

  it('409 ATS_JOB_NOT_PUBLISHED => offre fermée', () => {
    const view = describeAtsError(new ApiError('x', 409, 'ATS_JOB_NOT_PUBLISHED'));
    expect(view.kind).toBe('conflict_job_closed');
  });

  it('409 générique (conflit de version) => rechargement demandé', () => {
    const view = describeAtsError(new ApiError('x', 409, 'ATS_VERSION_CONFLICT'));
    expect(view.kind).toBe('conflict_version');
  });

  it('400/428 => validation', () => {
    expect(describeAtsError(new ApiError('x', 400)).kind).toBe('validation');
    expect(describeAtsError(new ApiError('x', 428)).kind).toBe('validation');
  });

  it('autre statut => service indisponible', () => {
    expect(describeAtsError(new ApiError('x', 500)).kind).toBe('service_unavailable');
  });

  it('erreur réseau (TypeError) => network', () => {
    expect(describeAtsError(new TypeError('Failed to fetch')).kind).toBe('network');
  });

  it('erreur non reconnue => unknown', () => {
    expect(describeAtsError('boom').kind).toBe('unknown');
  });
});
