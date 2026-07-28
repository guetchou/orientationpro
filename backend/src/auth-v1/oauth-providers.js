const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

const parseJsonResponse = async (response, provider) => {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new Error(`${provider} OAuth request failed`);
  }
  return payload;
};

const postForm = async (fetchImpl, url, values, provider) => {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values),
  });
  return parseJsonResponse(response, provider);
};

const createGoogleProvider = ({
  clientId,
  clientSecret,
  fetchImpl = fetch,
  now = () => Date.now(),
}) => {
  let cachedKeys = null;
  let keysExpireAt = 0;

  const googleKeys = async () => {
    if (cachedKeys && keysExpireAt > now()) return cachedKeys;
    const response = await fetchImpl(GOOGLE_JWKS_URL);
    const payload = await parseJsonResponse(response, 'Google');
    cachedKeys = payload.keys || [];
    const cacheControl = response.headers.get('cache-control') || '';
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 300);
    keysExpireAt = now() + Math.max(60, maxAge) * 1000;
    return cachedKeys;
  };

  return {
    authorizationUrl({ state, nonce, codeChallenge, redirectUri }) {
      return `${GOOGLE_AUTHORIZATION_URL}?${new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'select_account',
      })}`;
    },

    async exchange({ code, nonce, codeVerifier, redirectUri }) {
      const tokens = await postForm(fetchImpl, GOOGLE_TOKEN_URL, {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }, 'Google');
      if (!tokens.id_token) throw new Error('Google did not return an ID token');

      const decoded = jwt.decode(tokens.id_token, { complete: true });
      const key = (await googleKeys()).find((candidate) => candidate.kid === decoded?.header?.kid);
      if (!key) throw new Error('Google signing key was not found');
      const publicKey = crypto.createPublicKey({ key, format: 'jwk' });
      const claims = jwt.verify(tokens.id_token, publicKey, {
        algorithms: ['RS256'],
        audience: clientId,
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
      });
      if (!nonce || claims.nonce !== nonce) throw new Error('Google nonce is invalid');
      if (!claims.sub || !claims.email || claims.email_verified !== true) {
        throw new Error('Google account email is not verified');
      }
      return {
        provider: 'google',
        subject: String(claims.sub),
        email: String(claims.email),
        emailVerified: true,
      };
    },
  };
};

const createMetaProvider = ({
  appId,
  appSecret,
  graphVersion,
  fetchImpl = fetch,
}) => {
  const graphBase = `https://graph.facebook.com/${graphVersion}`;
  const authorizationBase = `https://www.facebook.com/${graphVersion}/dialog/oauth`;

  return {
    authorizationUrl({ state, redirectUri }) {
      return `${authorizationBase}?${new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email,public_profile',
        state,
      })}`;
    },

    async exchange({ code, redirectUri }) {
      const tokens = await parseJsonResponse(await fetchImpl(
        `${graphBase}/oauth/access_token?${new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        })}`,
      ), 'Meta');
      if (!tokens.access_token) throw new Error('Meta did not return an access token');

      const appAccessToken = `${appId}|${appSecret}`;
      const inspection = await parseJsonResponse(await fetchImpl(
        `${graphBase}/debug_token?${new URLSearchParams({
          input_token: tokens.access_token,
          access_token: appAccessToken,
        })}`,
      ), 'Meta');
      if (
        inspection.data?.is_valid !== true
        || String(inspection.data?.app_id) !== String(appId)
        || !inspection.data?.user_id
      ) {
        throw new Error('Meta access token is invalid');
      }

      const appsecretProof = crypto
        .createHmac('sha256', appSecret)
        .update(tokens.access_token)
        .digest('hex');
      const profile = await parseJsonResponse(await fetchImpl(
        `${graphBase}/me?${new URLSearchParams({
          fields: 'id,email',
          access_token: tokens.access_token,
          appsecret_proof: appsecretProof,
        })}`,
      ), 'Meta');
      if (
        String(profile.id) !== String(inspection.data.user_id)
        || !profile.email
      ) {
        throw new Error('Meta account did not provide an email address');
      }
      return {
        provider: 'meta',
        subject: String(profile.id),
        email: String(profile.email),
        emailVerified: true,
      };
    },
  };
};

const createConfiguredOAuthProviders = (env = process.env) => {
  const providers = {};
  if (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET) {
    providers.google = createGoogleProvider({
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    });
  }
  if (env.META_APP_ID && env.META_APP_SECRET && env.META_GRAPH_API_VERSION) {
    providers.meta = createMetaProvider({
      appId: env.META_APP_ID,
      appSecret: env.META_APP_SECRET,
      graphVersion: env.META_GRAPH_API_VERSION,
    });
  }
  return providers;
};

module.exports = {
  createGoogleProvider,
  createMetaProvider,
  createConfiguredOAuthProviders,
};
