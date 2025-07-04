
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Configuration plus permissive pour le développement
app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origine (comme Postman) et les origines localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Pour le développement, accepter toutes les origines
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging amélioré
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);

// Route racine avec informations de debug
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API is running successfully',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /api/test/health - Test de santé du serveur',
      'POST /api/auth/login - Connexion utilisateur/admin',
      'POST /api/auth/register - Inscription utilisateur',
      'POST /api/auth/create-super-admin - Création super admin'
    ],
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de gestion d'erreurs amélioré
app.use((err, req, res, next) => {
  console.error('Erreur détaillée:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  res.status(500).json({ 
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur s\'est produite',
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire 404 amélioré
app.use('*', (req, res) => {
  console.log(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée',
    requestedPath: req.originalUrl,
    availableRoutes: ['/api/test/health', '/api/auth/login', '/api/auth/register'],
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur avec gestion d'erreurs
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré avec succès sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔍 Test de santé: http://localhost:${PORT}/api/test/health`);
  console.log(`🔐 Connexion: http://localhost:${PORT}/api/auth/login`);
  console.log(`📅 Démarré à: ${new Date().toISOString()}`);
});

server.on('error', (err) => {
  console.error('❌ Erreur du serveur:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé. Essayez un autre port.`);
  }
});

module.exports = app;
