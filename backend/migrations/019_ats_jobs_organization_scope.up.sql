ALTER TABLE ats_jobs_v1
  ADD COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER owner_account_id;

UPDATE ats_jobs_v1 j
  JOIN ats_organization_members_v1 m ON m.account_id = j.owner_account_id
  SET j.organization_id = m.organization_id
  WHERE j.organization_id IS NULL;

ALTER TABLE ats_jobs_v1
  MODIFY COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  ADD CONSTRAINT fk_ats_jobs_organization FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  ADD INDEX idx_ats_jobs_org_status (organization_id, status, created_at);

ALTER TABLE ats_job_events_v1
  ADD COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER job_id;

UPDATE ats_job_events_v1 e
  JOIN ats_jobs_v1 j ON j.id = e.job_id
  SET e.organization_id = j.organization_id
  WHERE e.organization_id IS NULL;

ALTER TABLE ats_job_events_v1
  MODIFY COLUMN organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  ADD CONSTRAINT fk_ats_job_events_organization FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  ADD INDEX idx_ats_job_events_org_time (organization_id, occurred_at, id);
