CREATE TABLE auth_accounts (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_verification',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_auth_accounts_email UNIQUE (email),
  CONSTRAINT chk_auth_accounts_status CHECK (status IN ('pending_verification', 'active', 'suspended', 'disabled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE auth_roles (
  id VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

INSERT INTO auth_roles (id) VALUES
  ('user'), ('conseiller'), ('coach'), ('recruteur'), ('rh'), ('admin'), ('super_admin');

CREATE TABLE auth_permissions (
  id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE auth_role_permissions (
  role_id VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  permission_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_auth_role_permissions_role FOREIGN KEY (role_id) REFERENCES auth_roles(id),
  CONSTRAINT fk_auth_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES auth_permissions(id)
) ENGINE=InnoDB;

CREATE TABLE auth_account_roles (
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  role_id VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (account_id, role_id),
  CONSTRAINT fk_auth_account_roles_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_auth_account_roles_role FOREIGN KEY (role_id) REFERENCES auth_roles(id)
) ENGINE=InnoDB;

CREATE TABLE auth_email_verification_tokens (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  consumed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_auth_email_verification_account (account_id),
  CONSTRAINT fk_auth_email_verification_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auth_password_reset_tokens (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  consumed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_auth_password_reset_account (account_id),
  CONSTRAINT fk_auth_password_reset_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auth_sessions (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  family_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_auth_sessions_account (account_id),
  KEY idx_auth_sessions_family (family_id),
  KEY idx_auth_sessions_active (account_id, revoked_at, expires_at),
  CONSTRAINT fk_auth_sessions_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE auth_refresh_tokens (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  session_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_auth_refresh_session (session_id),
  CONSTRAINT fk_auth_refresh_session FOREIGN KEY (session_id) REFERENCES auth_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;
