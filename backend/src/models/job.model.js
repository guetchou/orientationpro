const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

/**
 * Modèle pour les offres d'emploi
 */
const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Brazzaville, Congo'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  salary: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel', 'Intérim'),
    allowNull: false,
    defaultValue: 'CDI'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Autre'
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  scrapedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  applications: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    {
      fields: ['isActive', 'publishedDate']
    },
    {
      fields: ['category']
    },
    {
      fields: ['location']
    },
    {
      fields: ['company']
    },
    {
      fields: ['source']
    },
    {
      fields: ['title']
    }
  ]
});

module.exports = { Job };
