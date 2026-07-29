import { describe, expect, it } from 'vitest';
import { isLifeProjectFrontendEnabled } from './config';

describe('feature flag frontend du Parcours MAKOKI', () => {
  it('reste désactivé par défaut', () => {
    expect(isLifeProjectFrontendEnabled(undefined)).toBe(false);
  });

  it('ne s’active que par une valeur true explicite', () => {
    expect(isLifeProjectFrontendEnabled('false')).toBe(false);
    expect(isLifeProjectFrontendEnabled('1')).toBe(false);
    expect(isLifeProjectFrontendEnabled(' true ')).toBe(true);
  });
});
