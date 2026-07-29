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
const { createRiasecRouter } = require('./orientation/riasec/router');
const { createRiasecStore } = require('./orientation/riasec/store');
const { createCareerRouter } = require('./career/router');
const { createCareerStore } = require('./career/store');
const { createCvRouter } = require('./cv/router');
const { createCvService } = require('./cv/service');
const { createCvStore } = require('./cv/store');
const { createProfileRouter } = require('./profile/router');
const { createProfileStore } = require('./profile/store');
const { createProfileSynthesisRouter } = require('./profile/synthesis-router');
const { createProfileSynthesisStore } = require('./profile/synthesis-store');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
let closeApplicationResources = async () => undefined;
let authV1 = null;

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/api/test', testRoutes);
if (process.env.LEGACY_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authRoutes);
}
if (process.env.AUTH_V1_ENABLED === 'true') {
  authV1 = createConfiguredAuthV1(process.env);
  closeApplicationResources = authV1.close;
  app.use('/api/v1/auth', authV1.router);
  app.use('/api/v1/profile', createProfileRouter({
    store: createProfileStore(authV1.pool),
    authenticate: authV1.authenticate,
  }));
  app.use('/api/v1/profile/syntheses', createProfileSynthesisRouter({
    store: createProfileSynthesisStore(authV1.pool),
    authenticate: authV1.authenticate,
  }));
}
if (process.env.RIASEC_API_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('RIASEC_API_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/orientation', createRiasecRouter({
    store: createRiasecStore(authV1.pool),
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
    allowDraft: process.env.RIASEC_ALLOW_DRAFT === 'true',
  }));
}
if (process.env.CAREER_API_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('CAREER_API_ENABLED requires AUTH_V1_ENABLED=true');
  }
  app.use('/api/v1/career', createCareerRouter({
    store: createCareerStore(authV1.pool),
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
  }));
}
if (process.env.CV_API_V1_ENABLED === 'true') {
  if (!authV1) {
    throw new Error('CV_API_V1_ENABLED requires AUTH_V1_ENABLED=true');
  }

  app.use('/api/v1/cv', createCvRouter({
    service: createCvService({ store: createCvStore(authV1.pool) }),
    authenticate: authV1.authenticate,
    hasPermission: authV1.hasPermission,
    uploadDirectory: process.env.CV_UPLOAD_DIR,
  }));
}
app.use('/api/cv', cvRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api', jobScrapingRoutes);

app.get('/', (req, res) => {
  const endpoints = { health: 'GET /api/test/health' };
  if (process.env.AUTH_V1_ENABLED === 'true') {
    Object.assign(endpoints, {
      login: 'POST /api/v1/auth/login',
      register: 'POST /api/v1/auth/register',
      session: 'GET /api/v1/auth/session',
      profile: 'GET|PUT /api/v1/profile',
      profileSyntheses: 'GET|POST /api/v1/profile/syntheses',
    });
  }
  if (process.env.RIASEC_API_ENABLED === 'true') {
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

  res.status(200).json({
    success: true,
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    endpoints,
    corsOriginsConfigured: allowedOrigins.size,
    jsonLimit: '1mb',
  });
});

app.use((err, req, res, next) => {
  console.error('Global request error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
});

app.use('*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: ['GET /', 'GET /api/test/health'],
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Authentication v1 enabled: ${process.env.AUTH_V1_ENABLED === 'true'}`);
  console.log(`Profile API enabled: ${process.env.AUTH_V1_ENABLED === 'true'}`);
  console.log(`RIASEC API enabled: ${process.env.RIASEC_API_ENABLED === 'true'}`);
  console.log(`Career API enabled: ${process.env.CAREER_API_ENABLED === 'true'}`);
  console.log(`CV API v1 enabled: ${process.env.CV_API_V1_ENABLED === 'true'}`);
});

server.on('error', (err) => {
  console.error(`Backend server error: ${err.message}`);
});

const stopServer = (reason) => {
  console.log(`Stopping backend server${reason ? ` ${reason}` : ''}.`);
  server.close(async () => {
    await closeApplicationResources();
    console.log('Backend server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => stopServer('after SIGTERM'));
process.on('SIGINT', () => stopServer('after SIGINT'));
