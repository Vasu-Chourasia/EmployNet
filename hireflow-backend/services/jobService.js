const jobModel = require('../models/jobModel');
const recruiterModel = require('../models/recruiterModel');

// Retrieves all jobs from model with filters
async function getAllJobs(filters) {
  return await jobModel.findAllJobs(filters);
}

// Retrieves details of a single job
async function getJobById(jobId) {
  const job = await jobModel.findJobById(jobId);
  if (!job) {
    throw { status: 404, message: 'Job not found.' };
  }
  return job;
}

// Handles posting a new job listing
async function postJob(userId, { title, description, location, salary }) {
  // Find recruiter details corresponding to user ID
  const recruiter = await recruiterModel.findRecruiterByUserId(userId);
  if (!recruiter) {
    throw { status: 403, message: 'Profile mismatch. Recruiter profile not found.' };
  }

  if (!title || !description || !location || !salary) {
    throw { status: 400, message: 'All job details (title, description, location, salary) are required.' };
  }

  const parsedSalary = parseFloat(salary);
  if (isNaN(parsedSalary) || parsedSalary <= 0) {
    throw { status: 400, message: 'Salary must be a positive number.' };
  }

  const jobId = await jobModel.createJob(recruiter.recruiter_id, title, description, location, parsedSalary);
  return { job_id: jobId, title, location, salary: parsedSalary };
}

// Retrieves all jobs posted by the recruiter with applicant counts
async function getRecruiterJobs(userId) {
  const recruiter = await recruiterModel.findRecruiterByUserId(userId);
  if (!recruiter) {
    throw { status: 403, message: 'Recruiter profile not found.' };
  }

  return await jobModel.findJobsByRecruiterIdWithCount(recruiter.recruiter_id);
}

module.exports = {
  getAllJobs,
  getJobById,
  postJob,
  getRecruiterJobs
};
