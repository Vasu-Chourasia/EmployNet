const authService = require('../services/authService');

// Handles user registration requests
async function register(req, res) {
  try {
    const { name, email, password, role, skills, experience, resume_link, company_name } = req.body;
    
    // Call registration service with destructured data
    const result = await authService.register({
      name,
      email,
      password,
      role,
      skills,
      experience,
      resume_link,
      company_name
    });

    return res.status(201).json({
      message: 'Registration successful!',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error during registration:', error);
    const status = error.status || 500;
    const message = error.message || 'An internal server error occurred during registration.';
    return res.status(status).json({ error: message });
  }
}

// Handles user login requests
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      message: 'Login successful!',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Error during login:', error);
    const status = error.status || 500;
    const message = error.message || 'An internal server error occurred during login.';
    return res.status(status).json({ error: message });
  }
}

module.exports = {
  register,
  login
};
