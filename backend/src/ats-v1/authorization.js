'use strict';

const { createOrganizationStore } = require('./organization-store');

const normalizeRoles = (account = {}) => Array.isArray(account.roles) ? account.roles : [];
const hasRole = (account, role) => normalizeRoles(account).includes(role);

const createAtsAuthorizer = (pool) => {
  if (!pool || typeof pool.query !== 'function') throw new Error('A MySQL pool is required.');
  const organizationStore = createOrganizationStore(pool);

  // admin est un superutilisateur plateforme et traverse toute organisation
  // (rôle support/ops, decision actée). recruitment_manager est strictement
  // borné à son organisation : c'est le correctif de #199.
  const isOrgManager = async ({ account, organizationId, connection = pool }) => {
    if (!account) return false;
    if (hasRole(account, 'admin')) return true;
    if (!hasRole(account, 'recruitment_manager') || !organizationId) return false;
    return organizationStore.isOrganizationMember({ accountId: account.id, organizationId, connection });
  };

  const isOrgAssignedRecruiter = async ({ account, jobId, organizationId, connection = pool }) => {
    if (!account || !hasRole(account, 'recruiter') || !organizationId) return false;
    const [rows] = await connection.query(
      `SELECT 1 FROM ats_job_recruiters_v1 r
       JOIN ats_organization_members_v1 m
         ON m.account_id = r.recruiter_account_id AND m.organization_id = ?
       WHERE r.job_id = ? AND r.recruiter_account_id = ? LIMIT 1`,
      [organizationId, jobId, account.id],
    );
    return rows.length > 0;
  };

  // Predicat commun a tout acces "personnel autorise" sur une offre/candidature :
  // admin, ou manager de l'organisation, ou recruteur affecte ET toujours membre
  // de cette organisation (l'affectation seule ne suffit plus).
  const canManageStaffResource = async ({ account, jobId, organizationId, connection = pool }) => {
    if (!account) return false;
    if (await isOrgManager({ account, organizationId, connection })) return true;
    return isOrgAssignedRecruiter({ account, jobId, organizationId, connection });
  };

  const canReadApplication = async ({ account, application, connection = pool }) => {
    if (!account || !application) return false;
    if (application.candidateAccountId === account.id) return true;
    return canManageStaffResource({
      account, jobId: application.jobId, organizationId: application.organizationId, connection,
    });
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

  // admin peut fournir une organisation explicite (elle n'est membre d'aucune
  // par defaut). recruiter/recruitment_manager doivent etre membres d'une
  // organisation : sans adhesion, refus meme avec le role global — ferme le
  // trou des offres orphelines.
  const canCreateJob = async ({ account, organizationId: requestedOrganizationId, connection = pool }) => {
    if (!account) return { allowed: false, organizationId: null };
    if (hasRole(account, 'admin')) {
      return requestedOrganizationId
        ? { allowed: true, organizationId: requestedOrganizationId }
        : { allowed: false, organizationId: null };
    }
    if (!hasRole(account, 'recruiter') && !hasRole(account, 'recruitment_manager')) {
      return { allowed: false, organizationId: null };
    }
    const organizationId = await organizationStore.getMemberOrganizationId(account.id, connection);
    return { allowed: Boolean(organizationId), organizationId };
  };

  const canManageJob = async ({ account, job, connection = pool }) => {
    if (!account || !job) return false;
    if (hasRole(account, 'recruiter') && job.ownerAccountId === account.id) return true;
    return isOrgManager({ account, organizationId: job.organizationId, connection });
  };

  // Signature changee : prend desormais `job`, plus seulement `account`.
  // L'ancien controle etait un role global ignorant l'offre — le trou exact
  // que #199 signale ("recruteur non affecte refuse", "aucun acces
  // inter-organisation").
  const canManageRecruiters = async ({ account, job, connection = pool }) => {
    if (!account || !job) return false;
    return isOrgManager({ account, organizationId: job.organizationId, connection });
  };

  const canReadJob = async ({ account, job, connection = pool }) => {
    if (!account || !job) return false;
    if (job.status === 'published') return true;
    if (job.ownerAccountId === account.id) return true;
    return canManageStaffResource({ account, jobId: job.id, organizationId: job.organizationId, connection });
  };

  // Gate le pipeline recruteur (liste des candidatures/evenements d'une
  // offre) : ne passe jamais par le raccourci "offre publiee" du candidat.
  const canManagePipeline = ({ account, job, connection = pool }) => (
    canManageStaffResource({ account, jobId: job?.id, organizationId: job?.organizationId, connection })
  );

  // Gate les evaluations/notes internes : memes acteurs que le pipeline,
  // mais sans jamais inclure le candidat proprietaire de la candidature.
  const canManageEvaluations = ({ account, application, connection = pool }) => (
    canManageStaffResource({
      account, jobId: application?.jobId, organizationId: application?.organizationId, connection,
    })
  );

  return Object.freeze({
    canReadApplication,
    canTransition,
    transitionRole,
    jobActorRole,
    canCreateJob,
    canManageJob,
    canManageRecruiters,
    canReadJob,
    canManagePipeline,
    canManageEvaluations,
  });
};

module.exports = { createAtsAuthorizer, normalizeRoles, hasRole };
