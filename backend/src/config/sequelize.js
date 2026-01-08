const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration de la connexion Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'orientationpro',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Désactiver les logs SQL en production
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Test de connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion Sequelize établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Sequelize:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };
