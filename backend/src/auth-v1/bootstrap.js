const express = require('express');
const { createDatabasePool } = require('../db/pool');
const { createAuthRouter } = require('./index');
const {
  createOptionalSessionAuthenticator,
  createSessionAuthenticator,
} = require('./authenticate');
const { createCookieSessionMiddleware } = require('./cookie-session');
const { createMySqlAuthStore } = require('./mysql-store');
const { createPermissionChecker } = require('./permissions');
const { createConfiguredOAuthProviders } = require('./oauth-providers');
const { createSmtpEmailAdapter } = require('./smtp-email');
const {
  createGuestSessionManager,
  createGuestSessionStore,
} = require('../orientation/guest-sessions');

const parseOriginList = (value) => String(value || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

const createConfiguredAuthV1 = (env = process.env) => {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters when AUTH_V1_ENABLED=true');
  }
  const pool = createDatabasePool(env);
  const store = createMySqlAuthStore(pool);
  const frontendUrl = env.APP_WEB_URL || 'http://localhost:5173';
  const allowedOrigins = parseOriginList(env.CORS_ORIGINS);
  const cookieSecure = env.NODE_ENV === 'production';
  const guestSessions = createGuestSessionManager({
    store: createGuestSessionStore(pool),
    cookieSecure,
    ttlMs: env.GUEST_ORIENTATION_TTL_MS,
  });
  const router = express.Router();
  router.use(createCookieSessionMiddleware({
    frontendUrl,
    allowedOrigins,
    cookieSecure,
  }));
  router.use(createAuthRouter({
    store,
    email: createSmtpEmailAdapter(env),
    jwtSecret: env.JWT_SECRET,
    cookieSecure,
    oauthProviders: createConfiguredOAuthProviders(env),
    frontendUrl,
    oauthCallbackBaseUrl: env.OAUTH_CALLBACK_BASE_URL || frontendUrl,
    guestSessions,
  }));
  const authenticate = createSessionAuthenticator({
    store,
    jwtSecret: env.JWT_SECRET,
  });
  const authenticateOptional = createOptionalSessionAuthenticator({
    store,
    jwtSecret: env.JWT_SECRET,
  });
  return {
    router,
    authenticate,
    authenticateOptional,
    guestSessions,
    hasPermission: createPermissionChecker(pool),
    pool,
    store,
    close: () => pool.end(),
  };
};

module.exports = {
  createConfiguredAuthV1,
  parseOriginList,
};
