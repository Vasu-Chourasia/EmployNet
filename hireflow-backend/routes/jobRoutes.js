const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, isRecruiter } = require('../middleware/authMiddleware');

// GET /api/jobs -> Retrieve all jobs with optional filters (public)
router.get('/', jobController.getAllJobs);

// GET /api/jobs/my-jobs -> Retrieve jobs posted by logged-in recruiter (protected, recruiter only)
// Note: Must be placed BEFORE /:id route to prevent 'my-jobs' being parsed as a job ID
router.get('/my-jobs', verifyToken, isRecruiter, jobController.getRecruiterJobs);

// GET /api/jobs/:id -> Retrieve details for a single job (public)
router.get('/:id', jobController.getJobById);

// POST /api/jobs -> Create a new job listing (protected, recruiter only)
router.post('/', verifyToken, isRecruiter, jobController.postJob);

module.exports = router;
