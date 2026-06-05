const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_employnet_2026';

// Middleware to verify if a valid JWT is present in the request header
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Extract token from 'Bearer <token>' format
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded user info: { user_id, role, name }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Middleware to guard routes for Recruiter access only
function isRecruiter(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. No session found.' });
  }
  
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Access forbidden. Recruiters only.' });
  }
  
  next();
}

// Middleware to guard routes for Job Seeker access only
function isSeeker(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. No session found.' });
  }
  
  if (req.user.role !== 'job_seeker') {
    return res.status(403).json({ error: 'Access forbidden. Job seekers only.' });
  }
  
  next();
}

module.exports = {
  verifyToken,
  isRecruiter,
  isSeeker
};
