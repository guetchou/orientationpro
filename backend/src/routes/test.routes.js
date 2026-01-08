
const express = require('express');
const router = express.Router();

// Route de test de santé du serveur
router.get('/health', (req, res) => {
  console.log('Test de santé appelé');
  
  try {
    res.status(200).json({ 
      success: true,
      status: 'OK', 
      message: 'Backend server is running successfully',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    });
  } catch (error) {
    console.error('Erreur dans le test de santé:', error);
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Erreur lors du test de santé',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de test de connexion base de données (si nécessaire)
router.get('/db', async (req, res) => {
  try {
    // Si vous avez une base de données configurée, testez-la ici
    res.status(200).json({
      success: true,
      message: 'Database connection test',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur de connexion DB:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
