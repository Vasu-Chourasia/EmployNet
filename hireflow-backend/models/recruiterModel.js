const pool = require('../config/db');

// Creates a recruiter profile linked to a user. Supports database transactions
async function createRecruiterProfile(userId, companyName, connection = null) {
  const query = `
    INSERT INTO recruiters (user_id, company_name)
    VALUES (?, ?);
  `;
  const db = connection || pool;
  const [result] = await db.query(query, [userId, companyName]);
  return result.insertId;
}

// Finds a recruiter profile by user ID
async function findRecruiterByUserId(userId) {
  const query = `SELECT * FROM recruiters WHERE user_id = ?;`;
  const [rows] = await pool.query(query, [userId]);
  return rows[0] || null;
}

// Finds a recruiter profile by recruiter ID
async function findRecruiterById(recruiterId) {
  const query = `
    SELECT r.*, u.name, u.email 
    FROM recruiters r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.recruiter_id = ?;
  `;
  const [rows] = await pool.query(query, [recruiterId]);
  return rows[0] || null;
}

module.exports = {
  createRecruiterProfile,
  findRecruiterByUserId,
  findRecruiterById
};
