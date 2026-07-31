'use strict';

const normalizeRoles = (account = {}) => Array.isArray(account.roles) ? account.roles : [];
const hasRole = (account, role) => normalizeRoles(account).includes(role);

const createAtsAuthorizer = (pool) => {
  if (!pool || typeof pool.query !== 'function') throw new Error('A MySQL pool is required.');

  const canReadApplication = async ({ account, application, connection = pool }) => {
    if (!account || !application) return false;
    if (application.candidateAccountId === account.id) return true;
    if (hasRole(account, 'admin') || hasRole(account, 'recruitment_manager')) return true;
    if (!hasRole(account, 'recruiter')) return false;
    const [rows] = await connection.query(
      'SELECT 1 FROM ats_job_recruiters_v1 WHERE job_id = ? AND recruiter_account_id = ? LIMIT 1',
      [application.jobId, account.id],
    );
    return rows.length > 0;
  };

  const transitionRole = ({ account, to }) => {
    if (to === 'withdrawn') return hasRole(account, 'candidate') || hasRole(account, 'user') ? 'candidate' : null;
    if (hasRole(account, 'admin')) return 'admin';
    if (hasRole(account, 'recruitment_manager')) return 'recruitment_manager';
    if (hasRole(account, 'recruiter')) return 'recruiter';
    return null;
  };

  const canTransition = async ({ account, application, to, connection = pool }) => {
    const actorRole = transitionRole({ account, to });
    if (!actorRole) return { allowed: false, actorRole: null };
    if (actorRole === 'candidate') {
      return { allowed: application.candidateAccountId === account.id, actorRole };
    }
    return {
      allowed: await canReadApplication({ account, application, connection }),
      actorRole,
    };
  };

  const jobActorRole = ({ account }) => {
    if (hasRole(account, 'admin')) return 'admin';
    if (hasRole(account, 'recruitment_manager')) return 'recruitment_manager';
    if (hasRole(account, 'recruiter')) return 'recruiter';
    return null;
  };

  const canCreateJob = ({ account }) => jobActorRole({ account }) !== null;

  const canManageJob = ({ account, job }) => {
    if (hasRole(account, 'admin') || hasRole(account, 'recruitment_manager')) return true;
    return hasRole(account, 'recruiter') && job.ownerAccountId === account.id;
  };

  const canManageRecruiters = ({ account }) => hasRole(account, 'admin') || hasRole(account, 'recruitment_manager');

  const canReadJob = async ({ account, job, connection = pool }) => {
    if (!account || !job) return false;
    if (job.status === 'published') return true;
    if (hasRole(account, 'admin') || hasRole(account, 'recruitment_manager')) return true;
    if (job.ownerAccountId === account.id) return true;
    if (!hasRole(account, 'recruiter')) return false;
    const [rows] = await connection.query(
      'SELECT 1 FROM ats_job_recruiters_v1 WHERE job_id = ? AND recruiter_account_id = ? LIMIT 1',
      [job.id, account.id],
    );
    return rows.length > 0;
  };

  return Object.freeze({
    canReadApplication,
    canTransition,
    transitionRole,
    jobActorRole,
    canCreateJob,
    canManageJob,
    canManageRecruiters,
    canReadJob,
  });
};

module.exports = { createAtsAuthorizer, normalizeRoles, hasRole };
