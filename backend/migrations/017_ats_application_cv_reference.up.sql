ALTER TABLE ats_applications_v1
  ADD COLUMN cv_analysis_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER candidate_account_id,
  ADD CONSTRAINT fk_ats_applications_cv_analysis
    FOREIGN KEY (cv_analysis_id) REFERENCES cv_analyses(id) ON DELETE SET NULL;
