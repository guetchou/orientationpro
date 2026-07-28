ALTER TABLE career_occupation_crosswalks
  MODIFY confidence_score DECIMAL(6,3) NOT NULL;

ALTER TABLE career_occupation_crosswalks
  DROP CHECK chk_career_crosswalk_review_status,
  DROP CHECK chk_career_crosswalk_confidence_level,
  DROP INDEX idx_career_crosswalk_presentation,
  DROP COLUMN mapped_at,
  DROP COLUMN source_version,
  DROP COLUMN source_reference,
  DROP COLUMN review_status,
  DROP COLUMN confidence_level;
