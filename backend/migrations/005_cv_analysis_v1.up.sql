CREATE TABLE cv_analyses (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,

  file_name VARCHAR(180) NOT NULL,
  mime_type VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  page_count SMALLINT UNSIGNED NULL,
  source_sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,

  detected_language VARCHAR(8) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  general_readiness TINYINT UNSIGNED NOT NULL,
  target_relevance TINYINT UNSIGNED NULL,
  target_title VARCHAR(255) NULL,

  analysis_snapshot JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  KEY idx_cv_analyses_account_created (
    account_id,
    created_at,
    id
  ),

  KEY idx_cv_analyses_account_source (
    account_id,
    source_sha256
  ),

  CONSTRAINT fk_cv_analyses_account
    FOREIGN KEY (account_id)
    REFERENCES auth_accounts(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_cv_analyses_file_name
    CHECK (file_name <> ''),

  CONSTRAINT chk_cv_analyses_algorithm_version
    CHECK (algorithm_version <> ''),

  CONSTRAINT chk_cv_analyses_mime_type
    CHECK (
      mime_type IN (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ),

  CONSTRAINT chk_cv_analyses_file_size
    CHECK (file_size BETWEEN 1 AND 5242880),

  CONSTRAINT chk_cv_analyses_page_count
    CHECK (page_count IS NULL OR page_count > 0),

  CONSTRAINT chk_cv_analyses_language
    CHECK (detected_language IN ('fr', 'en', 'und')),

  CONSTRAINT chk_cv_analyses_general_readiness
    CHECK (general_readiness <= 100),

  CONSTRAINT chk_cv_analyses_target_relevance
    CHECK (
      target_relevance IS NULL
      OR target_relevance <= 100
    )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO auth_permissions (id, description) VALUES
  (
    'cv.analysis.create',
    'Créer une analyse de CV pour son propre Compte'
  ),
  (
    'cv.analysis.read_own',
    'Consulter ses propres analyses de CV'
  ),
  (
    'cv.analysis.delete_own',
    'Supprimer ses propres analyses de CV'
  ),
  (
    'cv.report.read_own',
    'Consulter les rapports de ses propres analyses de CV'
  );

INSERT INTO auth_role_permissions (role_id, permission_id) VALUES
  ('user', 'cv.analysis.create'),
  ('user', 'cv.analysis.read_own'),
  ('user', 'cv.analysis.delete_own'),
  ('user', 'cv.report.read_own'),

  ('conseiller', 'cv.analysis.create'),
  ('conseiller', 'cv.analysis.read_own'),
  ('conseiller', 'cv.analysis.delete_own'),
  ('conseiller', 'cv.report.read_own'),

  ('coach', 'cv.analysis.create'),
  ('coach', 'cv.analysis.read_own'),
  ('coach', 'cv.analysis.delete_own'),
  ('coach', 'cv.report.read_own'),

  ('recruteur', 'cv.analysis.create'),
  ('recruteur', 'cv.analysis.read_own'),
  ('recruteur', 'cv.analysis.delete_own'),
  ('recruteur', 'cv.report.read_own'),

  ('rh', 'cv.analysis.create'),
  ('rh', 'cv.analysis.read_own'),
  ('rh', 'cv.analysis.delete_own'),
  ('rh', 'cv.report.read_own'),

  ('admin', 'cv.analysis.create'),
  ('admin', 'cv.analysis.read_own'),
  ('admin', 'cv.analysis.delete_own'),
  ('admin', 'cv.report.read_own'),

  ('super_admin', 'cv.analysis.create'),
  ('super_admin', 'cv.analysis.read_own'),
  ('super_admin', 'cv.analysis.delete_own'),
  ('super_admin', 'cv.report.read_own');
