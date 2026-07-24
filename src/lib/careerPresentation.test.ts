import { describe, expect, it } from 'vitest';
import {
  careerFitBand,
  dominantDimensions,
  percentFromRatio,
} from '@/lib/careerPresentation';

describe('career presentation', () => {
  it('uses explicit score bands without overstating certainty', () => {
    expect(careerFitBand(94).label).toBe('Très forte proximité');
    expect(careerFitBand(82).label).toBe('Forte proximité');
    expect(careerFitBand(68).label).toBe('Proximité à explorer');
    expect(careerFitBand(42).label).toBe('Piste secondaire');
  });

  it('converts matching ratios into bounded percentages', () => {
    expect(percentFromRatio(0.873)).toBe(87);
    expect(percentFromRatio(-1)).toBe(0);
    expect(percentFromRatio(2)).toBe(100);
  });

  it('orders dominant RIASEC dimensions deterministically', () => {
    expect(dominantDimensions({ R: 90, I: 90, A: 90, S: 30, E: 20, C: 10 }))
      .toEqual([
        { dimension: 'A', score: 90 },
        { dimension: 'I', score: 90 },
        { dimension: 'R', score: 90 },
      ]);
  });
});
