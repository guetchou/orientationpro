ALTER TABLE ats_application_events_v1
  DROP FOREIGN KEY fk_ats_application_events_organization,
  DROP INDEX idx_ats_application_events_org_time,
  DROP COLUMN organization_id;

ALTER TABLE ats_applications_v1
  DROP FOREIGN KEY fk_ats_applications_organization,
  DROP INDEX idx_ats_applications_org_job_state,
  DROP COLUMN organization_id;
