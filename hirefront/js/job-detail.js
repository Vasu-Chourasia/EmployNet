import { apiFetch, setupNavbar, getUser, getToken, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Shared Navbar
  setupNavbar();

  // Extract Job ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    window.location.href = '/pages/jobs.html';
    return;
  }

  const loadingSec = document.getElementById('detail-loading-section');
  const contentSec = document.getElementById('detail-content-section');
  const applyActionsContainer = document.getElementById('apply-actions-container');

  let jobData = null;
  let alreadyApplied = false;

  // Render the Apply Panel actions dynamically
  function renderApplyPanel() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      // 1. Not logged in state
      applyActionsContainer.innerHTML = `
        <a href="/pages/index.html" class="btn btn-primary" style="width: 100%;">Login to Apply</a>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.75rem;">Create a Job Seeker account to submit your resume.</p>
      `;
      return;
    }

    if (user.role === 'recruiter') {
      // 2. Recruiter role state
      applyActionsContainer.innerHTML = `
        <button class="btn btn-secondary" style="width: 100%;" disabled>Recruiter Mode</button>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.75rem;">Recruiters cannot apply for job listings.</p>
      `;
      return;
    }

    // 3. Seeker states
    if (alreadyApplied) {
      applyActionsContainer.innerHTML = `
        <button class="btn btn-secondary" style="width: 100%; cursor: not-allowed;" disabled>Already Applied</button>
        <p style="font-size: 0.85rem; color: var(--status-shortlisted-text); margin-top: 0.75rem; font-weight: 600;">✓ Application submitted successfully</p>
      `;
    } else {
      applyActionsContainer.innerHTML = `
        <button class="btn btn-primary" id="apply-now-btn" style="width: 100%;">Apply Now</button>
      `;

      // Attach Click Handler
      const applyBtn = document.getElementById('apply-now-btn');
      applyBtn.addEventListener('click', handleApplySubmit);
    }
  }

  // Handle application submission
  async function handleApplySubmit() {
    const applyBtn = document.getElementById('apply-now-btn');
    const originalText = applyBtn.innerHTML;

    applyBtn.disabled = true;
    applyBtn.innerHTML = `<span class="spinner"></span>Submitting...`;

    try {
      await apiFetch('/applications/apply', 'POST', { job_id: parseInt(jobId) });
      
      showToast('Application submitted successfully!', 'success');
      alreadyApplied = true;
      renderApplyPanel();
    } catch (error) {
      showToast(error.message || 'Failed to submit application.', 'error');
      applyBtn.disabled = false;
      applyBtn.innerHTML = originalText;
    }
  }

  // Load Job Details & check Seeker application state
  async function init() {
    try {
      // 1. Fetch job profile details
      jobData = await apiFetch(`/jobs/${jobId}`);

      // 2. If user is seeker, fetch their current applications list to see if they already applied
      const token = getToken();
      const user = getUser();
      if (token && user && user.role === 'job_seeker') {
        try {
          const myApps = await apiFetch('/applications/my-applications');
          alreadyApplied = myApps.some(app => app.job_id === parseInt(jobId));
        } catch (e) {
          console.error('Error fetching user applications:', e.message);
        }
      }

      // Populate DOM elements
      document.getElementById('job-detail-company').textContent = jobData.company_name;
      document.getElementById('job-detail-title').textContent = jobData.title;
      document.getElementById('job-detail-description').textContent = jobData.description;
      document.getElementById('job-detail-location').textContent = jobData.location;
      document.getElementById('job-detail-recruiter').textContent = `Posted by ${jobData.recruiter_name}`;
      document.getElementById('job-detail-email').textContent = jobData.recruiter_email;

      // Salary formatting
      const salaryFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(jobData.salary);
      document.getElementById('job-detail-salary').innerHTML = `${salaryFormatted} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">/ yr</span>`;

      // Date formatting
      const datePosted = new Date(jobData.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      document.getElementById('job-detail-posted-date').textContent = `Posted on ${datePosted}`;

      // Render button actions panel
      renderApplyPanel();

      // Show sections
      loadingSec.classList.add('hidden');
      contentSec.classList.remove('hidden');

    } catch (error) {
      console.error(error);
      loadingSec.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--status-rejected-text);">
          <h3>Error Loading Job details</h3>
          <p>${error.message || 'Job Listing does not exist or server error.'}</p>
          <a href="/pages/jobs.html" class="btn btn-secondary" style="margin-top: 1rem;">Back to Jobs</a>
        </div>
      `;
    }
  }

  // Execute
  init();
});
