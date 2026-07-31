import { describe, expect, it } from 'vitest';
import type { AdvisorRiasecProfile } from './advisor-types';
import { guestCareerFamilies } from './guest-career-families';

const profile: AdvisorRiasecProfile = {
  resultId: 'result-1',
  attemptId: 'attempt-1',
  instrumentId: 'riasec-makoki-fr-draft-v2',
  algorithmVersion: 'riasec-makoki-scoring-v2',
  primaryCode: 'SIA',
  displayCode: 'S-I-A',
  scores: {
    R: 20,
    I: 80,
    A: 70,
    S: 95,
    E: 40,
    C: 35,
  },
  ranking: ['S', 'I', 'A', 'E', 'C', 'R'],
  completedAt: '2026-07-31T20:00:00.000Z',
};

describe('guestCareerFamilies', () => {
  it('returns the three dominant dimensions in ranking order', () => {
    const result = guestCareerFamilies(profile);

    expect(result.map((entry) => entry.dimension)).toEqual(['S', 'I', 'A']);
    expect(result[0].title).toMatch(/Aide/);
    expect(result.every((entry) => entry.searchQuery.length > 0)).toBe(true);
  });
});
