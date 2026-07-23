CREATE TABLE orientation_riasec_instruments (
  id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  slug VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  version INT UNSIGNED NOT NULL,
  locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'draft',
  title VARCHAR(255) NOT NULL,
  response_scale JSON NOT NULL,
  methodology TEXT NOT NULL,
  source_kind VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  source_reference TEXT NOT NULL,
  license_text TEXT NOT NULL,
  disclaimer TEXT NOT NULL,
  scoring_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  content_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_orientation_riasec_instrument_version UNIQUE (slug, version, locale),
  CONSTRAINT chk_orientation_riasec_instrument_status CHECK (status IN ('draft', 'pilot', 'active', 'retired'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orientation_riasec_items (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  instrument_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  dimension CHAR(1) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  prompt TEXT NOT NULL,
  reverse_scored BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_orientation_riasec_item_position UNIQUE (instrument_id, position),
  KEY idx_orientation_riasec_items_instrument (instrument_id),
  CONSTRAINT fk_orientation_riasec_items_instrument FOREIGN KEY (instrument_id)
    REFERENCES orientation_riasec_instruments(id) ON DELETE RESTRICT,
  CONSTRAINT chk_orientation_riasec_item_dimension CHECK (dimension IN ('R', 'I', 'A', 'S', 'E', 'C'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orientation_riasec_attempts (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  instrument_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'in_progress',
  item_order JSON NOT NULL,
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  KEY idx_orientation_riasec_attempts_account (account_id, started_at),
  KEY idx_orientation_riasec_attempts_status (account_id, status),
  CONSTRAINT fk_orientation_riasec_attempts_account FOREIGN KEY (account_id)
    REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_orientation_riasec_attempts_instrument FOREIGN KEY (instrument_id)
    REFERENCES orientation_riasec_instruments(id) ON DELETE RESTRICT,
  CONSTRAINT chk_orientation_riasec_attempt_status CHECK (status IN ('in_progress', 'completed', 'abandoned'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orientation_riasec_responses (
  attempt_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  item_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  value TINYINT UNSIGNED NOT NULL,
  answered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (attempt_id, item_id),
  KEY idx_orientation_riasec_responses_item (item_id),
  CONSTRAINT fk_orientation_riasec_responses_attempt FOREIGN KEY (attempt_id)
    REFERENCES orientation_riasec_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_orientation_riasec_responses_item FOREIGN KEY (item_id)
    REFERENCES orientation_riasec_items(id) ON DELETE RESTRICT,
  CONSTRAINT chk_orientation_riasec_response_value CHECK (value BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orientation_results (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  attempt_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  instrument_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  result_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'riasec',
  algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  primary_code CHAR(3) CHARACTER SET ascii COLLATE ascii_bin NULL,
  display_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  scores_json JSON NOT NULL,
  ranking_json JSON NOT NULL,
  differentiation_json JSON NOT NULL,
  response_pattern_json JSON NOT NULL,
  result_snapshot JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_orientation_results_attempt UNIQUE (attempt_id),
  KEY idx_orientation_results_account (account_id, created_at),
  KEY idx_orientation_results_instrument (instrument_id),
  CONSTRAINT fk_orientation_results_attempt FOREIGN KEY (attempt_id)
    REFERENCES orientation_riasec_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_orientation_results_account FOREIGN KEY (account_id)
    REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_orientation_results_instrument FOREIGN KEY (instrument_id)
    REFERENCES orientation_riasec_instruments(id) ON DELETE RESTRICT,
  CONSTRAINT chk_orientation_results_type CHECK (result_type IN ('riasec'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO auth_permissions (id, description) VALUES
  ('orientation.result.create', 'Créer un Résultat d’orientation pour son propre Compte'),
  ('orientation.result.read_own', 'Lire les Résultats d’orientation de son propre Compte'),
  ('orientation.result.read_assigned', 'Lire un Résultat d’orientation dans le cadre d’un accompagnement explicitement attribué');

INSERT INTO auth_role_permissions (role_id, permission_id) VALUES
  ('user', 'orientation.result.create'),
  ('user', 'orientation.result.read_own'),
  ('conseiller', 'orientation.result.create'),
  ('conseiller', 'orientation.result.read_own'),
  ('coach', 'orientation.result.create'),
  ('coach', 'orientation.result.read_own'),
  ('recruteur', 'orientation.result.create'),
  ('recruteur', 'orientation.result.read_own'),
  ('rh', 'orientation.result.create'),
  ('rh', 'orientation.result.read_own'),
  ('admin', 'orientation.result.create'),
  ('admin', 'orientation.result.read_own'),
  ('super_admin', 'orientation.result.create'),
  ('super_admin', 'orientation.result.read_own'),
  ('conseiller', 'orientation.result.read_assigned'),
  ('coach', 'orientation.result.read_assigned'),
  ('admin', 'orientation.result.read_assigned'),
  ('super_admin', 'orientation.result.read_assigned');
