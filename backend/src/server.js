const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const cvRoutes = require('./routes/cv.routes');
const candidatesRoutes = require('./routes/candidates.routes');
const jobsRoutes = require('./routes/jobs.routes');
const atsRoutes = require('./routes/ats.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const messagingRoutes = require('./routes/messaging.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const matchingRoutes = require('./routes/matching.routes');
const communicationRoutes = require('./routes/communication.routes');
const jobScrapingRoutes = require('./routes/jobScraping.routes');
const { createConfiguredAuthV1 } = require('./auth-v1/bootstrap');

// Import du service de scraping (désactivé temporairement)
// const jobScrapingService = require('./services/jobScrapingService');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
let closeAuthV1 = async () => undefined;

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Middleware pour forcer les réponses JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Routes API
app.use('/api/test', testRoutes);
if (process.env.LEGACY_AUTH_ENABLED === 'true') {
  app.use('/api/auth', authRoutes);
}
if (process.env.AUTH_V1_ENABLED === 'true') {
  const authV1 = createConfiguredAuthV1(process.env);
  closeAuthV1 = authV1.close;
  app.use('/api/v1/auth', authV1.router);
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

// Route racine avec diagnostic complet
app.get('/', (req, res) => {
  const response = {
    success: true,
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    endpoints: process.env.AUTH_V1_ENABLED === 'true'
      ? {
          health: 'GET /api/test/health',
          login: 'POST /api/v1/auth/login',
          register: 'POST /api/v1/auth/register',
          session: 'GET /api/v1/auth/session',
        }
      : { health: 'GET /api/test/health' },
    corsOriginsConfigured: allowedOrigins.size,
    jsonLimit: '1mb'
  };
  res.status(200).json(response);
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Global request error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  const errorResponse = {
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };
  
  res.status(500).json(errorResponse);
});

// Gestionnaire 404 pour toutes les routes non trouvées
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  
  const notFoundResponse = {
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: ['GET /', 'GET /api/test/health']
  };
  
  res.status(404).json(notFoundResponse);
});

// Démarrage du serveur avec gestion d'erreurs améliorée
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Authentication v1 enabled: ${process.env.AUTH_V1_ENABLED === 'true'}`);
});

// Gestion des erreurs de serveur
server.on('error', (err) => {
  console.error(`Backend server error: ${err.message}`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('Stopping backend server.');
  server.close(async () => {
    await closeAuthV1();
    console.log('Backend server stopped.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Stopping backend server after interrupt.');
  server.close(async () => {
    await closeAuthV1();
    console.log('Backend server stopped.');
    process.exit(0);
  });
});

module.exports = app;
