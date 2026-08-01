const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const cvRoutes = require('./routes/cv.routes');
const candidatesRoutes = require('./routes/candidates.routes');
const atsRoutes = require('./routes/ats.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const messagingRoutes = require('./routes/messaging.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const matchingRoutes = require('./routes/matching.routes');
const communicationRoutes = require('./routes/communication.routes');
const jobScrapingRoutes = require('./routes/jobScraping.routes');
const { createConfiguredAuthV1 } = require('./auth-v1/bootstrap');
const { createCapabilitiesRouter } = require('./capabilities/router');
const { createConfiguredDataRightsRouter } = require('./data-rights/bootstrap');
const { createRiasecRouter } = require('./orientation/riasec/router');
const { createRiasecStore } = require('./orientation/riasec/store');
const { createCareerRouter } = require('./career/router');
const { createCareerStore } = require('./career/store');
const { createCvRouter } = require('./cv/router');
const { createConfiguredAtsRouter } = require('./ats-v1/bootstrap');
const { createCvService } = require('./cv/service');
const { createCvStore } = require('./cv/store');
const { createProfileRouter } = require('./profile/router');
const { createProfileStore } = require('./profile/store');
const { createProfileSynthesisRouter } = require('./profile/synthesis-router');
const { createProfileSynthesisStore } = require('./profile/synthesis-store');
const { createLifeProjectRouter } = require('./life-project/router');
const { createLifeProjectService } = require('./life-project/service');
const { createLifeProjectStore } = require('./life-project/store');
const { createScopedCriteriaStore } = require('./life-project/scoped-criteria-store');
const { createActionTrackingStore } = require('./life-project/action-tracking-store');
const { createCongoLocalOptionProvider } = require('./life-project/local-options-cg');
const { mountLegacyApi } = require('./security/legacy-api');
const { CorsOriginRejectedError, createCorsOriginValidator } = require('./security/cors-policy');
const {
  createMemoryRateLimiter,
  createOpaqueKeyFactory,
} = require('./security/rate-limit');
const { createJsonLogger } = require('./observability/logger');
const { createMetricsRegistry } = require('./observability/metrics');
const { V1_ROUTE_TEMPLATES, createHttpObservability } = require('./observability/http');

const app = express();
const PORT = process.env.PORT || 3000;
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '1mb';
const urlencodedParameterLimit = Number(process.env.URLENCODED_PARAMETER_LIMIT || 200);
const rateLimitSecret = process.env.RATE_LIMIT_KEY_SECRET || undefined;
const rateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000;
const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
let closeApplicationResources = async () => undefined;
let authV1 = null;
let riasecStore = null;

const logger = createJsonLogger({ routeTemplates: V1_ROUTE_TEMPLATES });
const metrics = createMetricsRegistry({ routeTemplates: V1_ROUTE_TEMPLATES });
const httpObservability = createHttpObservability({
  logger,
  metrics,
  routeTemplates: V1_ROUTE_TEMPLATES,
});
const generalLimiter = createMemoryRateLimiter({
  windowMs: rateLimitWindowMs,
  max: process.env.RATE_LIMIT_GENERAL_MAX || 300,
  keyGenerator: createOpaqueKeyFactory({ secret: rateLimitSecret, scope: 'general' }),
  scope: 'general',
});
const authLimiter = createMemoryRateLimiter({
  windowMs: rateLimitWindowMs,
  max: process.env.RATE_LIMIT_AUTH_MAX || 20,
  keyGenerator: createOpaqueKeyFactory({ secret: rateLimitSecret, scope: 'auth' }),
  scope: 'auth',
});
const expensiveLimiter = createMemoryRateLimiter({
  windowMs: rateLimitWindowMs,
  max: process.env.RATE_LIMIT_EXPENSIVE_MAX || 60,
  keyGenerator: createOpaqueKeyFactory({ secret: rateLimitSecret, scope: 'expensive' }),
  scope: 'expensive',
});

app.use(cors({
  origin: createCorsOriginValidator(allowedOrigins),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'If-Match', 'X-Request-Id'],
  exposedHeaders: ['Content-Type', 'Authorization', 'ETag', 'X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'],
}));

