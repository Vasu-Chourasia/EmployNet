const pool = require('../config/db');

// Inserts a new job record
async function createJob(recruiterId, title, description, location, salary) {
  const query = `
    INSERT INTO jobs (recruiter_id, title, description, location, salary)
    VALUES (?, ?, ?, ?, ?);
  `;
  const [result] = await pool.query(query, [recruiterId, title, description, location, salary]);
  return result.insertId;
}

// Fetches all jobs with recruiter company name, with optional filters
async function findAllJobs({ search, location, minSalary } = {}) {
  let query = `
    SELECT j.job_id, j.recruiter_id, j.title, j.description, j.location, j.salary, j.created_at,
           r.company_name, u.name AS recruiter_name
    FROM jobs j
    JOIN recruiters r ON j.recruiter_id = r.recruiter_id
    JOIN users u ON r.user_id = u.user_id
  `;
  
  const whereClauses = [];
  const params = [];

  if (search) {
    whereClauses.push('(j.title LIKE ? OR j.description LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (location) {
    whereClauses.push('j.location LIKE ?');
    params.push(`%${location}%`);
  }

  if (minSalary) {
    whereClauses.push('j.salary >= ?');
    params.push(parseFloat(minSalary));
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ` ORDER BY j.created_at DESC;`;

  const [rows] = await pool.query(query, params);
  return rows;
}

// Fetches a single job detail by job ID
async function findJobById(jobId) {
  const query = `
    SELECT j.job_id, j.recruiter_id, j.title, j.description, j.location, j.salary, j.created_at,
           r.company_name, u.name AS recruiter_name, u.email AS recruiter_email
    FROM jobs j
    JOIN recruiters r ON j.recruiter_id = r.recruiter_id
    JOIN users u ON r.user_id = u.user_id
    WHERE j.job_id = ?;
  `;
  const [rows] = await pool.query(query, [jobId]);
  return rows[0] || null;
}

// Count applicants per job for a recruiter (GROUP BY + COUNT)
async function findJobsByRecruiterIdWithCount(recruiterId) {
  const query = `
    SELECT j.job_id, j.title, j.location, j.salary, j.created_at, COUNT(a.application_id) AS total_applicants
    FROM jobs j
    LEFT JOIN applications a ON j.job_id = a.job_id
    WHERE j.recruiter_id = ?
    GROUP BY j.job_id, j.title, j.location, j.salary, j.created_at
    ORDER BY j.created_at DESC;
  `;
  const [rows] = await pool.query(query, [recruiterId]);
  return rows;
}

module.exports = {
  createJob,
  findAllJobs,
  findJobById,
  findJobsByRecruiterIdWithCount
};
