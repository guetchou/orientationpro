const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TOKEN_BYTES = 32;
const VERIFICATION_TTL_MS = 30 * 60 * 1000;
const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const REFRESH_COOKIE = 'orientationpro_refresh';
const OAUTH_STATE_COOKIE = 'orientationpro_oauth_state';
const OAUTH_TRANSACTION_TTL_MS = 10 * 60 * 1000;

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const accountRoles = (account) => account.roles || (account.role ? [account.role] : []);
const publicAccount = (account) => ({
  id: account.id,
  email: account.email,
  status: account.status,
  roles: accountRoles(account),
});

const readCookie = (req, name) => {
  const header = req.headers.cookie || '';
  const entry = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
};
const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const createAuthRouter = ({
  store,
  email,
  jwtSecret,
  cookieSecure = true,
  oauthProviders = {},
  frontendUrl = 'http://localhost:5173',
  oauthCallbackBaseUrl = frontendUrl,
}) => {
  if (!store || !email) {
    throw new Error('Auth store and email adapter are required');
  }
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT secret must contain at least 32 characters');
  }

  const router = express.Router();

  const oauthRedirect = (res, code) => {
    const target = new URL('/login', frontendUrl);
    target.searchParams.set('oauth', 'error');
    target.searchParams.set('code', code);
    return res.redirect(302, target.toString());
  };

  router.get('/oauth/:provider/start', route(async (req, res) => {
    const providerName = String(req.params.provider || '');
    const provider = oauthProviders[providerName];
    if (!provider) {
      return res.status(404).json({
        error: { code: 'OAUTH_PROVIDER_UNAVAILABLE', message: 'This login provider is unavailable.' },
      });
    }

    const state = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const nonce = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const codeVerifier = crypto.randomBytes(48).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const redirectUri = new URL(
      `/api/v1/auth/oauth/${providerName}/callback`,
      oauthCallbackBaseUrl,
    ).toString();
    await store.saveOAuthTransaction({
      stateHash: hashToken(state),
      provider: providerName,
      nonce,
      codeVerifier,
      expiresAt: new Date(Date.now() + OAUTH_TRANSACTION_TTL_MS),
    });
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      maxAge: OAUTH_TRANSACTION_TTL_MS,
      path: `/api/v1/auth/oauth/${providerName}/callback`,
    });
    return res.redirect(302, provider.authorizationUrl({
      state,
      nonce,
      codeChallenge,
      redirectUri,
    }));
  }));

  router.get('/oauth/:provider/callback', route(async (req, res) => {
    const providerName = String(req.params.provider || '');
    const provider = oauthProviders[providerName];
    const state = String(req.query.state || '');
    const cookieState = readCookie(req, OAUTH_STATE_COOKIE) || '';
    res.clearCookie(OAUTH_STATE_COOKIE, {
      path: `/api/v1/auth/oauth/${providerName}/callback`,
    });
    if (!provider || req.query.error || !state || !cookieState) {
      return oauthRedirect(res, 'OAUTH_CANCELLED');
    }
    const stateMatches = state.length === cookieState.length
      && crypto.timingSafeEqual(Buffer.from(state), Buffer.from(cookieState));
    if (!stateMatches) return oauthRedirect(res, 'OAUTH_STATE_INVALID');

    const transaction = await store.consumeOAuthTransaction({
      stateHash: hashToken(state),
      provider: providerName,
      now: new Date(),
    });
    if (!transaction || !req.query.code) return oauthRedirect(res, 'OAUTH_STATE_INVALID');

    let identity;
    try {
      const redirectUri = new URL(
        `/api/v1/auth/oauth/${providerName}/callback`,
        oauthCallbackBaseUrl,
      ).toString();
      identity = await provider.exchange({
        code: String(req.query.code),
        nonce: transaction.nonce,
        codeVerifier: transaction.codeVerifier,
        redirectUri,
      });
    } catch (error) {
      return oauthRedirect(res, 'OAUTH_PROVIDER_REJECTED');
    }

    const passwordHash = await bcrypt.hash(
      crypto.randomBytes(48).toString('base64url'),
      12,
    );
    const resolved = await store.resolveOAuthIdentity({
      ...identity,
      email: normalizeEmail(identity.email),
      passwordHash,
    });
    if (resolved.status === 'link_required') return oauthRedirect(res, 'ACCOUNT_LINK_REQUIRED');
    if (resolved.status !== 'authenticated') return oauthRedirect(res, 'OAUTH_ACCOUNT_UNAVAILABLE');

    const refreshToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    await store.createSession({
      accountId: resolved.account.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/api/v1/auth',
    });
    const target = new URL('/login', frontendUrl);
    target.searchParams.set('oauth', 'success');
    return res.redirect(302, target.toString());
  }));
  router.post('/register', route(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 12) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REGISTRATION',
          message: 'A valid email and a password of at least 12 characters are required.',
        },
      });
    }

    const existing = await store.findAccountByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'ACCOUNT_EXISTS',
          message: 'An account already exists for this email.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const account = await store.createAccount({
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      status: 'pending_verification',
    });
    const verificationToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    await store.saveVerificationToken({
      accountId: account.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    });
    await email.sendVerification({
      accountId: account.id,
      email: account.email,
      token: verificationToken,
    });

    return res.status(201).json({ account: publicAccount(account) });
  }));

  router.post('/login', route(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const account = await store.findAccountByEmail(normalizedEmail);
    const passwordMatches = account
      ? await bcrypt.compare(password, account.passwordHash)
      : false;

    if (!account || !passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect.',
        },
      });
    }

    if (account.status !== 'active') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_NOT_VERIFIED',
          message: 'The account must be verified before login.',
        },
      });
    }

    const refreshToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const session = await store.createSession({
      accountId: account.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });
    const accessToken = jwt.sign(
      { roles: accountRoles(account), sid: session.id },
      jwtSecret,
      {
        subject: account.id,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        issuer: 'orientationpro-api',
        audience: 'orientationpro-clients',
        algorithm: 'HS256',
      },
    );

    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/api/v1/auth',
    });
    return res.status(200).json({
      accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      account: publicAccount(account),
    });
  }));

  router.post('/verify-email', route(async (req, res) => {
    const token = String(req.body?.token || '');
    if (!token) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'The verification token is invalid or expired.',
        },
      });
    }

    const account = await store.consumeVerificationToken({
      tokenHash: hashToken(token),
      now: new Date(),
    });
    if (!account) {
      return res.status(400).json({
        error: {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'The verification token is invalid or expired.',
        },
      });
    }

    try {
      await email.sendWelcome({ email: account.email });
    } catch (err) {
      // Welcome email is best-effort; never block verification on it.
    }

    return res.status(200).json({ account: publicAccount(account) });
  }));

  router.post('/verification/request', route(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const verificationToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const account = await store.issueVerificationToken({
      email: normalizedEmail,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    });

    if (account) {
      try {
        await email.sendVerification({
          accountId: account.id,
          email: account.email,
          token: verificationToken,
        });
      } catch {
        // Keep the response indistinguishable from requests for unknown accounts.
      }
    }

    return res.status(202).end();
  }));

  router.post('/refresh', route(async (req, res) => {
    const refreshToken = readCookie(req, REFRESH_COOKIE);
    if (!refreshToken) {
      return res.status(401).json({
        error: { code: 'SESSION_REQUIRED', message: 'A refresh session is required.' },
      });
    }

    const nextRefreshToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
    const result = await store.rotateSession({
      refreshTokenHash: hashToken(refreshToken),
      nextRefreshTokenHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      now: new Date(),
    });

    if (!result || result.status !== 'rotated') {
      res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
      const replayed = result?.status === 'reused';
      return res.status(401).json({
        error: {
          code: replayed ? 'SESSION_REVOKED' : 'INVALID_SESSION',
          message: replayed ? 'The session was revoked after token replay.' : 'The session is invalid or expired.',
        },
      });
    }

    const accessToken = jwt.sign(
      { roles: accountRoles(result.account), sid: result.session.id },
      jwtSecret,
      {
        subject: result.account.id,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        issuer: 'orientationpro-api',
        audience: 'orientationpro-clients',
        algorithm: 'HS256',
      },
    );
    res.cookie(REFRESH_COOKIE, nextRefreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: '/api/v1/auth',
    });
    return res.status(200).json({
      accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      account: publicAccount(result.account),
    });
  }));

  router.get('/session', route(async (req, res) => {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'SESSION_REQUIRED', message: 'An access token is required.' },
      });
    }

    try {
      const claims = jwt.verify(authorization.slice(7), jwtSecret, {
        issuer: 'orientationpro-api',
        audience: 'orientationpro-clients',
        algorithms: ['HS256'],
      });
      const active = await store.findActiveSession({
        sessionId: claims.sid,
        accountId: claims.sub,
        now: new Date(),
      });
      if (!active) {
        return res.status(401).json({
          error: { code: 'INVALID_SESSION', message: 'The session is invalid or expired.' },
        });
      }
      return res.status(200).json({ account: publicAccount(active.account) });
    } catch (error) {
      return res.status(401).json({
        error: { code: 'INVALID_SESSION', message: 'The session is invalid or expired.' },
      });
    }
  }));

  router.post('/logout', route(async (req, res) => {
    const refreshToken = readCookie(req, REFRESH_COOKIE);
    if (refreshToken) {
      await store.revokeSessionByRefreshHash({
        refreshTokenHash: hashToken(refreshToken),
        revokedAt: new Date(),
      });
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
    return res.status(204).end();
  }));

  router.post('/password-reset/request', route(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body?.email);
    const account = await store.findAccountByEmail(normalizedEmail);

    if (account?.status === 'active') {
      const resetToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
      await store.savePasswordResetToken({
        accountId: account.id,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      });
      await email.sendPasswordReset({
        accountId: account.id,
        email: account.email,
        token: resetToken,
      });
    }

    return res.status(202).json({
      message: 'If an active account exists, password reset instructions will be sent.',
    });
  }));

  router.post('/password-reset/confirm', route(async (req, res) => {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (!token || password.length < 12) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PASSWORD_RESET',
          message: 'The reset token is invalid or the password is too short.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const account = await store.consumePasswordResetToken({
      tokenHash: hashToken(token),
      passwordHash,
      now: new Date(),
    });
    if (!account) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PASSWORD_RESET',
          message: 'The reset token is invalid or expired.',
        },
      });
    }

    try {
      await email.sendPasswordChanged({ email: account.email });
    } catch (err) {
      // Notification is best-effort; never block the reset on it.
    }

    return res.status(204).end();
  }));

  return router;
};

module.exports = {
  createAuthRouter,
};
