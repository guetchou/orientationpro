CREATE TABLE IF NOT EXISTS account_profiles (
  account_id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  city VARCHAR(120) NULL,
  country_code CHAR(2) NULL,
  current_situation ENUM('student','employee','job_seeker','entrepreneur','career_change','other') NULL,
  primary_goal ENUM('choose_studies','find_job','career_change','improve_skills','start_business','other') NULL,
  mobility_scope ENUM('local','national','international','remote','unknown') NULL,
  profile_summary TEXT NULL,
  completion_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_account_profiles_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT chk_account_profiles_completion CHECK (completion_percent BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS account_education_history (
  id CHAR(36) PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  education_level ENUM('primary','middle_school','high_school','baccalaureate','vocational','bac_plus_1','bac_plus_2','licence','master','doctorate','other') NOT NULL,
  status ENUM('in_progress','completed','interrupted') NOT NULL,
  diploma_name VARCHAR(255) NULL,
  field_of_study VARCHAR(255) NULL,
  institution VARCHAR(255) NULL,
  country_code CHAR(2) NULL,
  start_year SMALLINT UNSIGNED NULL,
  end_year SMALLINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_education_account (account_id),
  CONSTRAINT fk_education_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account_profile_skills (
  id CHAR(36) PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  label VARCHAR(255) NOT NULL,
  esco_uri VARCHAR(512) NULL,
  proficiency ENUM('beginner','intermediate','advanced','expert','unknown') NOT NULL DEFAULT 'unknown',
  source ENUM('declared','test','cv','inferred') NOT NULL DEFAULT 'declared',
  confirmation_status ENUM('proposed','confirmed','rejected') NOT NULL DEFAULT 'confirmed',
  evidence TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profile_skills_account (account_id),
  INDEX idx_profile_skills_esco (esco_uri(191)),
  CONSTRAINT fk_profile_skills_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account_profile_hypotheses (
  id CHAR(36) PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  hypothesis_type VARCHAR(80) NOT NULL,
  value_json JSON NOT NULL,
  rationale TEXT NOT NULL,
  confidence DECIMAL(4,3) NULL,
  status ENUM('proposed','confirmed','rejected') NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profile_hypotheses_account (account_id),
  CONSTRAINT fk_profile_hypotheses_account FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT chk_profile_hypotheses_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);