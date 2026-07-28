import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decideProfileHypothesis,
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
    localStorage.setItem('userToken', 'jwt-profile-test');
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

  it('charge le profil Auth V1 avec le bearer token', async () => {
    await getAdaptiveProfile();
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/profile');
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer jwt-profile-test');
  });

  it('enregistre chaque section sur son endpoint dédié', async () => {
    await saveProfileDetails({
      first_name: 'Maya',
      last_name: 'M.',
      phone: null,
      city: 'Brazzaville',
      country_code: 'CG',
      current_situation: 'student',
      primary_goal: 'choose_studies',
      mobility_scope: 'national',
      profile_summary: null,
    });
    await saveEducationHistory([]);
    await saveDeclaredSkills([]);
    await decideProfileHypothesis('hypothesis/1', 'confirmed');

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual(expect.arrayContaining([
      expect.stringContaining('/v1/profile'),
      expect.stringContaining('/v1/profile/education'),
      expect.stringContaining('/v1/profile/skills'),
      expect.stringContaining('/v1/profile/hypotheses/hypothesis%2F1'),
    ]));
  });

  it('encode la recherche ESCO et borne le nombre demandé', async () => {
    await searchEscoSkills('analyse de données', { locale: 'fr', limit: 8 });
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('q=analyse+de+donn%C3%A9es');
    expect(String(url)).toContain('locale=fr');
    expect(String(url)).toContain('limit=8');
  });
});
