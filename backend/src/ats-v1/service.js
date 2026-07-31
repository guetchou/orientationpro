'use strict';

const crypto = require('node:crypto');

class AtsServiceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'AtsServiceError';
    this.code = code;
    this.details = details;
  }
}

const createAtsService = ({ store, jobStore, authorizer, pool }) => {
  if (!store || !jobStore || !authorizer || !pool) {
    throw new Error('ATS store, jobStore, authorizer and pool are required.');
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
    if (!authorizer.canCreateJob({ account })) {
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
    const jobs = await jobStore.listJobs();
    const visible = await Promise.all(jobs.map(async (job) => (
      (await authorizer.canReadJob({ account, job })) ? job : null
    )));
    return visible.filter(Boolean);
  };

  const publishJob = async (account, jobId, command = {}) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!authorizer.canManageJob({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.publishJob({
      jobId,
      expectedVersion: Number(command.expectedVersion),
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob }) => authorizer.canManageJob({ account, job: lockedJob }),
    });
  };

  const closeJob = async (account, jobId, command = {}) => {
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    if (!authorizer.canManageJob({ account, job })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'ATS job access denied.');
    }
    return jobStore.closeJob({
      jobId,
      expectedVersion: Number(command.expectedVersion),
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async ({ job: lockedJob }) => authorizer.canManageJob({ account, job: lockedJob }),
    });
  };

  const assignRecruiter = async (account, jobId, recruiterAccountId) => {
    if (!authorizer.canManageRecruiters({ account })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Recruiter assignment denied.');
    }
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    return jobStore.assignRecruiter({
      jobId,
      recruiterAccountId,
      assignedByAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async () => authorizer.canManageRecruiters({ account }),
    });
  };

  const removeRecruiter = async (account, jobId, recruiterAccountId) => {
    if (!authorizer.canManageRecruiters({ account })) {
      throw new AtsServiceError('ATS_JOB_RESOURCE_FORBIDDEN', 'Recruiter removal denied.');
    }
    const job = await jobStore.getJob(jobId);
    if (!job) throw new AtsServiceError('ATS_JOB_NOT_FOUND', 'ATS job not found.');
    return jobStore.removeRecruiter({
      jobId,
      recruiterAccountId,
      actorAccountId: account.id,
      actorRole: authorizer.jobActorRole({ account }),
      authorize: async () => authorizer.canManageRecruiters({ account }),
    });
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
  });
};

module.exports = { AtsServiceError, createAtsService };
