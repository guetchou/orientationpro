ALTER TABLE ats_job_events_v1
  DROP FOREIGN KEY fk_ats_job_events_organization,
  DROP INDEX idx_ats_job_events_org_time,
  DROP COLUMN organization_id;

ALTER TABLE ats_jobs_v1
  DROP FOREIGN KEY fk_ats_jobs_organization,
  DROP INDEX idx_ats_jobs_org_status,
  DROP COLUMN organization_id;
