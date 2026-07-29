CREATE TABLE IF NOT EXISTS life_projects (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  owner_account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  purpose TEXT NULL,
  state VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  missing_information_json JSON NOT NULL,
  uncertainty_json JSON NOT NULL,
  provenance_json JSON NOT NULL,
  lock_version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_life_project_owner FOREIGN KEY (owner_account_id)
    REFERENCES auth_accounts(id) ON DELETE CASCADE,
  CONSTRAINT chk_life_project_state CHECK (state IN (
    'exploration', 'clarification', 'comparison', 'provisional_choice',
    'preparation', 'experimentation', 'action', 'follow_up',
    'confirmation', 'reorientation'
  )),
  CONSTRAINT chk_life_project_lock_version CHECK (lock_version >= 1),
  INDEX idx_life_project_owner_updated (owner_account_id, updated_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_scenarios (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  horizon VARCHAR(255) NULL,
  status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  option_type VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  assumptions_json JSON NOT NULL,
  barriers_json JSON NOT NULL,
  supports_json JSON NOT NULL,
  missing_information_json JSON NOT NULL,
  uncertainty_json JSON NOT NULL,
  provenance_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_life_scenario_project FOREIGN KEY (project_id)
    REFERENCES life_projects(id) ON DELETE CASCADE,
  CONSTRAINT uq_life_scenario_scope UNIQUE (project_id, id),
  CONSTRAINT chk_life_scenario_status CHECK (status IN (
    'exploring', 'candidate', 'active', 'paused', 'discarded'
  )),
  INDEX idx_life_scenario_project_status (project_id, status, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_active_scenarios (
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  scenario_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  selected_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_life_active_scenario FOREIGN KEY (project_id, scenario_id)
    REFERENCES life_project_scenarios(project_id, id) ON DELETE CASCADE,
  INDEX idx_life_active_scenario (scenario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_criteria (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT NULL,
  direction VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  importance DECIMAL(6,5) NULL,
  provenance_json JSON NOT NULL,
  CONSTRAINT fk_life_criterion_project FOREIGN KEY (project_id)
    REFERENCES life_projects(id) ON DELETE CASCADE,
  CONSTRAINT uq_life_criterion_scope UNIQUE (project_id, id),
  CONSTRAINT chk_life_criterion_direction CHECK (direction IN ('maximize', 'minimize', 'target')),
  CONSTRAINT chk_life_criterion_importance CHECK (importance IS NULL OR importance BETWEEN 0 AND 1),
  INDEX idx_life_criterion_project (project_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_action_plans (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  scenario_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  missing_information_json JSON NOT NULL,
  provenance_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_life_plan_scenario FOREIGN KEY (project_id, scenario_id)
    REFERENCES life_project_scenarios(project_id, id) ON DELETE CASCADE,
  CONSTRAINT uq_life_plan_scope UNIQUE (project_id, id),
  CONSTRAINT chk_life_plan_status CHECK (status IN ('draft', 'active', 'completed', 'paused', 'cancelled')),
  INDEX idx_life_plan_project_status (project_id, status, updated_at),
  INDEX idx_life_plan_scenario (scenario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_action_items (
  id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  action_plan_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  schema_version VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  due_at DATETIME(3) NULL,
  completed_at DATETIME(3) NULL,
  evidence_ids_json JSON NOT NULL,
  blocking_reasons_json JSON NOT NULL,
  provenance_json JSON NOT NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_life_item_plan FOREIGN KEY (project_id, action_plan_id)
    REFERENCES life_project_action_plans(project_id, id) ON DELETE CASCADE,
  CONSTRAINT uq_life_item_scope UNIQUE (project_id, id),
  CONSTRAINT chk_life_item_status CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked', 'cancelled')),
  INDEX idx_life_item_plan_status (action_plan_id, status, updated_at),
  INDEX idx_life_item_project_due (project_id, due_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS life_project_events (
  event_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  project_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  sequence_no BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  from_state VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL,
  to_state VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  actor_kind VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  actor_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NULL,
  reason TEXT NULL,
  provenance_json JSON NOT NULL,
  CONSTRAINT fk_life_event_project FOREIGN KEY (project_id)
    REFERENCES life_projects(id) ON DELETE CASCADE,
  CONSTRAINT uq_life_event_sequence UNIQUE (project_id, sequence_no),
  CONSTRAINT chk_life_event_type CHECK (event_type IN ('state_transition', 'scenario_selection')),
  INDEX idx_life_event_project_time (project_id, occurred_at, sequence_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;