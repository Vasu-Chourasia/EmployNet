const pool = require('../config/db');

// Submits a new job application
async function createApplication(jobId, seekerId) {
  const query = `
    INSERT INTO applications (job_id, seeker_id, status)
    VALUES (?, ?, 'applied');
  `;
  const [result] = await pool.query(query, [jobId, seekerId]);
  return result.insertId;
}

// Checks if a job seeker has already applied to a job
async function findApplicationByJobAndSeeker(jobId, seekerId) {
  const query = `
    SELECT * FROM applications 
    WHERE job_id = ? AND seeker_id = ?;
  `;
  const [rows] = await pool.query(query, [jobId, seekerId]);
  return rows[0] || null;
}

// Fetches all applications for a seeker with job and recruiter details
async function findApplicationsBySeekerId(seekerId) {
  const query = `
    SELECT a.application_id, a.job_id, a.seeker_id, a.status, a.applied_at,
           j.title, j.location, j.salary, r.company_name
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN recruiters r ON j.recruiter_id = r.recruiter_id
    WHERE a.seeker_id = ?
    ORDER BY a.applied_at DESC;
  `;
  const [rows] = await pool.query(query, [seekerId]);
  return rows;
}

// Fetches all applicants for a specific job (for recruiter view)
async function findApplicantsByJobId(jobId) {
  const query = `
    SELECT a.application_id, a.status, a.applied_at, a.job_id,
           u.name, u.email, s.skills, s.experience, s.resume_link
    FROM applications a
    JOIN job_seekers s ON a.seeker_id = s.seeker_id
    JOIN users u ON s.user_id = u.user_id
    WHERE a.job_id = ?
    ORDER BY a.applied_at DESC;
  `;
  const [rows] = await pool.query(query, [jobId]);
  return rows;
}

// Updates application status (shortlisted / rejected)
async function updateApplicationStatus(applicationId, status) {
  const query = `
    UPDATE applications 
    SET status = ? 
    WHERE application_id = ?;
  `;
  const [result] = await pool.query(query, [status, applicationId]);
  return result.affectedRows > 0;
}

// Finds application details including job and recruiter ID (for auth checks)
async function findApplicationById(applicationId) {
  const query = `
    SELECT a.*, j.recruiter_id 
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    WHERE a.application_id = ?;
  `;
  const [rows] = await pool.query(query, [applicationId]);
  return rows[0] || null;
}

module.exports = {
  createApplication,
  findApplicationByJobAndSeeker,
  findApplicationsBySeekerId,
  findApplicantsByJobId,
  updateApplicationStatus,
  findApplicationById
};
