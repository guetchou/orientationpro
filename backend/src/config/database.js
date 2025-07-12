
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3310,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'orientationpro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully to local MySQL server');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to local MySQL database:', error.message);
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
