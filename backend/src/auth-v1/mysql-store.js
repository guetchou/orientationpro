const crypto = require('node:crypto');

const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_TTL_MS = 12 * 60 * 60 * 1000;

const accountSelect = `
  SELECT
    a.id,
    a.email,
    a.password_hash,
    a.status,
    (
      SELECT GROUP_CONCAT(ar.role_id ORDER BY ar.role_id SEPARATOR ',')
      FROM auth_account_roles ar
      WHERE ar.account_id = a.id
    ) AS roles_csv
  FROM auth_accounts a
`;

const mapAccount = (row) => {
  if (!row) return null;
  const roles = row.roles_csv ? row.roles_csv.split(',') : [];
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    status: row.status,
    roles,
    role: roles[0],
  };
};

const findAccountById = async (connection, accountId) => {
  const [[row]] = await connection.query(`${accountSelect} WHERE a.id = ?`, [accountId]);
  return mapAccount(row);
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

const sessionDeadlines = (now = new Date()) => ({
  lastActivityAt: now,
  idleExpiresAt: new Date(now.getTime() + SESSION_IDLE_TTL_MS),
  absoluteExpiresAt: new Date(now.getTime() + SESSION_ABSOLUTE_TTL_MS),
});

const createMySqlAuthStore = (pool) => ({
  async findAccountByEmail(email) {
    const [[row]] = await pool.query(`${accountSelect} WHERE a.email = ?`, [email]);
    return mapAccount(row);
  },

  async createAccount({ email, passwordHash, role, status }) {
    return transaction(pool, async (connection) => {
      const accountId = crypto.randomUUID();
      await connection.query(
        'INSERT INTO auth_accounts (id, email, password_hash, status) VALUES (?, ?, ?, ?)',
        [accountId, email, passwordHash, status],
      );
      await connection.query(
        'INSERT INTO auth_account_roles (account_id, role_id) VALUES (?, ?)',
        [accountId, role],
      );
      return findAccountById(connection, accountId);
    });
  },

  async saveOAuthTransaction({ stateHash, provider, nonce, codeVerifier, expiresAt, accountId = null }) {
    await pool.query(
      `INSERT INTO auth_oauth_transactions
       (state_hash, provider, account_id, nonce, code_verifier, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [stateHash, provider, accountId, nonce, codeVerifier, expiresAt],
    );
  },

  async consumeOAuthTransaction({ stateHash, provider, now }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT account_id, nonce, code_verifier
         FROM auth_oauth_transactions
         WHERE state_hash = ?
           AND provider = ?
           AND consumed_at IS NULL
           AND expires_at > ?
         FOR UPDATE`,
        [stateHash, provider, now],
      );
      if (!row) return null;
      await connection.query(
        'UPDATE auth_oauth_transactions SET consumed_at = ? WHERE state_hash = ?',
        [now, stateHash],
      );
      return { accountId: row.account_id, nonce: row.nonce, codeVerifier: row.code_verifier };
    });
  },

  // Rattache une identite sociale a un compte DEJA authentifie (flux de liaison).
  // Gardes anti-usurpation : identite deja liee a ce compte -> idempotent ;
  // liee a un AUTRE compte -> refus.
  async linkOAuthIdentity({ provider, subject, accountId, email }) {
    return transaction(pool, async (connection) => {
      const [[existing]] = await connection.query(
        `SELECT account_id
         FROM auth_external_identities
         WHERE provider = ? AND provider_subject = ?
         FOR UPDATE`,
        [provider, subject],
      );
      if (existing) {
        return existing.account_id === accountId ? { status: 'linked' } : { status: 'identity_taken' };
      }
      const account = await findAccountById(connection, accountId);
      if (!account || account.status !== 'active') return { status: 'account_unavailable' };
      await connection.query(
        `INSERT INTO auth_external_identities
         (provider, provider_subject, account_id, email_at_link)
         VALUES (?, ?, ?, ?)`,
        [provider, subject, accountId, String(email || '').trim().toLowerCase()],
      );
      return { status: 'linked', account };
    });
  },

  async listOAuthIdentities({ accountId }) {
    const [rows] = await pool.query(
      `SELECT provider, email_at_link, created_at
       FROM auth_external_identities
       WHERE account_id = ?
       ORDER BY created_at`,
      [accountId],
    );
    return rows.map((row) => ({
      provider: row.provider,
      emailAtLink: row.email_at_link,
      linkedAt: row.created_at,
    }));
  },

  async unlinkOAuthIdentity({ provider, accountId }) {
    const [result] = await pool.query(
      'DELETE FROM auth_external_identities WHERE provider = ? AND account_id = ?',
      [provider, accountId],
    );
    return { removed: result.affectedRows };
  },

  async resolveOAuthIdentity({ provider, subject, email, emailVerified, passwordHash }) {
    return transaction(pool, async (connection) => {
      const [[identity]] = await connection.query(
        `SELECT account_id
         FROM auth_external_identities
         WHERE provider = ? AND provider_subject = ?
         FOR UPDATE`,
        [provider, subject],
      );
      if (identity) {
        const account = await findAccountById(connection, identity.account_id);
        return account?.status === 'active'
          ? { status: 'authenticated', account }
          : { status: 'account_unavailable' };
      }
      if (!emailVerified) return { status: 'email_unverified' };
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const [[existing]] = await connection.query(
        'SELECT id FROM auth_accounts WHERE email = ? FOR UPDATE',
        [normalizedEmail],
      );
      if (existing) return { status: 'link_required' };

      const accountId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO auth_accounts (id, email, password_hash, status)
         VALUES (?, ?, ?, 'active')`,
        [accountId, normalizedEmail, passwordHash],
      );
      await connection.query(
        'INSERT INTO auth_account_roles (account_id, role_id) VALUES (?, ?)',
        [accountId, 'user'],
      );
      await connection.query(
        `INSERT INTO auth_external_identities
         (provider, provider_subject, account_id, email_at_link)
         VALUES (?, ?, ?, ?)`,
        [provider, subject, accountId, normalizedEmail],
      );
      return { status: 'authenticated', account: await findAccountById(connection, accountId) };
    });
  },

  async saveVerificationToken({ accountId, tokenHash, expiresAt }) {
    await pool.query(
      'INSERT INTO auth_email_verification_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)',
      [tokenHash, accountId, expiresAt],
    );
  },

  async issueVerificationToken({ email, tokenHash, expiresAt }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT id
         FROM auth_accounts
         WHERE email = ? AND status = 'pending_verification'
         FOR UPDATE`,
        [email],
      );
      if (!row) return null;
      const now = new Date();
      await connection.query(
        `UPDATE auth_email_verification_tokens
         SET consumed_at = ?
         WHERE account_id = ? AND consumed_at IS NULL`,
        [now, row.id],
      );
      await connection.query(
        `INSERT INTO auth_email_verification_tokens
         (token_hash, account_id, expires_at)
         VALUES (?, ?, ?)`,
        [tokenHash, row.id, expiresAt],
      );
      return findAccountById(connection, row.id);
    });
  },

  async consumeVerificationToken({ tokenHash, now }) {
    return transaction(pool, async (connection) => {
      const [[token]] = await connection.query(
        `SELECT account_id
         FROM auth_email_verification_tokens
         WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?
         FOR UPDATE`,
        [tokenHash, now],
      );
      if (!token) return null;
      await connection.query(
        'UPDATE auth_email_verification_tokens SET consumed_at = ? WHERE token_hash = ?',
        [now, tokenHash],
      );
      await connection.query(
        `UPDATE auth_accounts
         SET status = 'active'
         WHERE id = ? AND status = 'pending_verification'`,
        [token.account_id],
      );
      return findAccountById(connection, token.account_id);
    });
  },

  async createSession({ accountId, refreshTokenHash }) {
    return transaction(pool, async (connection) => {
      const sessionId = crypto.randomUUID();
      const deadlines = sessionDeadlines();
      await connection.query(
        `INSERT INTO auth_sessions
         (id, family_id, account_id, last_activity_at, idle_expires_at, absolute_expires_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          sessionId,
          accountId,
          deadlines.lastActivityAt,
          deadlines.idleExpiresAt,
          deadlines.absoluteExpiresAt,
          deadlines.absoluteExpiresAt,
        ],
      );
      await connection.query(
        `INSERT INTO auth_refresh_tokens (token_hash, session_id, expires_at)
         VALUES (?, ?, ?)`,
        [refreshTokenHash, sessionId, deadlines.absoluteExpiresAt],
      );
      return {
        id: sessionId,
        familyId: sessionId,
        accountId,
        expiresAt: deadlines.absoluteExpiresAt,
      };
    });
  },

  async rotateSession({ refreshTokenHash, nextRefreshTokenHash, now }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT
           rt.used_at,
           rt.expires_at AS token_expires_at,
           s.id AS session_id,
           s.family_id,
           s.account_id,
           s.idle_expires_at,
           s.absolute_expires_at,
           s.revoked_at,
           a.email,
           a.password_hash,
           a.status,
           (
             SELECT GROUP_CONCAT(ar.role_id ORDER BY ar.role_id SEPARATOR ',')
             FROM auth_account_roles ar
             WHERE ar.account_id = a.id
           ) AS roles_csv
         FROM auth_refresh_tokens rt
         JOIN auth_sessions s ON s.id = rt.session_id
         JOIN auth_accounts a ON a.id = s.account_id
         WHERE rt.token_hash = ?
         FOR UPDATE`,
        [refreshTokenHash],
      );
      if (!row) return { status: 'invalid' };
      if (row.used_at) {
        await connection.query(
          'UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE family_id = ?',
          [now, row.family_id],
        );
        return { status: 'reused' };
      }
      if (
        row.revoked_at
        || row.status !== 'active'
        || row.token_expires_at <= now
        || row.idle_expires_at <= now
        || row.absolute_expires_at <= now
      ) {
        return { status: 'invalid' };
      }

      const nextIdleExpiresAt = new Date(Math.min(
        now.getTime() + SESSION_IDLE_TTL_MS,
        new Date(row.absolute_expires_at).getTime(),
      ));
      await connection.query(
        'UPDATE auth_refresh_tokens SET used_at = ? WHERE token_hash = ?',
        [now, refreshTokenHash],
      );
      await connection.query(
        'INSERT INTO auth_refresh_tokens (token_hash, session_id, expires_at) VALUES (?, ?, ?)',
        [nextRefreshTokenHash, row.session_id, row.absolute_expires_at],
      );
      await connection.query(
        `UPDATE auth_sessions
         SET last_activity_at = ?, idle_expires_at = ?
         WHERE id = ?`,
        [now, nextIdleExpiresAt, row.session_id],
      );
      return {
        status: 'rotated',
        session: {
          id: row.session_id,
          familyId: row.family_id,
          accountId: row.account_id,
          expiresAt: row.absolute_expires_at,
        },
        account: mapAccount({ ...row, id: row.account_id }),
      };
    });
  },

  async findActiveSession({ sessionId, accountId, now }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT
           s.id AS session_id,
           s.absolute_expires_at,
           a.id,
           a.email,
           a.password_hash,
           a.status,
           (
             SELECT GROUP_CONCAT(ar.role_id ORDER BY ar.role_id SEPARATOR ',')
             FROM auth_account_roles ar
             WHERE ar.account_id = a.id
           ) AS roles_csv
         FROM auth_sessions s
         JOIN auth_accounts a ON a.id = s.account_id
         WHERE s.id = ?
           AND s.account_id = ?
           AND s.revoked_at IS NULL
           AND s.idle_expires_at > ?
           AND s.absolute_expires_at > ?
           AND a.status = 'active'
         FOR UPDATE`,
        [sessionId, accountId, now, now],
      );
      if (!row) return null;
      const nextIdleExpiresAt = new Date(Math.min(
        now.getTime() + SESSION_IDLE_TTL_MS,
        new Date(row.absolute_expires_at).getTime(),
      ));
      await connection.query(
        `UPDATE auth_sessions
         SET last_activity_at = ?, idle_expires_at = ?
         WHERE id = ?`,
        [now, nextIdleExpiresAt, row.session_id],
      );
      return { session: { id: row.session_id }, account: mapAccount(row) };
    });
  },

  async revokeSessionByRefreshHash({ refreshTokenHash, revokedAt }) {
    await pool.query(
      `UPDATE auth_sessions s
       JOIN auth_refresh_tokens rt ON rt.session_id = s.id
       SET s.revoked_at = COALESCE(s.revoked_at, ?)
       WHERE rt.token_hash = ?`,
      [revokedAt, refreshTokenHash],
    );
  },

  async revokeSessionsForAccount({ accountId, revokedAt = new Date() }) {
    await pool.query(
      `UPDATE auth_sessions
       SET revoked_at = COALESCE(revoked_at, ?)
       WHERE account_id = ?`,
      [revokedAt, accountId],
    );
  },

  async savePasswordResetToken({ accountId, tokenHash, expiresAt }) {
    await pool.query(
      'INSERT INTO auth_password_reset_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)',
      [tokenHash, accountId, expiresAt],
    );
  },

  async consumePasswordResetToken({ tokenHash, passwordHash, now }) {
    return transaction(pool, async (connection) => {
      const [[token]] = await connection.query(
        `SELECT account_id
         FROM auth_password_reset_tokens
         WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?
         FOR UPDATE`,
        [tokenHash, now],
      );
      if (!token) return null;
      await connection.query(
        'UPDATE auth_password_reset_tokens SET consumed_at = ? WHERE token_hash = ?',
        [now, tokenHash],
      );
      await connection.query(
        'UPDATE auth_accounts SET password_hash = ? WHERE id = ?',
        [passwordHash, token.account_id],
      );
      await connection.query(
        'UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE account_id = ?',
        [now, token.account_id],
      );
      return findAccountById(connection, token.account_id);
    });
  },
});

module.exports = { createMySqlAuthStore };
