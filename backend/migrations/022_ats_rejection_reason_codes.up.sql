ALTER TABLE ats_application_events_v1
  ADD COLUMN reason_code ENUM(
    'not_qualified','position_filled','duplicate_application','failed_assessment',
    'salary_expectation_mismatch','candidate_unresponsive','role_cancelled','other'
  ) NULL AFTER reason;
