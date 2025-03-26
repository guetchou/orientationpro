
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'rj8dl.myd.infomaniak.com',
  user: process.env.MYSQL_USER || 'rj8dl_ambangue',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'Admin242@BZV#',
  database: process.env.MYSQL_DATABASE || 'rj8dl_orientationpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully to Infomaniak server');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to Infomaniak database:', error.message);
    return false;
  }
};

// Function to migrate data if needed
const migrateData = async (sourcePool, targetPool, table) => {
  try {
    // Get data from source
    const [rows] = await sourcePool.query(`SELECT * FROM ${table}`);
    
    if (rows.length === 0) {
      console.log(`No data to migrate for table ${table}`);
      return true;
    }
    
    // Insert into target
    const fields = Object.keys(rows[0]).join(', ');
    const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
    
    for (const row of rows) {
      const values = Object.values(row);
      await targetPool.query(`INSERT INTO ${table} (${fields}) VALUES (${placeholders})`, values);
    }
    
    console.log(`Successfully migrated ${rows.length} rows for table ${table}`);
    return true;
  } catch (error) {
    console.error(`Error migrating data for table ${table}:`, error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  migrateData
};
