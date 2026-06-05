const applicationService = require('../services/applicationService');

// Handles job application submission (seeker only)
async function apply(req, res) {
  try {
    const userId = req.user.user_id;
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required to apply.' });
    }

    const result = await applicationService.apply(userId, job_id);
    return res.status(201).json({
      message: 'Application submitted successfully!',
      application: result
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while submitting the application.';
    return res.status(status).json({ error: message });
  }
}

// Handles fetching seeker's own job applications
async function getMyApplications(req, res) {
  try {
    const userId = req.user.user_id;
    const applications = await applicationService.getMyApplications(userId);
    return res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching seeker applications:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while fetching your applications.';
    return res.status(status).json({ error: message });
  }
}

// Handles recruiter fetching applicants for their job listing
async function getJobApplicants(req, res) {
  try {
    const userId = req.user.user_id;
    const jobId = req.params.jobId;

    const applicants = await applicationService.getJobApplicants(userId, jobId);
    return res.status(200).json(applicants);
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while fetching applicants.';
    return res.status(status).json({ error: message });
  }
}

// Handles recruiter updating application status
async function updateStatus(req, res) {
  try {
    const userId = req.user.user_id;
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const result = await applicationService.updateStatus(userId, applicationId, status);
    return res.status(200).json({
      message: `Application status updated to ${status} successfully!`,
      application: result
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while updating status.';
    return res.status(status).json({ error: message });
  }
}

module.exports = {
  apply,
  getMyApplications,
  getJobApplicants,
  updateStatus
};
