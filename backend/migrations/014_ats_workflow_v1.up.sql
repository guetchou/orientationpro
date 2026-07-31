CREATE TABLE ats_jobs_v1 (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  owner_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  version INT UNSIGNED NOT NULL DEFAULT 1,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX idx_ats_jobs_owner_status (owner_account_id, status),
  CONSTRAINT fk_ats_jobs_owner FOREIGN KEY (owner_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ats_job_recruiters_v1 (
  job_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  recruiter_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assigned_by_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (job_id, recruiter_account_id),
  CONSTRAINT fk_ats_job_recruiters_job FOREIGN KEY (job_id) REFERENCES ats_jobs_v1(id) ON DELETE CASCADE,
  CONSTRAINT fk_ats_job_recruiters_recruiter FOREIGN KEY (recruiter_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_job_recruiters_assigner FOREIGN KEY (assigned_by_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ats_applications_v1 (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  job_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  candidate_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  state ENUM('submitted','under_review','shortlisted','interview_planned','interview_completed','offer_proposed','hired','rejected','withdrawn') NOT NULL DEFAULT 'submitted',
  version INT UNSIGNED NOT NULL DEFAULT 1,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_ats_application_job_candidate (job_id, candidate_account_id),
  INDEX idx_ats_applications_candidate (candidate_account_id, submitted_at),
  INDEX idx_ats_applications_job_state (job_id, state, updated_at),
  CONSTRAINT fk_ats_applications_job FOREIGN KEY (job_id) REFERENCES ats_jobs_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_applications_candidate FOREIGN KEY (candidate_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE ats_application_events_v1 (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  from_state ENUM('submitted','under_review','shortlisted','interview_planned','interview_completed','offer_proposed','hired','rejected','withdrawn') NOT NULL,
  to_state ENUM('submitted','under_review','shortlisted','interview_planned','interview_completed','offer_proposed','hired','rejected','withdrawn') NOT NULL,
  actor_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_role VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  reason VARCHAR(1000) NULL,
  metadata_json JSON NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ats_events_application_time (application_id, occurred_at, id),
  CONSTRAINT fk_ats_events_application FOREIGN KEY (application_id) REFERENCES ats_applications_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_events_actor FOREIGN KEY (actor_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;