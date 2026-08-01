'use strict';

const crypto = require('node:crypto');
const { normalizeRoles } = require('./authorization');
const { APPLICATION_STATES } = require('./workflow');
const { EVALUATION_RECOMMENDATIONS } = require('./evaluation-store');

const ABSENT_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
const EVALUATION_NOTE_MAX_LENGTH = 2000;

class AtsServiceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsServiceError';
    this.code = code;
    this.details = details;
  }
}

const createAtsService = ({ store, jobStore, authorizer, organizationStore, evaluationStore, pool }) => {
  if (!store || !jobStore || !authorizer || !organizationStore || !evaluationStore || !pool) {
    throw new Error('ATS store, jobStore, authorizer, organizationStore, evaluationStore and pool are required.');
  }

  const getApplication = async (account, applicationId) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    if (!await authorizer.canReadApplication({ account, application })) {
      throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS application access denied.');
    }
    return application;
  };

  // Le candidat propriétaire ne voit jamais l'identité de l'acteur interne, le
  // motif ou les métadonnées d'un événement — seuls l'état atteint et l'horodatage
  // sont publics. Le personnel autorisé (recruteur affecté, responsable, admin)
  // conserve le détail complet.
  const redactEventForCandidate = (event) => Object.freeze({
    id: event.id,
    applicationId: event.applicationId,
    eventType: event.eventType,
    from: event.from,
    to: event.to,
    occurredAt: event.occurredAt,
  });

  const listHistory = async (account, applicationId) => {
    const application = await getApplication(account, applicationId);
    const events = await store.listHistory(applicationId);
    if (application.candidateAccountId === account.id) {
      return events.map(redactEventForCandidate);
    }
    return events;
  };

  const listMyApplications = (account) => store.listApplicationsForCandidate(account.id);

  const transition = async (account, applicationId, command = {}) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    const initialDecision = await authorizer.canTransition({ account, application, to: command.to });
    if (!initialDecision.allowed) throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS transition access denied.');

    return store.transition({
      applicationId,
      expectedVersion: Number(command.expectedVersion),
      to: command.to,
      actorAccountId: account.id,
      actorRole: initialDecision.actorRole,
      reason: command.reason,
      reasonCode: command.reasonCode,
      metadata: {},
      authorize: async ({ application: lockedApplication, connection }) => {
        const lockedDecision = await authorizer.canTransition({
          account,
          application: lockedApplication,
          to: command.to,
          connection,
        });
        return lockedDecision.allowed && lockedDecision.actorRole === initialDecision.actorRole;
      },
    });
  };

  const depositApplication = async (account, jobId, command = {}) => {
    const cvAnalysisId = command.cvAnalysisId ? String(command.cvAnalysisId) : null;
    if (cvAnalysisId) {
      const [rows] = await pool.query(
        'SELECT 1 FROM cv_analyses WHERE id = ? AND account_id = ? LIMIT 1',
        [cvAnalysisId, account.id],
      );
      if (rows.length === 0) {
        throw new AtsServiceError('ATS_CV_REFERENCE_INVALID', 'The referenced CV analysis does not belong to this account.');
      }
    }
    return store.createApplication({
      id: crypto.randomUUID(),
      jobId,
      candidateAccountId: account.id,
      cvAnalysisId,
    });
  };

  const createJob = async (account, command = {}) => {
    const decision = await authorizer.canCreateJob({ account, organizationId: command.organizationId });
    if (!decision.allowed) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job creation denied.');
    }
    const title = String(command.title || '').trim();
    if (!title) {
      throw new AtsServiceError('ATS_JOB_FIELDS_MISSING', 'A job title is required.', { missing: ['title'] });
    }
    const description = String(command.description || '');

    return jobStore.createJob({
      id: crypto.randomUUID(),
      ownerAccountId: account.id,
      organizationId: decision.organizationId,
      title,
      description,
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
    });
  };

  const getJob = async (account, jobId) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canReadJob({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return job;
  };

  const listJobs = async (account) => {
    const roles = normalizeRoles(account);
    if (roles.includes('admin')) {
      return jobStore.listAllJobs();
    }
    if (roles.includes('recruitment_manager')) {
      const organizationId = await organizationStore.getMemberOrganizationId(account.id);
      if (organizationId) return jobStore.listJobsForOrganization(organizationId);
    }
    if (roles.includes('recruiter')) {
      const organizationId = await organizationStore.getMemberOrganizationId(account.id);
      if (organizationId) {
        return jobStore.listJobsForRecruiter({ organizationId, recruiterAccountId: account.id });
      }
    }
    return jobStore.listPublishedJobs();
  };

  const publishJob = async (account, jobId, command = {}) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManageJob({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.publishJob({
      jobId,
      expectedVersion: Number(command.expectedVersion),
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob, connection }) => authorizer.canManageJob({ account, job: lockedJob, connection }),
    });
  };

  const closeJob = async (account, jobId, command = {}) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManageJob({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.closeJob({
      jobId,
      expectedVersion: Number(command.expectedVersion),
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob, connection }) => authorizer.canManageJob({ account, job: lockedJob, connection }),
    });
  };

  const assignRecruiter = async (account, jobId, recruiterAccountId) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManageRecruiters({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Recruiter assignment denied.');
    }
    if (!await organizationStore.isOrganizationMember({ accountId: recruiterAccountId, organizationId: job.organizationId })) {
      throw new AtsServiceError('ATS_RECRUITER_NOT_IN_ORGANIZATION', 'The recruiter is not a member of this organization.');
    }
    return jobStore.assignRecruiter({
      jobId,
      recruiterAccountId,
      assignedByAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob, connection }) => authorizer.canManageRecruiters({ account, job: lockedJob, connection }),
    });
  };

  const removeRecruiter = async (account, jobId, recruiterAccountId) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManageRecruiters({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Recruiter removal denied.');
    }
    return jobStore.removeRecruiter({
      jobId,
      recruiterAccountId,
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob, connection }) => authorizer.canManageRecruiters({ account, job: lockedJob, connection }),
    });
  };

  // Pipeline recruteur : jamais atteignable via le raccourci "offre publiée"
  // du candidat, contrairement à getJob/canReadJob.
  const listApplicationsForJob = async (account, jobId, query = {}) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManagePipeline({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    const filters = {};
    if (query.state !== undefined) {
      if (!APPLICATION_STATES.includes(query.state)) {
        throw new AtsServiceError('ATS_APPLICATION_FILTER_INVALID', 'Unknown application state filter.');
      }
      filters.state = query.state;
    }
    if (query.candidateEmail) {
      const [rows] = await pool.query(
        'SELECT id FROM auth_accounts WHERE email = ? LIMIT 1',
        [String(query.candidateEmail).trim().toLowerCase()],
      );
      // Aucune correspondance : on borne la recherche à un id inexistant plutôt
      // que d'ignorer le filtre, pour ne jamais retomber sur la liste complète.
      filters.candidateAccountId = rows[0]?.id || ABSENT_ACCOUNT_ID;
    }
    return store.listApplicationsForJob({ jobId, organizationId: job.organizationId, filters });
  };

  const listJobEvents = async (account, jobId) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManagePipeline({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.listJobEvents(jobId);
  };

  const listJobRecruiters = async (account, jobId) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!await authorizer.canManagePipeline({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.listRecruiters(jobId);
  };

  // Évaluations structurées et notes internes : jamais atteignables par le
  // candidat, même sur sa propre candidature — canManageEvaluations n'inclut
  // volontairement pas la branche "candidat propriétaire".
  const createEvaluation = async (account, applicationId, command = {}) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    if (!await authorizer.canManageEvaluations({ account, application })) {
      throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS evaluation access denied.');
    }

    const recommendation = String(command.recommendation || '');
    if (!EVALUATION_RECOMMENDATIONS.includes(recommendation)) {
      throw new AtsServiceError('ATS_EVALUATION_RECOMMENDATION_INVALID', 'A valid recommendation is required.', {
        allowed: EVALUATION_RECOMMENDATIONS,
      });
    }

    let rating = null;
    if (command.rating !== undefined && command.rating !== null) {
      rating = Number(command.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new AtsServiceError('ATS_EVALUATION_RATING_INVALID', 'rating must be an integer between 1 and 5.');
      }
    }

    let note = null;
    if (command.note !== undefined && command.note !== null) {
      const trimmed = String(command.note).trim();
      if (trimmed.length > EVALUATION_NOTE_MAX_LENGTH) {
        throw new AtsServiceError('ATS_EVALUATION_NOTE_TOO_LONG', `note must be at most ${EVALUATION_NOTE_MAX_LENGTH} characters.`);
      }
      note = trimmed || null;
    }

    return evaluationStore.createEvaluation({
      applicationId,
      organizationId: application.organizationId,
      evaluatorAccountId: account.id,
      evaluatorRole: authorizer.jobActorRole({ account }),
      applicationStateAtEvaluation: application.state,
      rating,
      recommendation,
      note,
    });
  };

  const listEvaluations = async (account, applicationId) => {
    const application = await store.getApplication(applicationId);
    if (!application) throw new AtsServiceError('ATS_APPLICATION_NOT_FOUND', 'ATS application not found.');
    if (!await authorizer.canManageEvaluations({ account, application })) {
      throw new AtsServiceError('ATS_RESOURCE_FORBIDDEN', 'ATS evaluation access denied.');
    }
    return evaluationStore.listEvaluations(applicationId);
  };

  return Object.freeze({
    getApplication,
    listMyApplications,
    listHistory,
    transition,
    depositApplication,
    createJob,
    getJob,
    listJobs,
    publishJob,
    closeJob,
    assignRecruiter,
    removeRecruiter,
    listApplicationsForJob,
    listJobEvents,
    listJobRecruiters,
    createEvaluation,
    listEvaluations,
  });
};

module.exports = { AtsServiceError, createAtsService };
