ALTER TABLE life_projects
  ADD COLUMN diagnostic_json JSON NULL AFTER state,
  ADD COLUMN recommendation_json JSON NULL AFTER diagnostic_json;
