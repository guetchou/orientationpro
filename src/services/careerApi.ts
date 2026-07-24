import { apiFetch } from '@/lib/apiClient';
import type {
  CareerCatalogSourceSummary,
  CareerMatchResponse,
  CareerOccupation,
} from '@/types/career';

export interface CareerSearchOptions {
  query?: string;
  locale?: string;
  riasecOnly?: boolean;
  includeLocallyExcluded?: boolean;
  limit?: number;
  offset?: number;
}

const boundedInteger = (value: number | undefined, fallback: number, minimum: number, maximum: number) => {
  if (!Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value as number, minimum), maximum);
};

export const getCareerCatalogSummary = async () => {
  const payload = await apiFetch<{ sources: CareerCatalogSourceSummary[] }>(
    '/v1/career/catalog/summary',
  );
  return payload.sources;
};

export const searchCareerOccupations = async (options: CareerSearchOptions = {}) => {
  const parameters = new URLSearchParams();
  const query = String(options.query || '').trim().slice(0, 120);

  if (query) parameters.set('q', query);
  parameters.set('locale', options.locale || 'en');
  parameters.set('riasecOnly', String(options.riasecOnly === true));
  parameters.set('includeLocallyExcluded', String(options.includeLocallyExcluded === true));
  parameters.set('limit', String(boundedInteger(options.limit, 20, 1, 100)));
  parameters.set('offset', String(boundedInteger(options.offset, 0, 0, 100_000)));

  const payload = await apiFetch<{ occupations: CareerOccupation[] }>(
    `/v1/career/occupations?${parameters.toString()}`,
  );
  return payload.occupations;
};

export const getCareerOccupation = async (occupationId: string) => {
  const payload = await apiFetch<{ occupation: CareerOccupation }>(
    `/v1/career/occupations/${encodeURIComponent(occupationId)}`,
  );
  return payload.occupation;
};

export const getCareerMatches = async (
  resultId: string,
  options: Pick<CareerSearchOptions, 'locale' | 'includeLocallyExcluded' | 'limit'> = {},
) => {
  const parameters = new URLSearchParams();
  parameters.set('locale', options.locale || 'en');
  parameters.set('includeLocallyExcluded', String(options.includeLocallyExcluded === true));
  parameters.set('limit', String(boundedInteger(options.limit, 20, 1, 100)));

  return apiFetch<CareerMatchResponse>(
    `/v1/career/matches/${encodeURIComponent(resultId)}?${parameters.toString()}`,
  );
};
