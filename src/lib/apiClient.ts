const API_ROOT = String(import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export const oauthStartUrl = (provider: 'google' | 'meta') =>
  `${API_ROOT}/v1/auth/oauth/${provider}/start`;

const ACCESS_TOKEN_KEY = 'userToken';
const ACCOUNT_KEY = 'userData';
const AUTH_EVENT = 'orientationpro:auth-changed';
const SESSION_HINT_KEY = 'makoki.session';

export interface AuthAccount {
  id: string;
  email: string;
  status: string;
  roles: string[];
}

export interface AuthSessionPayload {
  accessToken: string;
  expiresIn: number;
  account: AuthAccount;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const notifyAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

export const primaryRole = (account: AuthAccount) => {
  const roles = Array.isArray(account.roles) ? account.roles : [];
  return roles.includes('super_admin')
    ? 'super_admin'
    : roles.includes('admin')
      ? 'admin'
      : roles[0] || 'user';
};

export const storedUserFromAccount = (account: AuthAccount) => ({
  id: account.id,
  email: account.email,
  status: account.status,
  roles: account.roles,
  role: primaryRole(account),
  full_name: account.email.split('@')[0],
  is_super_admin: account.roles?.includes('super_admin') || false,
  is_master_admin: account.roles?.includes('master_admin') || false,
});

export const persistAuthSession = (payload: AuthSessionPayload) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(storedUserFromAccount(payload.account)));
  localStorage.setItem('userRole', primaryRole(payload.account));
  localStorage.setItem(SESSION_HINT_KEY, '1');
  notifyAuthChanged();
};

export const clearAuthSession = () => {
  [
    ACCESS_TOKEN_KEY,
    ACCOUNT_KEY,
    'userRole',
    'adminToken',
    'adminUser',
    'authToken',
    SESSION_HINT_KEY,
  ].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  notifyAuthChanged();
};

export const getStoredAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const hasSessionHint = () => localStorage.getItem(SESSION_HINT_KEY) === '1';

export const getStoredUserData = () => {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    clearAuthSession();
    return null;
  }
};

const parseResponse = async (response: Response) => {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const request = async <T>(url: string, init: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
  });
  const payload = await parseResponse(response);
  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      error?.message || payload?.message || `Requête refusée (${response.status}).`,
      response.status,
      error?.code,
      error?.details,
    );
  }
  return payload as T;
};

export const refreshAuthSession = async (): Promise<AuthSessionPayload | null> => {
  try {
    const payload = await request<AuthSessionPayload>(`${API_ROOT}/v1/auth/refresh`, {
      method: 'POST',
    });
    persistAuthSession(payload);
    return payload;
  } catch (error) {
    clearAuthSession();
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

interface ApiFetchOptions {
  auth?: boolean;
  retryAfterRefresh?: boolean;
}

export const apiFetch = async <T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<T> => {
  const auth = options.auth !== false;
  const retryAfterRefresh = options.retryAfterRefresh !== false;
  const headers = new Headers(init.headers || {});

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    return await request<T>(`${API_ROOT}${path}`, { ...init, headers });
  } catch (error) {
    if (
      auth
      && retryAfterRefresh
      && error instanceof ApiError
      && error.status === 401
    ) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return apiFetch<T>(path, init, { auth, retryAfterRefresh: false });
      }
    }
    throw error;
  }
};

/**
 * Envoi multipart authentifie (upload de fichier). Contrairement a apiFetch,
 * on ne fixe jamais Content-Type : le navigateur pose lui-meme la frontiere
 * multipart. Meme logique de rafraichissement de session sur 401.
 */
export const apiUpload = async <T>(
  path: string,
  formData: FormData,
  options: { retryAfterRefresh?: boolean } = {},
): Promise<T> => {
  const retryAfterRefresh = options.retryAfterRefresh !== false;
  const headers = new Headers();
  const token = getStoredAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    return await request<T>(`${API_ROOT}${path}`, {
      method: 'POST',
      body: formData,
      headers,
    });
  } catch (error) {
    if (retryAfterRefresh && error instanceof ApiError && error.status === 401) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return apiUpload<T>(path, formData, { retryAfterRefresh: false });
      }
    }
    throw error;
  }
};

/**
 * Telechargement binaire authentifie (rapport PDF). Renvoie un Blob et gere le
 * rafraichissement de session sur 401. Ne simule jamais de contenu.
 */
export const apiDownload = async (
  path: string,
  options: { retryAfterRefresh?: boolean } = {},
): Promise<Blob> => {
  const retryAfterRefresh = options.retryAfterRefresh !== false;
  const headers = new Headers();
  const token = getStoredAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_ROOT}${path}`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (
      retryAfterRefresh
      && response.status === 401
    ) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        return apiDownload(path, { retryAfterRefresh: false });
      }
    }
    let code: string | undefined;
    try {
      const payload = await response.json();
      code = payload?.error?.code;
    } catch {
      code = undefined;
    }
    throw new ApiError(
      `Telechargement refuse (${response.status}).`,
      response.status,
      code,
    );
  }

  return response.blob();
};

export const AUTH_CHANGED_EVENT = AUTH_EVENT;
