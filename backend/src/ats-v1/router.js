'use strict';

const express = require('express');
const { AtsWorkflowError } = require('./workflow');
const { AtsJobWorkflowError } = require('./job-workflow');
const { AtsPersistenceError } = require('./store');
const { AtsJobPersistenceError } = require('./job-store');
const { AtsServiceError } = require('./service');

const statusFor = (error) => {
  if (error instanceof AtsWorkflowError || error instanceof AtsJobWorkflowError) {
    if (['ATS_TRANSITION_NOT_ALLOWED', 'ATS_TERMINAL_STATE', 'ATS_TRANSITION_NOOP',
      'ATS_JOB_TRANSITION_NOT_ALLOWED'].includes(error.code)) return 409;
    return 400;
  }
  if (error instanceof AtsPersistenceError) {
    if (['ATS_APPLICATION_NOT_FOUND', 'ATS_JOB_NOT_FOUND'].includes(error.code)) return 404;
    if (error.code === 'ATS_RESOURCE_FORBIDDEN') return 403;
    if (['ATS_VERSION_CONFLICT', 'ATS_APPLICATION_ALREADY_EXISTS'].includes(error.code)) return 409;
    if (error.code === 'ATS_VERSION_REQUIRED') return 428;
    if (error.code === 'ATS_JOB_NOT_PUBLISHED') return 409;
    return 400;
  }
  if (error instanceof AtsJobPersistenceError) {
    if (error.code === 'ATS_JOB_NOT_FOUND') return 404;
    if (['ATS_JOB_RESOURCE_FORBIDDEN', 'ATS_JOB_AUTHORIZATION_REQUIRED'].includes(error.code)) return 403;
    if (['ATS_JOB_VERSION_CONFLICT', 'ATS_JOB_ALREADY_EXISTS', 'ATS_RECRUITER_ALREADY_ASSIGNED',
      'ATS_RECRUITER_NOT_ASSIGNED'].includes(error.code)) return 409;
    if (error.code === 'ATS_JOB_VERSION_REQUIRED') return 428;
    return 400;
  }
  if (error instanceof AtsServiceError) {
    if (['ATS_APPLICATION_NOT_FOUND', 'ATS_JOB_NOT_FOUND'].includes(error.code)) return 404;
    if (['ATS_RESOURCE_FORBIDDEN', 'ATS_JOB_RESOURCE_FORBIDDEN'].includes(error.code)) return 403;
    return 400;
  }
  return null;
};

const route = (handler) => async (req, res, next) => {
  try { return await handler(req, res, next); }
  catch (error) {
    const status = statusFor(error);
    if (!status) return next(error);
    return res.status(status).json({ error: { code: error.code, message: error.message, details: error.details || {} } });
  }
};

const createAtsRouter = ({ service, authenticate }) => {
  if (!service || typeof authenticate !== 'function') throw new Error('ATS service and authentication are required.');
  const router = express.Router();
  router.use(authenticate);

  router.get('/my/applications', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    applications: await service.listMyApplications(req.auth.account),
  })));

  router.get('/applications/:applicationId', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    application: await service.getApplication(req.auth.account, req.params.applicationId),
  })));

  router.get('/applications/:applicationId/history', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    events: await service.listHistory(req.auth.account, req.params.applicationId),
  })));

  router.post('/applications/:applicationId/transitions', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    ...(await service.transition(req.auth.account, req.params.applicationId, req.body || {})),
  })));

  router.post('/jobs', route(async (req, res) => res.status(201).json({
    schemaVersion: 'makoki-ats-api-v1',
    job: await service.createJob(req.auth.account, req.body || {}),
  })));

  router.get('/jobs', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    jobs: await service.listJobs(req.auth.account),
  })));

  router.get('/jobs/:jobId', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    job: await service.getJob(req.auth.account, req.params.jobId),
  })));

  router.post('/jobs/:jobId/publish', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    job: await service.publishJob(req.auth.account, req.params.jobId, req.body || {}),
  })));

  router.post('/jobs/:jobId/close', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    job: await service.closeJob(req.auth.account, req.params.jobId, req.body || {}),
  })));

  router.post('/jobs/:jobId/applications', route(async (req, res) => res.status(201).json({
    schemaVersion: 'makoki-ats-api-v1',
    ...(await service.depositApplication(req.auth.account, req.params.jobId, req.body || {})),
  })));

  router.post('/jobs/:jobId/recruiters', route(async (req, res) => {
    await service.assignRecruiter(req.auth.account, req.params.jobId, String(req.body?.recruiterAccountId || ''));
    return res.status(201).json({ schemaVersion: 'makoki-ats-api-v1', assigned: true });
  }));

  router.delete('/jobs/:jobId/recruiters/:accountId', route(async (req, res) => {
    await service.removeRecruiter(req.auth.account, req.params.jobId, req.params.accountId);
    return res.status(200).json({ schemaVersion: 'makoki-ats-api-v1', removed: true });
  }));

  router.get('/jobs/:jobId/applications', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    applications: await service.listApplicationsForJob(req.auth.account, req.params.jobId, {
      state: req.query.state,
      candidateEmail: req.query.candidateEmail,
    }),
  })));

  router.get('/jobs/:jobId/events', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    events: await service.listJobEvents(req.auth.account, req.params.jobId),
  })));

  router.get('/jobs/:jobId/recruiters', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    recruiters: await service.listJobRecruiters(req.auth.account, req.params.jobId),
  })));

  router.post('/applications/:applicationId/evaluations', route(async (req, res) => res.status(201).json({
    schemaVersion: 'makoki-ats-api-v1',
    evaluation: await service.createEvaluation(req.auth.account, req.params.applicationId, req.body || {}),
  })));

  router.get('/applications/:applicationId/evaluations', route(async (req, res) => res.status(200).json({
    schemaVersion: 'makoki-ats-api-v1',
    evaluations: await service.listEvaluations(req.auth.account, req.params.applicationId),
  })));

  return router;
};

module.exports = { createAtsRouter, statusFor };
