DELETE FROM orientation_guest_sessions;

ALTER TABLE orientation_results
  DROP CHECK chk_orientation_result_owner,
  DROP FOREIGN KEY fk_orientation_results_guest,
  DROP INDEX idx_orientation_results_guest,
  DROP COLUMN guest_session_id,
  MODIFY account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL;

ALTER TABLE orientation_riasec_attempts
  DROP CHECK chk_orientation_riasec_attempt_owner,
  DROP FOREIGN KEY fk_orientation_riasec_attempts_guest,
  DROP INDEX idx_orientation_riasec_attempts_guest,
  DROP COLUMN guest_session_id,
  MODIFY account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL;

DROP TABLE orientation_guest_sessions;
