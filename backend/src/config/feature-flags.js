
const { pool } = require('./database');

const getFeatureFlags = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM feature_flags');
    const flags = {};
    
    rows.forEach(row => {
      flags[row.name] = row.enabled;
    });
    
    return flags;
  } catch (error) {
    console.error('Error fetching feature flags:', error.message);
    // Default fallback values if DB query fails
    return {
      FEATURE_CHATBOT: process.env.FEATURE_CHATBOT === 'true',
      FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS === 'true'
    };
  }
};

module.exports = { getFeatureFlags };
