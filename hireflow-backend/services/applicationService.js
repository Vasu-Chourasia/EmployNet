const applicationModel = require('../models/applicationModel');
const seekerModel = require('../models/seekerModel');
const recruiterModel = require('../models/recruiterModel');
const jobModel = require('../models/jobModel');

// Applies to a job listing (seeker only)
async function apply(userId, jobId) {
  // 1. Fetch seeker profile linked to user ID
  const seeker = await seekerModel.findSeekerByUserId(userId);
  if (!seeker) {
    throw { status: 403, message: 'Job Seeker profile not found. Complete your seeker profile.' };
  }

  // 2. Verify the job exists
  const job = await jobModel.findJobById(jobId);
  if (!job) {
    throw { status: 404, message: 'Job not found.' };
  }

  // 3. Prevent duplicate applications
  const existingApp = await applicationModel.findApplicationByJobAndSeeker(jobId, seeker.seeker_id);
  if (existingApp) {
    throw { status: 400, message: 'Already applied to this job.' };
  }

  // 4. Create database application entry
  const appId = await applicationModel.createApplication(jobId, seeker.seeker_id);
  return { application_id: appId, job_id: jobId, status: 'applied' };
}

// Fetches applications submitted by seeker
async function getMyApplications(userId) {
  const seeker = await seekerModel.findSeekerByUserId(userId);
  if (!seeker) {
    throw { status: 403, message: 'Job Seeker profile not found.' };
  }

  return await applicationModel.findApplicationsBySeekerId(seeker.seeker_id);
}

// Fetches all applicants for a specific job (recruiter only)
async function getJobApplicants(userId, jobId) {
  // 1. Verify recruiter profile
  const recruiter = await recruiterModel.findRecruiterByUserId(userId);
  if (!recruiter) {
    throw { status: 403, message: 'Recruiter profile not found.' };
  }

  // 2. Verify that the job exists and belongs to the recruiter
  const job = await jobModel.findJobById(jobId);
  if (!job) {
    throw { status: 404, message: 'Job not found.' };
  }

  if (job.recruiter_id !== recruiter.recruiter_id) {
    throw { status: 403, message: 'Unauthorized. You do not own this job listing.' };
  }

  // 3. Fetch applicants from model
  return await applicationModel.findApplicantsByJobId(jobId);
}

// Updates the status of an application (recruiter only)
async function updateStatus(userId, applicationId, status) {
  if (!['shortlisted', 'rejected'].includes(status)) {
    throw { status: 400, message: 'Invalid status. Status must be either shortlisted or rejected.' };
  }

  // 1. Verify recruiter profile
  const recruiter = await recruiterModel.findRecruiterByUserId(userId);
  if (!recruiter) {
    throw { status: 403, message: 'Recruiter profile not found.' };
  }

  // 2. Find application and verify ownership
  const application = await applicationModel.findApplicationById(applicationId);
  if (!application) {
    throw { status: 404, message: 'Application not found.' };
  }

  // Check if job belongs to recruiter
  if (application.recruiter_id !== recruiter.recruiter_id) {
    throw { status: 403, message: 'Unauthorized. You cannot modify applications for other recruiters.' };
  }

  // 3. Perform update
  const success = await applicationModel.updateApplicationStatus(applicationId, status);
  if (!success) {
    throw { status: 500, message: 'Failed to update application status.' };
  }

  return { application_id: applicationId, status };
}

module.exports = {
  apply,
  getMyApplications,
  getJobApplicants,
  updateStatus
};
