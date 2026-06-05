import { apiFetch, showToast, setupNavbar, getToken, getUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Shared Navbar
  setupNavbar();

  // If user is already logged in, redirect away from auth page
  const token = getToken();
  const user = getUser();
  if (token && user) {
    window.location.href = '/pages/jobs.html';
    return;
  }

  // DOM elements selection
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  
  const registerRole = document.getElementById('register-role');
  const seekerFields = document.getElementById('seeker-fields');
  const recruiterFields = document.getElementById('recruiter-fields');

  // Input fields for validation toggles
  const companyInput = document.getElementById('recruiter-company');
  const skillsInput = document.getElementById('seeker-skills');
  const experienceInput = document.getElementById('seeker-experience');
  const resumeInput = document.getElementById('seeker-resume');

  // 1. Toggling between Login and Register Views
  function showLogin() {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  }

  function showRegister() {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);
  linkToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  linkToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  // 2. Toggle Role-Specific form fields dynamically
  registerRole.addEventListener('change', () => {
    const selectedRole = registerRole.value;
    if (selectedRole === 'job_seeker') {
      seekerFields.classList.remove('hidden');
      recruiterFields.classList.add('hidden');
      companyInput.removeAttribute('required');
    } else if (selectedRole === 'recruiter') {
      seekerFields.classList.add('hidden');
      recruiterFields.classList.remove('hidden');
      companyInput.setAttribute('required', 'true');
    }
  });

  // 3. Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const submitBtn = document.getElementById('login-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    // UI feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span>Logging in...`;

    try {
      const responseData = await apiFetch('/auth/login', 'POST', { email, password });
      
      // Save credentials in storage
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      showToast('Logged in successfully!', 'success');

      // Redirect based on role
      setTimeout(() => {
        if (responseData.user.role === 'recruiter') {
          window.location.href = '/pages/dashboard.html';
        } else {
          window.location.href = '/pages/jobs.html';
        }
      }, 1000);

    } catch (error) {
      showToast(error.message || 'Login failed. Please check details.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // 4. Handle Registration Submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const role = registerRole.value;

    // Build conditional payload
    const payload = { name, email, password, role };
    
    if (role === 'job_seeker') {
      payload.skills = skillsInput.value.trim();
      payload.experience = experienceInput.value ? parseInt(experienceInput.value) : 0;
      payload.resume_link = resumeInput.value.trim();
    } else if (role === 'recruiter') {
      payload.company_name = companyInput.value.trim();
    }

    const submitBtn = document.getElementById('register-btn');
    const originalBtnText = submitBtn.innerHTML;

    // UI feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span>Registering...`;

    try {
      const responseData = await apiFetch('/auth/register', 'POST', payload);

      // Auto login
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      showToast('Account registered successfully!', 'success');

      setTimeout(() => {
        if (responseData.user.role === 'recruiter') {
          window.location.href = '/pages/dashboard.html';
        } else {
          window.location.href = '/pages/jobs.html';
        }
      }, 1000);

    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});
