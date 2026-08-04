import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decideProfileHypothesis,
  generateProfileHypotheses,
  getAdaptiveProfile,
  saveDeclaredSkills,
  saveEducationHistory,
  saveProfileDetails,
  searchEscoSkills,
} from './profileApi';

const successfulResponse = (payload: unknown) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(payload),
});

describe('profileApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(successfulResponse({
      profile: null,
      education: [],
      skills: [],
      hypotheses: [],
    })));
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('charge le profil Auth V1 avec la session HttpOnly', async () => {
    await getAdaptiveProfile();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/profile');
    expect(new Headers(init.headers).get('Authorization')).toBeNull();
    expect(init.credentials).toBe('include');
  });

  it('enregistre les sections, génère et décide les hypothèses', async () => {
    await saveProfileDetails({
      first_name: 'Maya', last_name: 'M.', phone: null, city: 'Brazzaville', country_code: 'CG',
      current_situation: 'student', primary_goal: 'choose_studies', mobility_scope: 'national', profile_summary: null,
    });
    await saveEducationHistory([]);
    await saveDeclaredSkills([]);
    await generateProfileHypotheses();
    await decideProfileHypothesis('hypothesis/1', 'confirmed');

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toEqual(expect.arrayContaining([
      expect.stringContaining('/v1/profile/education'),
      expect.stringContaining('/v1/profile/skills'),
      expect.stringContaining('/v1/profile/hypotheses/generate'),
      expect.stringContaining('/v1/profile/hypotheses/hypothesis%2F1'),
    ]));
    expect(fetchMock.mock.calls[3][1]?.method).toBe('POST');
  });

  it('encode la recherche ESCO', async () => {
    await searchEscoSkills('analyse de données', { locale: 'fr', limit: 8 });
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('q=analyse+de+donn%C3%A9es');
    expect(String(url)).toContain('locale=fr');
    expect(String(url)).toContain('limit=8');
  });
});
