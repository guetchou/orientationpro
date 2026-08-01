CREATE TABLE ats_application_evaluations_v1 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  evaluator_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  evaluator_role VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  application_state_at_evaluation ENUM(
    'submitted','under_review','shortlisted','interview_planned',
    'interview_completed','offer_proposed','hired','rejected','withdrawn'
  ) NOT NULL,
  rating TINYINT UNSIGNED NULL,
  recommendation ENUM('advance','hold','reject') NOT NULL,
  note VARCHAR(2000) NULL,
  occurred_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ats_evaluations_application_time (application_id, occurred_at, id),
  CONSTRAINT fk_ats_evaluations_application FOREIGN KEY (application_id) REFERENCES ats_applications_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_evaluations_organization FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_evaluations_evaluator FOREIGN KEY (evaluator_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT chk_ats_evaluations_rating CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
) ENGINE=InnoDB;
