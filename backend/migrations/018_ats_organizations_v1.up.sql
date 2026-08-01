CREATE TABLE ats_organizations_v1 (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE ats_organization_members_v1 (
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  organization_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  added_by_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  added_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_ats_org_members_org (organization_id),
  CONSTRAINT fk_ats_org_members_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_ats_org_members_org FOREIGN KEY (organization_id) REFERENCES ats_organizations_v1(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ats_org_members_added_by FOREIGN KEY (added_by_account_id) REFERENCES auth_accounts(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
