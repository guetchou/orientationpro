import { describe, expect, it } from 'vitest';
import { isAtsCandidateFrontendEnabled } from '../config';

describe('isAtsCandidateFrontendEnabled', () => {
  it('est désactivé par défaut (valeur absente)', () => {
    expect(isAtsCandidateFrontendEnabled(undefined)).toBe(false);
  });

  it('est désactivé pour toute valeur autre que "true"', () => {
    expect(isAtsCandidateFrontendEnabled('false')).toBe(false);
    expect(isAtsCandidateFrontendEnabled('1')).toBe(false);
    expect(isAtsCandidateFrontendEnabled('yes')).toBe(false);
    expect(isAtsCandidateFrontendEnabled('')).toBe(false);
  });

  it('est activé pour "true", insensible à la casse et aux espaces', () => {
    expect(isAtsCandidateFrontendEnabled('true')).toBe(true);
    expect(isAtsCandidateFrontendEnabled('TRUE')).toBe(true);
    expect(isAtsCandidateFrontendEnabled('  true  ')).toBe(true);
  });
});
