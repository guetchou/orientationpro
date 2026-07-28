ALTER TABLE career_occupation_crosswalks
  MODIFY confidence_score DECIMAL(6,3) NULL,
  ADD COLUMN confidence_level VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'unknown' AFTER confidence_score,
  ADD COLUMN review_status VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'proposed' AFTER confidence_level,
  ADD COLUMN source_reference TEXT NULL AFTER review_status,
  ADD COLUMN source_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER source_reference,
  ADD COLUMN mapped_at DATE NULL AFTER source_version,
  ADD KEY idx_career_crosswalk_presentation (source_occupation_id, review_status, confidence_level, confidence_score),
  ADD CONSTRAINT chk_career_crosswalk_confidence_level
    CHECK (confidence_level IN ('high', 'medium', 'low', 'unknown')),
  ADD CONSTRAINT chk_career_crosswalk_review_status
    CHECK (review_status IN ('proposed', 'official', 'reviewed', 'rejected'));
