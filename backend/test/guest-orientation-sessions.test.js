const assert = require('node:assert/strict');
const test = require('node:test');

const {
  DEFAULT_COOKIE_NAME,
  createGuestSessionManager,
  hashToken,
} = require('../src/orientation/guest-sessions');

const responseRecorder = () => {
  const cookies = [];
  const cleared = [];
  return {
    cookies,
    cleared,
    cookie(name, value, options) {
      cookies.push({ name, value, options });
    },
    clearCookie(name, options) {
      cleared.push({ name, options });
    },
  };
};

const requestWithCookie = (token, auth) => ({
  headers: token ? { cookie: `${DEFAULT_COOKIE_NAME}=${encodeURIComponent(token)}` } : {},
  auth,
});

test('guest manager stores only a token hash and emits a protected opaque cookie', async () => {
  let creation;
  const store = {
    findActive: async () => null,
    purgeExpired: async () => 0,
    create: async (input) => {
      creation = input;
      return { id: 'guest-1', status: 'active', expiresAt: input.expiresAt };
    },
  };
  const manager = createGuestSessionManager({ store, cookieSecure: true });
  const res = responseRecorder();

  const owner = await manager.resolveOwner(requestWithCookie(null), res);

  assert.deepEqual(owner, { accountId: null, guestSessionId: 'guest-1', kind: 'guest' });
  assert.match(creation.tokenHash, /^[a-f0-9]{64}$/u);
  assert.equal(res.cookies.length, 1);
  assert.equal(res.cookies[0].name, DEFAULT_COOKIE_NAME);
  assert.notEqual(res.cookies[0].value, creation.tokenHash);
  assert.equal(hashToken(res.cookies[0].value), creation.tokenHash);
  assert.equal(res.cookies[0].options.httpOnly, true);
  assert.equal(res.cookies[0].options.secure, true);
  assert.equal(res.cookies[0].options.sameSite, 'lax');
  assert.equal(res.cookies[0].options.path, '/api/v1');
});

test('an active guest cookie resolves the same owner and renews its expiry', async () => {
  let lookup;
  let touched;
  const token = 'guest-token';
  const store = {
    findActive: async (input) => {
      lookup = input;
      return { id: 'guest-existing', status: 'active', expiresAt: new Date(Date.now() + 1000) };
    },
    touch: async (input) => {
      touched = input;
    },
  };
  const manager = createGuestSessionManager({ store, cookieSecure: false });
  const res = responseRecorder();

  const owner = await manager.resolveOwner(requestWithCookie(token), res);

  assert.equal(lookup.tokenHash, hashToken(token));
  assert.equal(owner.guestSessionId, 'guest-existing');
  assert.equal(touched.id, 'guest-existing');
  assert.equal(res.cookies[0].value, token);
});

test('the first authenticated orientation request claims guest work and clears the cookie', async () => {
  let claim;
  const token = 'claim-token';
  const store = {
    claim: async (input) => {
      claim = input;
      return { status: 'claimed', attempts: 1, results: 1 };
    },
  };
  const manager = createGuestSessionManager({ store, cookieSecure: true });
  const res = responseRecorder();
  const req = requestWithCookie(token, {
    account: { id: 'account-1' },
  });

  const owner = await manager.resolveOwner(req, res);

  assert.deepEqual(owner, { accountId: 'account-1', guestSessionId: null, kind: 'account' });
  assert.equal(claim.tokenHash, hashToken(token));
  assert.equal(claim.accountId, 'account-1');
  assert.deepEqual(req.guestClaim, { status: 'claimed', attempts: 1, results: 1 });
  assert.deepEqual(res.cleared, [{ name: DEFAULT_COOKIE_NAME, options: { path: '/api/v1' } }]);
});
