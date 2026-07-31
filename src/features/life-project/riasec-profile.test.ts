import { beforeEach, describe, expect, it } from 'vitest';
import type { RiasecResult } from '@/types/riasec';
import {
  RIASEC_PROFILE_STORAGE_KEY,
  persistRiasecResult,
  readPersistedRiasecProfile,
  topRiasecDimensions,
} from './riasec-profile';

const result: RiasecResult = {
  id: 'result-1',
  attemptId: 'attempt-1',
  accountId: 'account-1',
  instrumentId: 'instrument-1',
  resultType: 'riasec',
  algorithmVersion: 'riasec-scoring-v2',
  primaryCode: 'ISE',
  displayCode: 'I-S-E',
  scores: {
    R: { raw: 20, minimum: 10, maximum: 50, itemCount: 10, normalized: 25 },
    I: { raw: 46, minimum: 10, maximum: 50, itemCount: 10, normalized: 90 },
    A: { raw: 28, minimum: 10, maximum: 50, itemCount: 10, normalized: 45 },
    S: { raw: 42, minimum: 10, maximum: 50, itemCount: 10, normalized: 80 },
    E: { raw: 38, minimum: 10, maximum: 50, itemCount: 10, normalized: 70 },
    C: { raw: 24, minimum: 10, maximum: 50, itemCount: 10, normalized: 35 },
  },
  ranking: {
    ordered: [
      { dimension: 'I', score: 90 },
      { dimension: 'S', score: 80 },
      { dimension: 'E', score: 70 },
      { dimension: 'A', score: 45 },
      { dimension: 'C', score: 35 },
      { dimension: 'R', score: 25 },
    ],
    tieGroups: [],
    primaryCode: 'ISE',
    displayCode: 'I-S-E',
    hasLeadingTie: false,
  },
  differentiation: { range: 65, standardDeviation: 24 },
  responsePattern: { completionRate: 1, sameAnswerRatio: 0.2, responseStandardDeviation: 1.1 },
  snapshot: {
    resultType: 'riasec',
    instrument: {
      id: 'instrument-1',
      slug: 'makoki-riasec',
      version: 1,
      locale: 'fr-CG',
      title: 'Profil d’intérêts RIASEC',
      responseScale: [{ value: 1, label: 'Pas du tout' }],
      methodology: 'Score descriptif par dimension.',
      disclaimer: 'Le résultat ne mesure pas une aptitude.',
      contentHash: 'hash',
    },
    dimensions: {
      R: { code: 'R', name: 'Réaliste', summary: 'Activités concrètes.' },
      I: { code: 'I', name: 'Investigateur', summary: 'Analyse et recherche.' },
      A: { code: 'A', name: 'Artistique', summary: 'Création.' },
      S: { code: 'S', name: 'Social', summary: 'Aide et transmission.' },
      E: { code: 'E', name: 'Entreprenant', summary: 'Initiative.' },
      C: { code: 'C', name: 'Conventionnel', summary: 'Organisation.' },
    },
    generatedAt: '2026-07-31T18:00:00.000Z',
  },
  createdAt: '2026-07-31T18:00:00.000Z',
};

describe('life-project RIASEC profile', () => {
  beforeEach(() => localStorage.clear());

  it('normalizes and persists the completed RIASEC result for the unified journey', () => {
    const profile = persistRiasecResult(result);
    const restored = readPersistedRiasecProfile();

    expect(profile.resultId).toBe('result-1');
    expect(profile.displayCode).toBe('I-S-E');
    expect(profile.scores.I).toBe(90);
    expect(restored).toEqual(profile);
    expect(localStorage.getItem(RIASEC_PROFILE_STORAGE_KEY)).toContain('result-1');
  });

  it('returns the three dominant dimensions in report order', () => {
    const leading = topRiasecDimensions(persistRiasecResult(result));

    expect(leading.map((entry) => entry.dimension)).toEqual(['I', 'S', 'E']);
    expect(leading.map((entry) => entry.label)).toEqual([
      'Investigateur',
      'Social',
      'Entreprenant',
    ]);
  });

  it('rejects malformed local data instead of inventing a profile', () => {
    localStorage.setItem(RIASEC_PROFILE_STORAGE_KEY, JSON.stringify({ resultId: 'partial' }));

    expect(readPersistedRiasecProfile()).toBeNull();
  });
});
