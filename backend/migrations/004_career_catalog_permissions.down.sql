DELETE FROM auth_role_permissions
WHERE permission_id IN ('career.catalog.read', 'career.match.read_own');

DELETE FROM auth_permissions
WHERE id IN ('career.catalog.read', 'career.match.read_own');
