const ACCESS_COOKIE = 'orientationpro_access';
const REFRESH_COOKIE = 'orientationpro_refresh';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const TERMINAL_SESSION_ERRORS = new Set([
  'INVALID_SESSION',
  'SESSION_REVOKED',
]);

const readCookie = (req, name) => {
  const header = req.headers.cookie || '';
  const entry = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
};

const normalizeOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const normalizeAllowedOrigins = (frontendUrl, allowedOrigins = []) => {
  const origins = [frontendUrl, ...allowedOrigins]
    .map(normalizeOrigin)
    .filter(Boolean);
  return new Set(origins);
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
};

const createCookieSessionMiddleware = ({
  frontendUrl,
  allowedOrigins = [],
  cookieSecure = true,
  accessTokenTtlSeconds = 15 * 60,
  absoluteSessionTtlSeconds = 12 * 60 * 60,
}) => {
  const acceptedOrigins = normalizeAllowedOrigins(frontendUrl, allowedOrigins);
  if (acceptedOrigins.size === 0) {
    throw new Error('At least one valid frontend origin is required for cookie authentication.');
  }

  return (req, res, next) => {
    const accessToken = readCookie(req, ACCESS_COOKIE);
    if (accessToken && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${accessToken}`;
    }

    if (!SAFE_METHODS.has(req.method)) {
      const rawOrigin = req.headers.origin || '';
      const origin = normalizeOrigin(rawOrigin);
      const originMissingOutsideProduction = !rawOrigin && !cookieSecure;
      if (!originMissingOutsideProduction && !acceptedOrigins.has(origin)) {
        return res.status(403).json({
          error: {
            code: 'CSRF_ORIGIN_REJECTED',
            message: 'The request origin is not allowed.',
          },
        });
      }
    }

    res.set('Cache-Control', 'no-store');

    const originalCookie = res.cookie.bind(res);
    res.cookie = (name, value, options = {}) => {
      if (name === REFRESH_COOKIE) {
        const maximumLifetime = absoluteSessionTtlSeconds * 1000;
        const requestedLifetime = Number(options.maxAge);
        const maxAge = Number.isFinite(requestedLifetime)
          ? Math.min(requestedLifetime, maximumLifetime)
          : maximumLifetime;
        return originalCookie(name, value, { ...options, maxAge });
      }
      return originalCookie(name, value, options);
    };

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      if (TERMINAL_SESSION_ERRORS.has(payload?.error?.code)) {
        clearAuthCookies(res);
      }
      if (payload?.accessToken) {
        res.cookie(ACCESS_COOKIE, payload.accessToken, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'lax',
          maxAge: accessTokenTtlSeconds * 1000,
          path: '/',
        });
        const { accessToken: _removed, ...safePayload } = payload;
        return originalJson(safePayload);
      }
      return originalJson(payload);
    };

    const originalEnd = res.end.bind(res);
    res.end = (...args) => {
      if (req.path.endsWith('/logout')) {
        clearAuthCookies(res);
      }
      return originalEnd(...args);
    };

    return next();
  };
};

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  createCookieSessionMiddleware,
  normalizeAllowedOrigins,
  readCookie,
};
