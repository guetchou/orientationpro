CREATE TABLE career_catalog_sources (
  id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  source_kind VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  source_version VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  license_name VARCHAR(128) NOT NULL,
  license_url TEXT NOT NULL,
  attribution_text TEXT NOT NULL,
  content_sha256 CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  record_count INT UNSIGNED NOT NULL DEFAULT 0,
  metadata_json JSON NOT NULL,
  imported_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_career_catalog_source_version UNIQUE (source_kind, source_version, locale),
  CONSTRAINT chk_career_catalog_source_kind CHECK (source_kind IN ('onet', 'esco', 'internal'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_occupations (
  id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  catalog_source_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  source_code VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  preferred_label VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'active',
  isco_code VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NULL,
  job_zone TINYINT UNSIGNED NULL,
  riasec_r DECIMAL(6,3) NULL,
  riasec_i DECIMAL(6,3) NULL,
  riasec_a DECIMAL(6,3) NULL,
  riasec_s DECIMAL(6,3) NULL,
  riasec_e DECIMAL(6,3) NULL,
  riasec_c DECIMAL(6,3) NULL,
  riasec_display_code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL,
  riasec_profile_status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'missing',
  riasec_provenance_json JSON NOT NULL,
  local_relevance_status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unreviewed',
  local_relevance_notes TEXT NULL,
  metadata_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_career_occupation_source UNIQUE (catalog_source_id, source_code, locale),
  KEY idx_career_occupations_label (preferred_label),
  KEY idx_career_occupations_isco (isco_code),
  KEY idx_career_occupations_riasec (riasec_profile_status, riasec_display_code),
  FULLTEXT KEY ftx_career_occupations_search (preferred_label, description),
  CONSTRAINT fk_career_occupations_source FOREIGN KEY (catalog_source_id)
    REFERENCES career_catalog_sources(id) ON DELETE RESTRICT,
  CONSTRAINT chk_career_occupation_status CHECK (status IN ('active', 'retired')),
  CONSTRAINT chk_career_occupation_riasec_status CHECK (riasec_profile_status IN ('direct', 'mapped', 'reviewed', 'missing')),
  CONSTRAINT chk_career_occupation_local_status CHECK (local_relevance_status IN ('unreviewed', 'relevant', 'limited', 'excluded')),
  CONSTRAINT chk_career_occupation_job_zone CHECK (job_zone IS NULL OR job_zone BETWEEN 1 AND 5),
  CONSTRAINT chk_career_occupation_riasec_range CHECK (
    (riasec_r IS NULL OR riasec_r BETWEEN 0 AND 100) AND
    (riasec_i IS NULL OR riasec_i BETWEEN 0 AND 100) AND
    (riasec_a IS NULL OR riasec_a BETWEEN 0 AND 100) AND
    (riasec_s IS NULL OR riasec_s BETWEEN 0 AND 100) AND
    (riasec_e IS NULL OR riasec_e BETWEEN 0 AND 100) AND
    (riasec_c IS NULL OR riasec_c BETWEEN 0 AND 100)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_occupation_aliases (
  occupation_id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  alias VARCHAR(255) NOT NULL,
  alias_kind VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'alternate',
  source_reference VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (occupation_id, locale, alias),
  FULLTEXT KEY ftx_career_occupation_aliases_search (alias),
  CONSTRAINT fk_career_occupation_aliases_occupation FOREIGN KEY (occupation_id)
    REFERENCES career_occupations(id) ON DELETE CASCADE,
  CONSTRAINT chk_career_occupation_alias_kind CHECK (alias_kind IN ('alternate', 'short', 'translated', 'local'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_skills (
  id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  catalog_source_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  source_code VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  locale VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  preferred_label VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  skill_kind VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  metadata_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_career_skill_source UNIQUE (catalog_source_id, source_code, locale),
  FULLTEXT KEY ftx_career_skills_search (preferred_label, description),
  CONSTRAINT fk_career_skills_source FOREIGN KEY (catalog_source_id)
    REFERENCES career_catalog_sources(id) ON DELETE RESTRICT,
  CONSTRAINT chk_career_skill_kind CHECK (skill_kind IN ('skill', 'knowledge', 'competence', 'ability', 'technology'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_occupation_skill_links (
  occupation_id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  skill_id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  relation_kind VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  importance_score DECIMAL(6,3) NULL,
  provenance_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (occupation_id, skill_id, relation_kind),
  KEY idx_career_occupation_skill_links_skill (skill_id),
  CONSTRAINT fk_career_occupation_skill_links_occupation FOREIGN KEY (occupation_id)
    REFERENCES career_occupations(id) ON DELETE CASCADE,
  CONSTRAINT fk_career_occupation_skill_links_skill FOREIGN KEY (skill_id)
    REFERENCES career_skills(id) ON DELETE CASCADE,
  CONSTRAINT chk_career_occupation_skill_relation CHECK (relation_kind IN ('essential', 'optional', 'important', 'related')),
  CONSTRAINT chk_career_occupation_skill_importance CHECK (importance_score IS NULL OR importance_score BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_occupation_crosswalks (
  source_occupation_id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  target_occupation_id VARCHAR(160) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  mapping_kind VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  confidence_score DECIMAL(6,3) NOT NULL,
  provenance_json JSON NOT NULL,
  reviewed_by_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
  reviewed_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (source_occupation_id, target_occupation_id, mapping_kind),
  KEY idx_career_occupation_crosswalks_target (target_occupation_id),
  CONSTRAINT fk_career_occupation_crosswalks_source FOREIGN KEY (source_occupation_id)
    REFERENCES career_occupations(id) ON DELETE CASCADE,
  CONSTRAINT fk_career_occupation_crosswalks_target FOREIGN KEY (target_occupation_id)
    REFERENCES career_occupations(id) ON DELETE CASCADE,
  CONSTRAINT fk_career_occupation_crosswalks_reviewer FOREIGN KEY (reviewed_by_account_id)
    REFERENCES auth_accounts(id) ON DELETE SET NULL,
  CONSTRAINT chk_career_occupation_crosswalk_kind CHECK (mapping_kind IN ('exact', 'close', 'broad', 'narrow', 'manual')),
  CONSTRAINT chk_career_occupation_crosswalk_confidence CHECK (confidence_score BETWEEN 0 AND 100),
  CONSTRAINT chk_career_occupation_crosswalk_distinct CHECK (source_occupation_id <> target_occupation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE career_match_snapshots (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  orientation_result_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  algorithm_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  catalog_versions_json JSON NOT NULL,
  filters_json JSON NOT NULL,
  matches_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT uq_career_match_snapshot UNIQUE (orientation_result_id, algorithm_version),
  CONSTRAINT fk_career_match_snapshots_result FOREIGN KEY (orientation_result_id)
    REFERENCES orientation_results(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
