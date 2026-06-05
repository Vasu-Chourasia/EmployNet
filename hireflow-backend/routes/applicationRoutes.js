const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { verifyToken, isSeeker, isRecruiter } = require('../middleware/authMiddleware');

// POST /api/applications/apply -> Seeker applies for a job
router.post('/apply', verifyToken, isSeeker, applicationController.apply);

// GET /api/applications/my-applications -> Seeker retrieves their applications
router.get('/my-applications', verifyToken, isSeeker, applicationController.getMyApplications);

// GET /api/applications/job/:jobId -> Recruiter retrieves applicants for a specific job
router.get('/job/:jobId', verifyToken, isRecruiter, applicationController.getJobApplicants);

// PUT /api/applications/:id/status -> Recruiter updates status of an application (shortlist/reject)
router.put('/:id/status', verifyToken, isRecruiter, applicationController.updateStatus);

module.exports = router;
