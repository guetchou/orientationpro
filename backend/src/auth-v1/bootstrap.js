const { createDatabasePool } = require('../db/pool');
const { createAuthRouter } = require('./index');
const { createMySqlAuthStore } = require('./mysql-store');
const { createSmtpEmailAdapter } = require('./smtp-email');

const createConfiguredAuthV1 = (env = process.env) => {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters when AUTH_V1_ENABLED=true');
  }
  const pool = createDatabasePool(env);
  const router = createAuthRouter({
    store: createMySqlAuthStore(pool),
    email: createSmtpEmailAdapter(env),
    jwtSecret: env.JWT_SECRET,
    cookieSecure: env.NODE_ENV === 'production',
  });
  return { router, close: () => pool.end() };
};

module.exports = { createConfiguredAuthV1 };
