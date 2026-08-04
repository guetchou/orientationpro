ALTER TABLE auth_sessions
  DROP KEY idx_auth_sessions_timeouts,
  DROP COLUMN absolute_expires_at,
  DROP COLUMN idle_expires_at,
  DROP COLUMN last_activity_at;
