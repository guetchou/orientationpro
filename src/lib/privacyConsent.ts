export type ConsentCategory = 'analytics' | 'marketing' | 'support';

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  support: boolean;
  updatedAt: string;
  expiresAt: string;
}

const STORAGE_KEY = 'makoki_consent_v1';
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;
export const CONSENT_CHANGED_EVENT = 'makoki:consent-changed';
export const CONSENT_OPEN_EVENT = 'makoki:open-consent';

const isBrowser = () => typeof window !== 'undefined';

const isValidPreferences = (value: unknown): value is ConsentPreferences => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ConsentPreferences>;
  return candidate.necessary === true
    && typeof candidate.analytics === 'boolean'
    && typeof candidate.marketing === 'boolean'
    && typeof candidate.support === 'boolean'
    && typeof candidate.updatedAt === 'string'
    && typeof candidate.expiresAt === 'string';
};

export const readConsent = (): ConsentPreferences | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidPreferences(parsed)) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveConsent = (preferences: Pick<ConsentPreferences, 'analytics' | 'marketing' | 'support'>) => {
  if (!isBrowser()) return;
  const now = new Date();
  const value: ConsentPreferences = {
    necessary: true,
    ...preferences,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CONSENT_DURATION_MS).toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value }));
};

export const isConsentGranted = (category: ConsentCategory) => Boolean(readConsent()?.[category]);

export const openConsentManager = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
};
