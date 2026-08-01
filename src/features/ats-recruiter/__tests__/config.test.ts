import { describe, expect, it } from 'vitest';
import { isAtsRecruiterFrontendEnabled } from '../config';

describe('isAtsRecruiterFrontendEnabled', () => {
  it('est désactivé par défaut (valeur absente)', () => {
    expect(isAtsRecruiterFrontendEnabled(undefined)).toBe(false);
  });

  it('est désactivé pour toute valeur autre que "true"', () => {
    expect(isAtsRecruiterFrontendEnabled('false')).toBe(false);
    expect(isAtsRecruiterFrontendEnabled('1')).toBe(false);
    expect(isAtsRecruiterFrontendEnabled('yes')).toBe(false);
    expect(isAtsRecruiterFrontendEnabled('')).toBe(false);
  });

  it('est activé pour "true", insensible à la casse et aux espaces', () => {
    expect(isAtsRecruiterFrontendEnabled('true')).toBe(true);
    expect(isAtsRecruiterFrontendEnabled('TRUE')).toBe(true);
    expect(isAtsRecruiterFrontendEnabled('  true  ')).toBe(true);
  });
});
