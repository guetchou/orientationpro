CREATE TABLE IF NOT EXISTS career_recommendation_snapshots (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  orientation_result_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  recommendation_algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  riasec_algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  preparation_adapter_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  requested_locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  include_locally_excluded BOOLEAN NOT NULL DEFAULT FALSE,
  limit_count SMALLINT UNSIGNED NOT NULL,
  input_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  profile_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  onet_sources_json JSON NOT NULL,
  esco_sources_json JSON NOT NULL,
  snapshot_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_career_snapshot_account FOREIGN KEY (account_id)
    REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_career_snapshot_result FOREIGN KEY (orientation_result_id)
    REFERENCES orientation_results(id) ON DELETE CASCADE,
  CONSTRAINT uq_career_snapshot_input UNIQUE (
    account_id,
    orientation_result_id,
    recommendation_algorithm_version,
    requested_locale,
    include_locally_excluded,
    limit_count,
    input_fingerprint
  ),
  INDEX idx_career_snapshot_account_created (account_id, created_at),
  INDEX idx_career_snapshot_result (orientation_result_id, created_at),
  CONSTRAINT chk_career_snapshot_limit CHECK (limit_count BETWEEN 1 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
