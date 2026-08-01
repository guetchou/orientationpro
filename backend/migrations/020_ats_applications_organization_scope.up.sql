ALTER TABLE ats_applications_v1
  ADD COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER job_id;

UPDATE ats_applications_v1 a
  JOIN ats_jobs_v1 j ON j.id = a.job_id
  SET a.organization_id = j.organization_id
  WHERE a.organization_id IS NULL;

ALTER TABLE ats_applications_v1
  MODIFY COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  ADD CONSTRAINT fk_ats_applications_organization FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  ADD INDEX idx_ats_applications_org_job_state (organization_id, job_id, state);

ALTER TABLE ats_application_events_v1
  ADD COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER application_id;

UPDATE ats_application_events_v1 e
  JOIN ats_applications_v1 a ON a.id = e.application_id
  SET e.organization_id = a.organization_id
  WHERE e.organization_id IS NULL;

ALTER TABLE ats_application_events_v1
  MODIFY COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  ADD CONSTRAINT fk_ats_application_events_organization FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  ADD INDEX idx_ats_application_events_org_time (organization_id, occurred_at, id);
