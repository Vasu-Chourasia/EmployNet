const pool = require('../config/db');

// Creates a job seeker profile linked to a user. Supports database transactions
async function createSeekerProfile(userId, skills, experience, resumeLink, connection = null) {
  const query = `
    INSERT INTO job_seekers (user_id, skills, experience, resume_link)
    VALUES (?, ?, ?, ?);
  `;
  const db = connection || pool;
  const [result] = await db.query(query, [userId, skills, experience || 0, resumeLink]);
  return result.insertId;
}

// Finds a job seeker profile by user ID
async function findSeekerByUserId(userId) {
  const query = `SELECT * FROM job_seekers WHERE user_id = ?;`;
  const [rows] = await pool.query(query, [userId]);
  return rows[0] || null;
}

// Finds a job seeker profile by seeker ID
async function findSeekerById(seekerId) {
  const query = `
    SELECT s.*, u.name, u.email 
    FROM job_seekers s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.seeker_id = ?;
  `;
  const [rows] = await pool.query(query, [seekerId]);
  return rows[0] || null;
}

module.exports = {
  createSeekerProfile,
  findSeekerByUserId,
  findSeekerById
};
