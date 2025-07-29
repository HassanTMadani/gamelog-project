// config/database.js
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

// Create a connection pool. This is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use promise API for modern syntax
module.exports = pool.promise();

console.log('Database connection pool created.');