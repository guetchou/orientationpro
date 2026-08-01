'use strict';

const createOrganizationStore = (pool) => {
  if (!pool || typeof pool.query !== 'function') {
    throw new Error('A MySQL pool is required for ATS organization lookups.');
  }

  const getMemberOrganizationId = async (accountId, connection = pool) => {
    const [rows] = await connection.query(
      'SELECT organization_id FROM ats_organization_members_v1 WHERE account_id = ? LIMIT 1',
      [accountId],
    );
    return rows[0]?.organization_id ?? null;
  };

  const isOrganizationMember = async ({ accountId, organizationId, connection = pool }) => {
    const [rows] = await connection.query(
      'SELECT 1 FROM ats_organization_members_v1 WHERE account_id = ? AND organization_id = ? LIMIT 1',
      [accountId, organizationId],
    );
    return rows.length > 0;
  };

  return Object.freeze({ getMemberOrganizationId, isOrganizationMember });
};

module.exports = { createOrganizationStore };
