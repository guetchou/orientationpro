import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCareerMatches, getCareerOccupation, searchCareerOccupations } from './careerApi';
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

  it('requests French occupation details and matches', async () => {
    mockedApiFetch.mockResolvedValueOnce({ occupation: { id: 'onet:job' } });
    await getCareerOccupation('onet:job');
    expect(mockedApiFetch).toHaveBeenLastCalledWith(expect.stringContaining('locale=fr'));

    mockedApiFetch.mockResolvedValueOnce({ matching: { matches: [] } });
    await getCareerMatches('result-1');
    expect(mockedApiFetch).toHaveBeenLastCalledWith(expect.stringContaining('locale=fr'));
  });
});
