const pool = require('../config/db');

// Creates a new user record. Supports passing an optional connection for transaction operations
async function createUser(name, email, hashedPassword, role, connection = null) {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?);
  `;
  const db = connection || pool;
  const [result] = await db.query(query, [name, email, hashedPassword, role]);
  return result.insertId;
}

// Finds a user by their email address
async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = ?;`;
  const [rows] = await pool.query(query, [email]);
  return rows[0] || null;
}

// Finds a user by their database ID
async function findUserById(userId) {
  const query = `SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?;`;
  const [rows] = await pool.query(query, [userId]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
