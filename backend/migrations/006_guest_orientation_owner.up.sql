CREATE TABLE orientation_guest_sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'active',
  expires_at DATETIME(3) NOT NULL,
  last_seen_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  claimed_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  claimed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_orientation_guest_token UNIQUE (token_hash),
  KEY idx_orientation_guest_expiry (status, expires_at),
  KEY idx_orientation_guest_claimed_account (claimed_account_id, claimed_at),
  CONSTRAINT fk_orientation_guest_claimed_account FOREIGN KEY (claimed_account_id)
    REFERENCES auth_accounts(id) ON DELETE SET NULL,
  CONSTRAINT chk_orientation_guest_status CHECK (status IN ('active', 'claimed', 'expired'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE orientation_riasec_attempts
  MODIFY account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD COLUMN guest_session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER account_id,
  ADD KEY idx_orientation_riasec_attempts_guest (guest_session_id, started_at),
  ADD CONSTRAINT fk_orientation_riasec_attempts_guest FOREIGN KEY (guest_session_id)
    REFERENCES orientation_guest_sessions(id) ON DELETE CASCADE,
  ADD CONSTRAINT chk_orientation_riasec_attempt_owner CHECK (
    (account_id IS NOT NULL AND guest_session_id IS NULL)
    OR (account_id IS NULL AND guest_session_id IS NOT NULL)
  );

ALTER TABLE orientation_results
  MODIFY account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD COLUMN guest_session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER account_id,
  ADD KEY idx_orientation_results_guest (guest_session_id, created_at),
  ADD CONSTRAINT fk_orientation_results_guest FOREIGN KEY (guest_session_id)
    REFERENCES orientation_guest_sessions(id) ON DELETE CASCADE,
  ADD CONSTRAINT chk_orientation_result_owner CHECK (
    (account_id IS NOT NULL AND guest_session_id IS NULL)
    OR (account_id IS NULL AND guest_session_id IS NOT NULL)
  );