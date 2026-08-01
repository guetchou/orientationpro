'use strict';

const crypto = require('node:crypto');

const DEFAULT_COOKIE_NAME = 'makoki_guest_orientation';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_BYTES = 32;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const readCookie = (req, name) => {
  const header = String(req.headers.cookie || '');
  const entry = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
};

const transaction = async (pool, work) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createGuestSessionStore = (pool) => ({
  async create({ tokenHash, expiresAt }) {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO orientation_guest_sessions (id, token_hash, status, expires_at)
       VALUES (?, ?, 'active', ?)`,
      [id, tokenHash, expiresAt],
    );
    return { id, status: 'active', expiresAt };
  },

  async findActive({ tokenHash, now }) {
    const [[row]] = await pool.query(
      `SELECT id, status, expires_at, last_seen_at
       FROM orientation_guest_sessions
       WHERE token_hash = ?
         AND status = 'active'
         AND expires_at > ?
       LIMIT 1`,
      [tokenHash, now],
    );
    return row ? {
      id: row.id,
      status: row.status,
      expiresAt: row.expires_at,
      lastSeenAt: row.last_seen_at,
    } : null;
  },

  async touch({ id, expiresAt }) {
    await pool.query(
      `UPDATE orientation_guest_sessions
       SET last_seen_at = CURRENT_TIMESTAMP(3), expires_at = ?
       WHERE id = ? AND status = 'active'`,
      [expiresAt, id],
    );
  },

  async purgeExpired({ now, limit = 100 }) {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const [result] = await pool.query(
      `DELETE FROM orientation_guest_sessions
       WHERE status = 'active' AND expires_at <= ?
       LIMIT ?`,
      [now, safeLimit],
    );
    return Number(result.affectedRows || 0);
  },

  async claim({ tokenHash, accountId, now }) {
    return transaction(pool, async (connection) => {
      const [[session]] = await connection.query(
        `SELECT id, status, expires_at
         FROM orientation_guest_sessions
         WHERE token_hash = ?
         FOR UPDATE`,
        [tokenHash],
      );
      if (!session || session.status !== 'active') {
        return { status: 'not_found', attempts: 0, results: 0 };
      }
      if (new Date(session.expires_at).getTime() <= now.getTime()) {
        await connection.query(
          `DELETE FROM orientation_guest_sessions
           WHERE id = ?`,
          [session.id],
        );
        return { status: 'expired', attempts: 0, results: 0 };
      }

      const [attempts] = await connection.query(
        `UPDATE orientation_riasec_attempts
         SET account_id = ?, guest_session_id = NULL
         WHERE guest_session_id = ?`,
        [accountId, session.id],
      );
      const [results] = await connection.query(
        `UPDATE orientation_results
         SET account_id = ?, guest_session_id = NULL
         WHERE guest_session_id = ?`,
        [accountId, session.id],
      );
      await connection.query(
        `UPDATE orientation_guest_sessions
         SET status = 'claimed', claimed_account_id = ?, claimed_at = ?, updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?`,
        [accountId, now, session.id],
      );
      return {
        status: 'claimed',
        attempts: Number(attempts.affectedRows || 0),
        results: Number(results.affectedRows || 0),
      };
    });
  },
});

const createGuestSessionManager = ({
  store,
  cookieSecure = true,
  ttlMs = DEFAULT_TTL_MS,
  cookieName = DEFAULT_COOKIE_NAME,
}) => {
  if (!store) throw new Error('Guest session store is required.');
  const safeTtlMs = Math.max(Number(ttlMs) || DEFAULT_TTL_MS, 60 * 60 * 1000);
  const cookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'lax',
    maxAge: safeTtlMs,
    path: '/api/v1',
  };

  const clearCookie = (res) => res.clearCookie(cookieName, { path: '/api/v1' });

  return {
    cookieName,

    async resolveOwner(req, res) {
      if (req.auth?.account?.id) {
        return { accountId: req.auth.account.id, guestSessionId: null, kind: 'account' };
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + safeTtlMs);
      const existingToken = readCookie(req, cookieName);
      if (existingToken) {
        const existing = await store.findActive({ tokenHash: hashToken(existingToken), now });
        if (existing) {
          await store.touch({ id: existing.id, expiresAt });
          res.cookie(cookieName, existingToken, cookieOptions);
          return { accountId: null, guestSessionId: existing.id, kind: 'guest' };
        }
      }

      await store.purgeExpired({ now, limit: 100 });
      const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url');
      const session = await store.create({ tokenHash: hashToken(token), expiresAt });
      res.cookie(cookieName, token, cookieOptions);
      return { accountId: null, guestSessionId: session.id, kind: 'guest' };
    },

    async claimFromRequest(req, res, accountId) {
      const token = readCookie(req, cookieName);
      if (!token) return { status: 'not_found', attempts: 0, results: 0 };
      const outcome = await store.claim({
        tokenHash: hashToken(token),
        accountId,
        now: new Date(),
      });
      clearCookie(res);
      return outcome;
    },

    clearCookie,
  };
};

module.exports = {
  DEFAULT_COOKIE_NAME,
  DEFAULT_TTL_MS,
  createGuestSessionManager,
  createGuestSessionStore,
  hashToken,
  readCookie,
};