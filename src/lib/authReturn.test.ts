import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_RETURN_KEY,
  AUTH_RETURN_TTL_MS,
  clearAuthReturnPath,
  normalizeAuthReturnPath,
  readAuthReturnPath,
  saveAuthReturnPath,
} from './authReturn';

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('auth return destination', () => {
  it('accepts only internal non-authentication paths', () => {
    expect(normalizeAuthReturnPath('/parcours?source=riasec')).toBe('/parcours?source=riasec');
    expect(normalizeAuthReturnPath('https://evil.example')).toBeUndefined();
    expect(normalizeAuthReturnPath('//evil.example')).toBeUndefined();
    expect(normalizeAuthReturnPath('/\\evil')).toBeUndefined();
    expect(normalizeAuthReturnPath('/login')).toBeUndefined();
  });

  it('persists a valid path across tabs and clears it explicitly', () => {
    saveAuthReturnPath('/parcours');
    expect(readAuthReturnPath()).toBe('/parcours');
    clearAuthReturnPath();
    expect(readAuthReturnPath()).toBeUndefined();
  });

  it('expires the return destination after the bounded retention period', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00.000Z'));
    saveAuthReturnPath('/parcours');
    vi.advanceTimersByTime(AUTH_RETURN_TTL_MS + 1);

    expect(readAuthReturnPath()).toBeUndefined();
    expect(localStorage.getItem(AUTH_RETURN_KEY)).toBeNull();
  });
});