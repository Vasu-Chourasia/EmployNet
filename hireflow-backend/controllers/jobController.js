const jobService = require('../services/jobService');

// Handles retrieval of all jobs with optional filters
async function getAllJobs(req, res) {
  try {
    const { search, location, minSalary } = req.query;
    const jobs = await jobService.getAllJobs({ search, location, minSalary });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while fetching jobs.';
    return res.status(status).json({ error: message });
  }
}

// Handles retrieval of a single job's details
async function getJobById(req, res) {
  try {
    const jobId = req.params.id;
    const job = await jobService.getJobById(jobId);
    return res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while fetching job details.';
    return res.status(status).json({ error: message });
  }
}

// Handles posting a new job listing
async function postJob(req, res) {
  try {
    const userId = req.user.user_id; // Added by authMiddleware
    const { title, description, location, salary } = req.body;
    
    const result = await jobService.postJob(userId, { title, description, location, salary });
    return res.status(201).json({
      message: 'Job posted successfully!',
      job: result
    });
  } catch (error) {
    console.error('Error posting job:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while posting the job.';
    return res.status(status).json({ error: message });
  }
}

// Handles fetching jobs posted by the logged-in recruiter with statistics
async function getRecruiterJobs(req, res) {
  try {
    const userId = req.user.user_id;
    const jobs = await jobService.getRecruiterJobs(userId);
    return res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    const status = error.status || 500;
    const message = error.message || 'An error occurred while fetching your jobs.';
    return res.status(status).json({ error: message });
  }
}

module.exports = {
  getAllJobs,
  getJobById,
  postJob,
  getRecruiterJobs
};
