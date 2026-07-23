const createPermissionChecker = (pool) => async ({ accountId, permissionId }) => {
  const [[row]] = await pool.query(
    `SELECT 1 AS allowed
     FROM auth_account_roles account_role
     JOIN auth_role_permissions role_permission
       ON role_permission.role_id = account_role.role_id
     WHERE account_role.account_id = ?
       AND role_permission.permission_id = ?
     LIMIT 1`,
    [accountId, permissionId],
  );
  return Boolean(row?.allowed);
};

module.exports = {
  createPermissionChecker,
};
