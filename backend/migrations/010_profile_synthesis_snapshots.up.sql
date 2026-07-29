CREATE TABLE IF NOT EXISTS profile_synthesis_snapshots (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  orientation_result_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  career_recommendation_snapshot_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  synthesis_schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  synthesis_engine_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  riasec_algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  recommendation_algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  input_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  snapshot_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_profile_synthesis_account FOREIGN KEY (account_id)
    REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_profile_synthesis_orientation_result FOREIGN KEY (orientation_result_id)
    REFERENCES orientation_results(id) ON DELETE CASCADE,
  CONSTRAINT fk_profile_synthesis_recommendation_snapshot
    FOREIGN KEY (career_recommendation_snapshot_id)
    REFERENCES career_recommendation_snapshots(id) ON DELETE CASCADE,
  CONSTRAINT uq_profile_synthesis_input UNIQUE (
    account_id,
    synthesis_engine_version,
    input_fingerprint
  ),
  INDEX idx_profile_synthesis_account_created (account_id, created_at),
  INDEX idx_profile_synthesis_orientation_result (orientation_result_id, created_at),
  INDEX idx_profile_synthesis_recommendation (career_recommendation_snapshot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
