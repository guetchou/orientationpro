CREATE TABLE ats_job_events_v1 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  job_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_role VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  metadata_json JSON NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ats_job_events_job_time (job_id, occurred_at, id),
  CONSTRAINT fk_ats_job_events_job FOREIGN KEY (job_id) REFERENCES ats_jobs_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_job_events_actor FOREIGN KEY (actor_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
