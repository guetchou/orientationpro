const ACCESS_COOKIE = 'orientationpro_access';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

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

const createCookieSessionMiddleware = ({
  frontendUrl,
  cookieSecure = true,
  accessTokenTtlSeconds = 15 * 60,
}) => {
  const allowedOrigin = normalizeOrigin(frontendUrl);
  if (!allowedOrigin) throw new Error('A valid frontend URL is required for cookie authentication.');

  return (req, res, next) => {
    const accessToken = readCookie(req, ACCESS_COOKIE);
    if (accessToken && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${accessToken}`;
    }

    const hasAuthCookie = Boolean(accessToken || readCookie(req, 'orientationpro_refresh'));
    if (!SAFE_METHODS.has(req.method) && hasAuthCookie) {
      const origin = normalizeOrigin(req.headers.origin || '');
      if (origin !== allowedOrigin) {
        return res.status(403).json({
          error: {
            code: 'CSRF_ORIGIN_REJECTED',
            message: 'The request origin is not allowed.',
          },
        });
      }
    }

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
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
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
      }
      return originalEnd(...args);
    };

    return next();
  };
};

module.exports = {
  ACCESS_COOKIE,
  createCookieSessionMiddleware,
  readCookie,
};
