const mysql = require('mysql2/promise');

const required = (env, name) => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const createDatabasePool = (env = process.env) => mysql.createPool({
  host: required(env, 'DB_HOST'),
  port: Number(env.DB_PORT || 3306),
  user: required(env, 'DB_USER'),
  password: required(env, 'DB_PASSWORD'),
  database: required(env, 'DB_NAME'),
  waitForConnections: true,
  connectionLimit: Number(env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: 'utf8mb4',
});

module.exports = { createDatabasePool };
