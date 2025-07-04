
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS très permissive pour le développement
app.use(cors({
  origin: function(origin, callback) {
    // Permettre toutes les origines en développement
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON avec des limites généreuses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging pour debug
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  
  // Log des headers importants
  if (req.headers['content-type']) {
    console.log(`  Content-Type: ${req.headers['content-type']}`);
  }
  
  // Log du body pour les requêtes POST/PUT (sans les mots de passe)
  if (req.method === 'POST' || req.method === 'PUT') {
    const bodyLog = { ...req.body };
    if (bodyLog.password) bodyLog.password = '***';
    console.log(`  Body:`, bodyLog);
  }
  
  next();
});

// Middleware pour forcer les réponses JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Routes API
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);

// Route racine avec diagnostic complet
app.get('/', (req, res) => {
  const response = {
    success: true,
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    endpoints: {
      health: 'GET /api/test/health',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      verifyAdmin: 'GET /api/auth/verify-admin'
    },
    testAccounts: {
      admin: {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      },
      user: {
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      }
    },
    corsEnabled: true,
    jsonLimit: '10mb'
  };
  
  console.log('Route racine appelée, réponse:', response);
  res.status(200).json(response);
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', {
    message: err.message,
    stack: err.stack,
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
  console.log(`❌ Route non trouvée: ${req.method} ${req.originalUrl}`);
  
  const notFoundResponse = {
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/test/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/verify-admin'
    ]
  };
  
  res.status(404).json(notFoundResponse);
});

// Démarrage du serveur avec gestion d'erreurs améliorée
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎉 ================================');
  console.log('🚀 SERVEUR BACKEND DÉMARRÉ !');
  console.log('🎉 ================================');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Santé: http://localhost:${PORT}/api/test/health`);
  console.log(`🔐 Connexion: http://localhost:${PORT}/api/auth/login`);
  console.log(`📅 Démarré: ${new Date().toLocaleString()}`);
  console.log(`🛠️  Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('🎉 ================================\n');
  
  // Test de l'endpoint de santé au démarrage
  setTimeout(() => {
    console.log('🔍 Test automatique de l\'endpoint de santé...');
  }, 1000);
});

// Gestion des erreurs de serveur
server.on('error', (err) => {
  console.error('\n❌ ================================');
  console.error('❌ ERREUR DE SERVEUR');
  console.error('❌ ================================');
  console.error('Erreur:', err.message);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé !`);
    console.error('💡 Solutions possibles:');
    console.error('   1. Arrêtez le processus qui utilise le port');
    console.error('   2. Changez le port dans le fichier .env');
    console.error('   3. Utilisez: kill -9 $(lsof -ti:3000)');
  }
  
  console.error('❌ ================================\n');
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur (Ctrl+C)...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;
