const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const userModel = require('../models/userModel');
const seekerModel = require('../models/seekerModel');
const recruiterModel = require('../models/recruiterModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hireflow_2026';
const JWT_EXPIRES_IN = '7d';

// Business logic for registering a new user
async function register({ name, email, password, role, ...profileData }) {
  // Check if role is valid
  if (!['job_seeker', 'recruiter'].includes(role)) {
    throw { status: 400, message: 'Invalid role specified.' };
  }

  // Check if user already exists
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw { status: 400, message: 'Email already registered.' };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Use connection for transaction to ensure Atomicity
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create base User record
    const userId = await userModel.createUser(name, email, hashedPassword, role, connection);

    // 2. Create profile based on Role
    if (role === 'job_seeker') {
      const { skills, experience, resume_link } = profileData;
      await seekerModel.createSeekerProfile(userId, skills, parseInt(experience || 0), resume_link, connection);
    } else if (role === 'recruiter') {
      const { company_name } = profileData;
      if (!company_name) {
        throw { status: 400, message: 'Company name is required for recruiters.' };
      }
      await recruiterModel.createRecruiterProfile(userId, company_name, connection);
    }

    await connection.commit();

    // 3. Generate token for auto-login after register
    const tokenPayload = { user_id: userId, name, role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return { token, user: tokenPayload };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Business logic for user login
async function login(email, password) {
  // 1. Find user by email
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Invalid credentials.' };
  }

  // 2. Verify password hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials.' };
  }

  // 3. Generate JWT Token
  const tokenPayload = { 
    user_id: user.user_id, 
    name: user.name, 
    role: user.role 
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { token, user: tokenPayload };
}

module.exports = {
  register,
  login
};
