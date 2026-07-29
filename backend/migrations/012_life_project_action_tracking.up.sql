CREATE TABLE IF NOT EXISTS life_project_action_tracking (
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  plan_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  action_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position_index INT UNSIGNED NOT NULL DEFAULT 0,
  status_history_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (project_id, action_id),
  CONSTRAINT fk_life_action_tracking_project FOREIGN KEY (project_id)
    REFERENCES life_projects(id) ON DELETE CASCADE,
  INDEX idx_life_action_tracking_plan_order (project_id, plan_id, position_index, action_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
