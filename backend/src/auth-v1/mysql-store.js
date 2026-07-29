const crypto = require('node:crypto');

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

  async saveOAuthTransaction({ stateHash, provider, nonce, codeVerifier, expiresAt }) {
    await pool.query(
      `INSERT INTO auth_oauth_transactions
       (state_hash, provider, nonce, code_verifier, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [stateHash, provider, nonce, codeVerifier, expiresAt],
    );
  },

  async consumeOAuthTransaction({ stateHash, provider, now }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT nonce, code_verifier
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
      return { nonce: row.nonce, codeVerifier: row.code_verifier };
    });
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

  async createSession({ accountId, refreshTokenHash, expiresAt }) {
    return transaction(pool, async (connection) => {
      const sessionId = crypto.randomUUID();
      await connection.query(
        `INSERT INTO auth_sessions (id, family_id, account_id, expires_at)
         VALUES (?, ?, ?, ?)`,
        [sessionId, sessionId, accountId, expiresAt],
      );
      await connection.query(
        `INSERT INTO auth_refresh_tokens (token_hash, session_id, expires_at)
         VALUES (?, ?, ?)`,
        [refreshTokenHash, sessionId, expiresAt],
      );
      return { id: sessionId, familyId: sessionId, accountId, expiresAt };
    });
  },

  async rotateSession({ refreshTokenHash, nextRefreshTokenHash, expiresAt, now }) {
    return transaction(pool, async (connection) => {
      const [[row]] = await connection.query(
        `SELECT
           rt.used_at,
           rt.expires_at AS token_expires_at,
           s.id AS session_id,
           s.family_id,
           s.account_id,
           s.expires_at AS session_expires_at,
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
        row.revoked_at ||
        row.status !== 'active' ||
        row.token_expires_at <= now ||
        row.session_expires_at <= now
      ) {
        return { status: 'invalid' };
      }

      await connection.query(
        'UPDATE auth_refresh_tokens SET used_at = ? WHERE token_hash = ?',
        [now, refreshTokenHash],
      );
      await connection.query(
        'INSERT INTO auth_refresh_tokens (token_hash, session_id, expires_at) VALUES (?, ?, ?)',
        [nextRefreshTokenHash, row.session_id, expiresAt],
      );
      await connection.query(
        'UPDATE auth_sessions SET expires_at = ? WHERE id = ?',
        [expiresAt, row.session_id],
      );
      return {
        status: 'rotated',
        session: { id: row.session_id, familyId: row.family_id, accountId: row.account_id, expiresAt },
        account: mapAccount({ ...row, id: row.account_id }),
      };
    });
  },

  async findActiveSession({ sessionId, accountId, now }) {
    const [[row]] = await pool.query(
      `SELECT
         s.id AS session_id,
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
         AND s.expires_at > ?
         AND a.status = 'active'`,
      [sessionId, accountId, now],
    );
    return row ? { session: { id: row.session_id }, account: mapAccount(row) } : null;
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
