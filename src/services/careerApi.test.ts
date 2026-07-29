import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCareerRecommendationSnapshot,
  getCareerMatches,
  getCareerOccupation,
  getCareerRecommendationSnapshot,
  getProfileCareerRecommendations,
  searchCareerOccupations,
} from './careerApi';
import { apiFetch } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({ apiFetch: vi.fn() }));
const mockedApiFetch = vi.mocked(apiFetch);

describe('careerApi French presentation defaults', () => {
  beforeEach(() => { mockedApiFetch.mockReset(); });

  it('searches French by default', async () => {
    mockedApiFetch.mockResolvedValue({ occupations: [] });
    await searchCareerOccupations({ query: 'infirmier' });
    expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('locale=fr'));
    expect(mockedApiFetch).toHaveBeenCalledWith(expect.stringContaining('q=infirmier'));
  });

  it('requests French occupation details and legacy RIASEC matches', async () => {
    mockedApiFetch.mockResolvedValueOnce({ occupation: { id: 'onet:job' } });
    await getCareerOccupation('onet:job');
    expect(mockedApiFetch).toHaveBeenLastCalledWith(expect.stringContaining('locale=fr'));

    mockedApiFetch.mockResolvedValueOnce({ matching: { matches: [] } });
    await getCareerMatches('result-1');
    expect(mockedApiFetch).toHaveBeenLastCalledWith(expect.stringContaining('locale=fr'));
  });

  it('uses the profile recommendation endpoint and bounds the result limit', async () => {
    mockedApiFetch.mockResolvedValueOnce({ recommendationContext: {}, matching: { matches: [] } });
    await getProfileCareerRecommendations('result/with spaces', {
      locale: 'fr',
      includeLocallyExcluded: false,
      limit: 500,
    });

    const [url] = mockedApiFetch.mock.calls.at(-1) || [];
    expect(url).toContain('/v1/career/recommendations/result%2Fwith%20spaces?');
    expect(url).toContain('locale=fr');
    expect(url).toContain('includeLocallyExcluded=false');
    expect(url).toContain('limit=100');
  });

  it('creates and reads immutable snapshots through authenticated API calls', async () => {
    mockedApiFetch.mockResolvedValueOnce({ snapshot: { id: 'snapshot-1' }, recommendation: {} });
    await createCareerRecommendationSnapshot('result-1', { locale: 'fr', limit: 50 });
    expect(mockedApiFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/v1/career/recommendations/result-1/snapshots?'),
      { method: 'POST' },
    );

    mockedApiFetch.mockResolvedValueOnce({ snapshot: { id: 'snapshot-1' }, recommendation: {} });
    await getCareerRecommendationSnapshot('snapshot/1');
    expect(mockedApiFetch).toHaveBeenLastCalledWith('/v1/career/recommendation-snapshots/snapshot%2F1');
  });
});