app.use(httpObservability.requestMiddleware);
app.use('/api', generalLimiter);
app.use(express.json({ limit: jsonBodyLimit, strict: true }));
app.use(express.urlencoded({
  extended: true,
  limit: jsonBodyLimit,
  parameterLimit: Number.isSafeInteger(urlencodedParameterLimit) && urlencodedParameterLimit > 0
    ? urlencodedParameterLimit
    : 200,
}));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/v1/capabilities', createCapabilitiesRouter({ env: process.env }));
app.use('/api/test', testRoutes);
if (process.env.LEGACY_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authLimiter, authRoutes);
}
if (process.env.AUTH_V1_ENABLED === 'true') {
  authV1 = createConfiguredAuthV1(process.env);
  riasecStore = createRiasecStore(authV1.pool);
  closeApplicationResources = authV1.close;
  app.use('/api/v1/auth', authLimiter, authV1.router);
  app.use('/api/v1/profile', createProfileRouter({
    store: createProfileStore(authV1.pool),
    authenticate: authV1.authenticate,
  }));
  app.use('/api/v1/profile/syntheses', createProfileSynthesisRouter({
    store: createProfileSynthesisStore(authV1.pool),
    authenticate: authV1.authenticate,
  }));
}
if (process.env.DATA_RIGHTS_API_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('DATA_RIGHTS_API_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/data-rights', expensiveLimiter, createConfiguredDataRightsRouter({
    authV1,
    env: process.env,
  }));
}
if (process.env.LIFE_PROJECT_API_ENABLED === 'true') {
  if (!authV1 || !riasecStore) {
    throw new Error('LIFE_PROJECT_API_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/life-projects', expensiveLimiter, createLifeProjectRouter({
    service: createLifeProjectService({
      store: createScopedCriteriaStore(createLifeProjectStore(authV1.pool)),
      actionTrackingStore: createActionTrackingStore(authV1.pool),
      optionProvider: createCongoLocalOptionProvider(),
    }),
    authenticate: authV1.authenticate,
    riasecStore,
  }));
}
const riasecRuntimeEnabled = process.env.RIASEC_API_ENABLED === 'true'
  || process.env.LIFE_PROJECT_API_ENABLED === 'true';
if (riasecRuntimeEnabled) {
  if (!authV1 || !riasecStore) {
    throw new Error('RIASEC or LIFE_PROJECT runtime requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/orientation', expensiveLimiter, createRiasecRouter({
    store: riasecStore,
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
    allowDraft: process.env.RIASEC_ALLOW_DRAFT === 'true'
      || process.env.LIFE_PROJECT_API_ENABLED === 'true',
  }));
}
if (process.env.CAREER_API_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('CAREER_API_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/career', expensiveLimiter, createCareerRouter({
    store: createCareerStore(authV1.pool),
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
  }));
}
if (process.env.CV_API_V1_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('CV_API_V1_ENABLED requires AUTH_V1_ENABLED=true');
  }

  app.use('/api/v1/cv', expensiveLimiter, createCvRouter({
    service: createCvService({ store: createCvStore(authV1.pool) }),
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
    uploadDirectory: process.env.CV_UPLOAD_DIR,
  }));
}
if (process.env.ATS_WORKFLOW_V1_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('ATS_WORKFLOW_V1_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/ats', expensiveLimiter, createConfiguredAtsRouter({
    pool: authV1.pool,
    authenticate: authV1.authenticate,
  }));
}

mountLegacyApi({
  app,
  env: process.env,
  routes: {
    cv: cvRoutes,
    candidates: candidatesRoutes,
    jobs: jobRoutes,
    ats: atsRoutes,
    appointments: appointmentRoutes,
    messaging: messagingRoutes,
    applications: applicationRoutes,
    matching: matchingRoutes,
    communication: communicationRoutes,
    jobScraping: jobScrapingRoutes,
  },
});

app.get('/', (req, res) => {
  const endpoints = {
    health: 'GET /api/test/health',
    capabilities: 'GET /api/v1/capabilities',
  };
  if (process.env.AUTH_V1_ENABLED === 'true') {
    Object.assign(endpoints, {
      login: 'POST /api/v1/auth/login',
      register: 'POST /api/v1/auth/register',
      session: 'GET /api/v1/auth/session',
      profile: 'GET|PUT /api/v1/profile',
      profileSyntheses: 'GET|POST /api/v1/profile/syntheses',
    });
  }
  if (process.env.DATA_RIGHTS_API_ENABLED === 'true') {
    Object.assign(endpoints, {
      dataExport: 'GET /api/v1/data-rights/export',
      dataCorrection: 'PATCH /api/v1/data-rights/profile',
      accountDeletion: 'POST /api/v1/data-rights/delete-account',
    });
  }
  if (process.env.LIFE_PROJECT_API_ENABLED === 'true') {
    Object.assign(endpoints, {
      lifeProjects: 'GET|POST /api/v1/life-projects',
      lifeProject: 'GET /api/v1/life-projects/:projectId',
      lifeProjectDiagnostic: 'PUT /api/v1/life-projects/:projectId/diagnostic',
      lifeProjectRecommendations: 'POST /api/v1/life-projects/:projectId/recommendations',
      lifeProjectProgress: 'GET /api/v1/life-projects/:projectId/progress',
      lifeProjectScenarios: 'POST /api/v1/life-projects/:projectId/scenarios',
      lifeProjectTransitions: 'POST /api/v1/life-projects/:projectId/transitions',
      lifeProjectActionPlans: 'POST|PUT /api/v1/life-projects/:projectId/action-plans',
      lifeProjectAction: 'PATCH /api/v1/life-projects/:projectId/action-plans/:planId/actions/:actionId',
    });
  }
  if (riasecRuntimeEnabled) {
    Object.assign(endpoints, {
      riasecInstrument: 'GET /api/v1/orientation/riasec/instrument',
      riasecAttempts: 'POST /api/v1/orientation/riasec/attempts',
      orientationResults: 'GET /api/v1/orientation/results',
    });
  }
  if (process.env.CAREER_API_ENABLED === 'true') {
    Object.assign(endpoints, {
      careerCatalogSummary: 'GET /api/v1/career/catalog/summary',
      occupations: 'GET /api/v1/career/occupations',
      occupationMatches: 'GET /api/v1/career/matches/:resultId',
    });
  }
  if (process.env.CV_API_V1_ENABLED === 'true') {
    Object.assign(endpoints, {
      cvAnalyses: 'POST /api/v1/cv/analyses',
      cvAnalysisHistory: 'GET /api/v1/cv/analyses',
      cvAnalysisDetail: 'GET /api/v1/cv/analyses/:analysisId',
      cvAnalysisReport: 'GET /api/v1/cv/analyses/:analysisId/report.pdf',
      cvAnalysisDelete: 'DELETE /api/v1/cv/analyses/:analysisId',
    });
  }
  if (process.env.ATS_WORKFLOW_V1_ENABLED === 'true') {
    Object.assign(endpoints, {
      atsJobs: 'GET|POST /api/v1/ats/jobs',
      atsJob: 'GET /api/v1/ats/jobs/:jobId',
      atsJobPublish: 'POST /api/v1/ats/jobs/:jobId/publish',
      atsJobClose: 'POST /api/v1/ats/jobs/:jobId/close',
      atsJobApplications: 'POST /api/v1/ats/jobs/:jobId/applications',
      atsJobRecruiters: 'POST|DELETE /api/v1/ats/jobs/:jobId/recruiters',
      atsMyApplications: 'GET /api/v1/ats/my/applications',
      atsApplication: 'GET /api/v1/ats/applications/:applicationId',
      atsApplicationHistory: 'GET /api/v1/ats/applications/:applicationId/history',
      atsApplicationTransitions: 'POST /api/v1/ats/applications/:applicationId/transitions',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    endpoints,
    corsOriginsConfigured: allowedOrigins.size,
    jsonLimit: jsonBodyLimit,
  });
});

app.use((err, req, res, next) => {
  const isCorsRejection = err instanceof CorsOriginRejectedError;
  const statusCode = isCorsRejection ? err.statusCode : err?.type === 'entity.too.large' ? 413 : 500;
  httpObservability.logError({ request: req, error: err, statusCode });

  res.status(statusCode).json({
    success: false,
    code: isCorsRejection ? err.code : statusCode === 413 ? 'REQUEST_ENTITY_TOO_LARGE' : 'INTERNAL_SERVER_ERROR',
    message: isCorsRejection
      ? 'Origine non autorisée par la politique CORS'
      : statusCode === 413 ? 'La requête dépasse la taille autorisée' : 'Erreur interne du serveur',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    requestId: req.requestId,
  });
});

app.use('*', (req, res) => {
  const requestPath = String(req.originalUrl || req.path).split(/[?#]/u, 1)[0];
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: requestPath,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    availableEndpoints: ['GET /', 'GET /api/test/health', 'GET /api/v1/capabilities'],
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.write({
    event: 'server.started',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

server.on('error', (err) => {
  logger.write({ event: 'server.failed', errorCode: err.code || err.name || 'Error' });
});

const stopServer = (reason) => {
  logger.write({ event: 'server.stopping', result: reason || 'signal' });
  server.close(async () => {
    await closeApplicationResources();
    logger.write({ event: 'server.stopped', result: 'completed' });
    process.exit(0);
  });
};

process.on('SIGTERM', () => stopServer('SIGTERM'));
process.on('SIGINT', () => stopServer('SIGINT'));
