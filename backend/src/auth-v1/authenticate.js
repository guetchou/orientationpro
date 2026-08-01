const jwt = require('jsonwebtoken');

const publicAccount = (account) => ({
  id: account.id,
  email: account.email,
  status: account.status,
  roles: account.roles || (account.role ? [account.role] : []),
});

const createSessionResolver = ({ store, jwtSecret }) => {
  if (!store || typeof store.findActiveSession !== 'function') {
    throw new Error('An authentication store with session validation is required.');
  }
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT secret must contain at least 32 characters.');
  }

  return async (req) => {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) return { status: 'missing' };

    let claims;
    try {
      claims = jwt.verify(authorization.slice(7), jwtSecret, {
        issuer: 'orientationpro-api',
        audience: 'orientationpro-clients',
        algorithms: ['HS256'],
      });
    } catch (error) {
      return { status: 'invalid' };
    }

    const active = await store.findActiveSession({
      sessionId: claims.sid,
      accountId: claims.sub,
      now: new Date(),
    });
    if (!active) return { status: 'invalid' };

    return {
      status: 'authenticated',
      auth: {
        account: publicAccount(active.account),
        sessionId: active.session.id,
      },
    };
  };
};

const createSessionAuthenticator = ({ store, jwtSecret }) => {
  const resolve = createSessionResolver({ store, jwtSecret });
  return async (req, res, next) => {
    try {
      const result = await resolve(req);
      if (result.status === 'missing') {
        return res.status(401).json({
          error: { code: 'SESSION_REQUIRED', message: 'An access token is required.' },
        });
      }
      if (result.status !== 'authenticated') {
        return res.status(401).json({
          error: { code: 'INVALID_SESSION', message: 'The session is invalid or expired.' },
        });
      }
      req.auth = result.auth;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

const createOptionalSessionAuthenticator = ({ store, jwtSecret }) => {
  const resolve = createSessionResolver({ store, jwtSecret });
  return async (req, res, next) => {
    try {
      const result = await resolve(req);
      if (result.status === 'missing') return next();
      if (result.status !== 'authenticated') {
        return res.status(401).json({
          error: { code: 'INVALID_SESSION', message: 'The session is invalid or expired.' },
        });
      }
      req.auth = result.auth;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  createOptionalSessionAuthenticator,
  createSessionAuthenticator,
  createSessionResolver,
};