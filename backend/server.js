
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Feature flags
const FEATURE_CHATBOT = process.env.FEATURE_CHATBOT === 'true';
const FEATURE_ANALYTICS = process.env.FEATURE_ANALYTICS === 'true';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'app_db'
};

// Pool de connexion MySQL
let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Vérifier la connexion
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données MySQL établie');
    
    // Initialiser les tables si elles n'existent pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Créer la table pour les feature flags
    await connection.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        feature_name VARCHAR(100) NOT NULL UNIQUE,
        is_enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insérer les feature flags par défaut
    await connection.query(`
      INSERT IGNORE INTO feature_flags (feature_name, is_enabled) 
      VALUES ('chatbot', ${FEATURE_CHATBOT}), ('analytics', ${FEATURE_ANALYTICS})
    `);
    
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Middleware pour vérifier le JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentification requise' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
    req.user = user;
    next();
  });
};

// Routes d'API
app.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length > 0) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insérer l'utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName]
    );
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Rechercher l'utilisateur
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const user = users[0];
    
    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_dev_key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route protégée pour tester l'authentification
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Route pour obtenir les feature flags
app.get('/feature-flags', async (req, res) => {
  try {
    const [flags] = await pool.query('SELECT * FROM feature_flags');
    
    const flagsObject = flags.reduce((acc, flag) => {
      acc[flag.feature_name] = flag.is_enabled;
      return acc;
    }, {});
    
    res.json(flagsObject);
  } catch (error) {
    console.error('Erreur lors de la récupération des feature flags:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Endpoint pour l'état de santé du serveur
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      chatbot: FEATURE_CHATBOT,
      analytics: FEATURE_ANALYTICS
    }
  });
});

// Initialiser la base de données avant de démarrer le serveur
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔍 Features activées: chatbot=${FEATURE_CHATBOT}, analytics=${FEATURE_ANALYTICS}`);
    });
  })
  .catch(err => {
    console.error('Impossible de démarrer le serveur:', err);
    process.exit(1);
  });
