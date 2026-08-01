const AUTH_RETURN_KEY = 'makoki.auth.returnTo.v1';
const AUTH_RETURN_TTL_MS = 24 * 60 * 60 * 1000;

interface StoredAuthReturn {
  path: string;
  expiresAt: number;
}

export const normalizeAuthReturnPath = (value?: string | null) => {
  const candidate = String(value || '').trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return undefined;
  }
  if (candidate === '/login' || candidate === '/register') return undefined;
  return candidate;
};

export const saveAuthReturnPath = (value?: string | null) => {
  const path = normalizeAuthReturnPath(value);
  if (!path || typeof window === 'undefined') return;
  try {
    const payload: StoredAuthReturn = {
      path,
      expiresAt: Date.now() + AUTH_RETURN_TTL_MS,
    };
    localStorage.setItem(AUTH_RETURN_KEY, JSON.stringify(payload));
  } catch {
    // La redirection de confort ne doit jamais bloquer l’authentification.
  }
};

export const readAuthReturnPath = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(AUTH_RETURN_KEY);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as Partial<StoredAuthReturn>;
    const path = normalizeAuthReturnPath(stored.path);
    if (!path || !Number.isFinite(stored.expiresAt) || Number(stored.expiresAt) <= Date.now()) {
      localStorage.removeItem(AUTH_RETURN_KEY);
      return undefined;
    }
    return path;
  } catch {
    localStorage.removeItem(AUTH_RETURN_KEY);
    return undefined;
  }
};

export const clearAuthReturnPath = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_RETURN_KEY);
  } catch {
    // La session authentifiée reste valide même si le stockage local est indisponible.
  }
};

export { AUTH_RETURN_KEY, AUTH_RETURN_TTL_MS };