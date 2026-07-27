DELETE FROM auth_role_permissions
WHERE permission_id IN (
  'cv.analysis.create',
  'cv.analysis.read_own',
  'cv.analysis.delete_own',
  'cv.report.read_own'
);

DELETE FROM auth_permissions
WHERE id IN (
  'cv.analysis.create',
  'cv.analysis.read_own',
  'cv.analysis.delete_own',
  'cv.report.read_own'
);

DROP TABLE IF EXISTS cv_analyses;
