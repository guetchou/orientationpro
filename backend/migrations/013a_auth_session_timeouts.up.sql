ALTER TABLE auth_sessions
  ADD COLUMN last_activity_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER account_id,
  ADD COLUMN idle_expires_at DATETIME(3) NULL AFTER last_activity_at,
  ADD COLUMN absolute_expires_at DATETIME(3) NULL AFTER idle_expires_at;

UPDATE auth_sessions
SET
  idle_expires_at = LEAST(expires_at, DATE_ADD(COALESCE(updated_at, created_at), INTERVAL 30 MINUTE)),
  absolute_expires_at = LEAST(expires_at, DATE_ADD(created_at, INTERVAL 12 HOUR));

ALTER TABLE auth_sessions
  MODIFY idle_expires_at DATETIME(3) NOT NULL
    DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 30 MINUTE),
  MODIFY absolute_expires_at DATETIME(3) NOT NULL
    DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 12 HOUR),
  ADD KEY idx_auth_sessions_timeouts (account_id, revoked_at, idle_expires_at, absolute_expires_at);
