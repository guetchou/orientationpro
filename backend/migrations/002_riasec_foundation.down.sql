DELETE FROM auth_role_permissions
WHERE permission_id IN (
  'orientation.result.create',
  'orientation.result.read_own',
  'orientation.result.read_assigned'
);

DELETE FROM auth_permissions
WHERE id IN (
  'orientation.result.create',
  'orientation.result.read_own',
  'orientation.result.read_assigned'
);

DROP TABLE IF EXISTS orientation_results;
DROP TABLE IF EXISTS orientation_riasec_responses;
DROP TABLE IF EXISTS orientation_riasec_attempts;
DROP TABLE IF EXISTS orientation_riasec_items;
DROP TABLE IF EXISTS orientation_riasec_instruments;
