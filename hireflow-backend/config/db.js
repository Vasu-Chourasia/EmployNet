const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool to MySQL (with fallback to Railway environment variables)
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || ''),
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'employnet_db',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Test the connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Ensure that MySQL is running and details in .env are correct.');
  }
})();

module.exports = pool;
