import { apiFetch, setupNavbar, getUser, getToken, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Shared Navbar
  setupNavbar();

  // 1. Guard check: Check if user is logged in
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = '/pages/index.html';
    return;
  }

  // Remove initial page loading indicator
  const loadingIndicator = document.getElementById('dashboard-loading');
  if (loadingIndicator) loadingIndicator.classList.add('hidden');

  // Route to correct view based on Role
  if (user.role === 'job_seeker') {
    initSeekerDashboard();
  } else if (user.role === 'recruiter') {
    initRecruiterDashboard();
  }

  // ==============================================================
  // JOB SEEKER DASHBOARD LOGIC
  // ==============================================================
  async function initSeekerDashboard() {
    const seekerSection = document.getElementById('seeker-dashboard');
    seekerSection.classList.remove('hidden');

    const applicationsTbody = document.getElementById('seeker-applications-tbody');
    
    // Stats elements
    const statApplied = document.getElementById('seeker-stat-applied');
    const statShortlisted = document.getElementById('seeker-stat-shortlisted');
    const statRejected = document.getElementById('seeker-stat-rejected');

    try {
      applicationsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem;">
            <span class="spinner"></span> Loading applications history...
          </td>
        </tr>
      `;

      // Fetch Applications
      const applications = await apiFetch('/applications/my-applications');

      // Calculate Stats
      let appliedCount = 0;
      let shortlistedCount = 0;
      let rejectedCount = 0;

      applications.forEach(app => {
        if (app.status === 'applied') appliedCount++;
        else if (app.status === 'shortlisted') shortlistedCount++;
        else if (app.status === 'rejected') rejectedCount++;
      });

      statApplied.textContent = applications.length;
      statShortlisted.textContent = shortlistedCount;
      statRejected.textContent = rejectedCount;

      if (applications.length === 0) {
        applicationsTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
              You haven't applied to any jobs yet. 
              <a href="/pages/jobs.html" style="color: var(--accent-blue); text-decoration: none; font-weight: 600; margin-left: 0.5rem;">Browse Jobs</a>
            </td>
          </tr>
        `;
        return;
      }

      // Render Rows
      applicationsTbody.innerHTML = applications.map(app => {
        const salaryFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(app.salary);

        const dateApplied = new Date(app.applied_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        let badgeClass = 'badge-applied';
        if (app.status === 'shortlisted') badgeClass = 'badge-shortlisted';
        else if (app.status === 'rejected') badgeClass = 'badge-rejected';

        return `
          <tr>
            <td><a href="/pages/job-detail.html?id=${app.job_id}" style="color: var(--text-main); font-weight: 600; text-decoration: none; border-bottom: 1px dotted var(--border-color);">${escapeHtml(app.title)}</a></td>
            <td style="color: var(--accent-blue); font-weight: 600;">${escapeHtml(app.company_name)}</td>
            <td>${escapeHtml(app.location)}</td>
            <td>${salaryFormatted}</td>
            <td><span class="badge ${badgeClass}">${app.status}</span></td>
            <td>${dateApplied}</td>
          </tr>
        `;
      }).join('');

    } catch (error) {
      showToast(error.message || 'Error loading dashboard applications.', 'error');
    }
  }

  // ==============================================================
  // RECRUITER DASHBOARD LOGIC
  // ==============================================================
  async function initRecruiterDashboard() {
    const recruiterSection = document.getElementById('recruiter-dashboard');
    recruiterSection.classList.remove('hidden');

    const jobsTbody = document.getElementById('recruiter-jobs-tbody');
    
    // Stats elements
    const statJobs = document.getElementById('recruiter-stat-jobs');
    const statApplicants = document.getElementById('recruiter-stat-applicants');

    // Modals & Navigation triggers
    const postModal = document.getElementById('post-job-modal');
    const openPostModalBtn = document.getElementById('open-post-modal-btn');
    const closePostModalBtn = document.getElementById('close-post-modal-btn');
    const postJobForm = document.getElementById('post-job-form');

    // Applicants view triggers
    const closeApplicantsBtn = document.getElementById('close-applicants-btn');
    const jobsSection = document.getElementById('recruiter-jobs-section');
    const applicantsSection = document.getElementById('recruiter-applicants-section');

    // Modal Events
    openPostModalBtn.addEventListener('click', () => postModal.classList.add('open'));
    closePostModalBtn.addEventListener('click', () => postModal.classList.remove('open'));
    
    // Check URL parameters to see if recruiter wants to post a job directly
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'post') {
      postModal.classList.add('open');
    }

    // Refresh function for job postings list
    async function refreshPostedJobs() {
      try {
        jobsTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem;">
              <span class="spinner"></span> Fetching job postings...
            </td>
          </tr>
        `;

        const jobs = await apiFetch('/jobs/my-jobs');
        
        statJobs.textContent = jobs.length;
        
        const totalCandidates = jobs.reduce((sum, job) => sum + job.total_applicants, 0);
        statApplicants.textContent = totalCandidates;

        if (jobs.length === 0) {
          jobsTbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                You haven't posted any jobs yet. Click 'Post New Job' to start recruiting.
              </td>
            </tr>
          `;
          return;
        }

        jobsTbody.innerHTML = jobs.map(job => {
          const salaryFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(job.salary);

          const datePosted = new Date(job.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(job.title)}</td>
              <td>${escapeHtml(job.location)}</td>
              <td>${salaryFormatted}</td>
              <td>${datePosted}</td>
              <td style="font-weight: bold; padding-left: 2rem;">
                <span class="badge ${job.total_applicants > 0 ? 'badge-applied' : 'badge-secondary'}" style="background-color: ${job.total_applicants > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)'};">
                  ${job.total_applicants}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary view-apps-btn" data-jobid="${job.job_id}" data-title="${escapeHtml(job.title)}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                  Manage Candidates
                </button>
              </td>
            </tr>
          `;
        }).join('');

        // Attach click handlers to "Manage Candidates" buttons
        document.querySelectorAll('.view-apps-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const jobId = btn.getAttribute('data-jobid');
            const jobTitle = btn.getAttribute('data-title');
            viewJobApplicants(jobId, jobTitle);
          });
        });

      } catch (error) {
        showToast(error.message || 'Error fetching posted jobs.', 'error');
      }
    }

    // Modal submit handler to post job
    postJobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('post-job-title').value.trim();
      const location = document.getElementById('post-job-location').value.trim();
      const salary = document.getElementById('post-job-salary').value;
      const description = document.getElementById('post-job-desc').value.trim();

      const submitBtn = document.getElementById('submit-job-btn');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner"></span>Publishing...`;

      try {
        await apiFetch('/jobs', 'POST', { title, location, salary, description });
        showToast('Job listing published successfully!', 'success');
        postJobForm.reset();
        postModal.classList.remove('open');
        
        // Refresh listings
        refreshPostedJobs();
      } catch (error) {
        showToast(error.message || 'Failed to post job listing.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });

    // Load Applicants panel for specific job posting
    async function viewJobApplicants(jobId, jobTitle) {
      jobsSection.classList.add('hidden');
      applicantsSection.classList.remove('hidden');

      const applicantsTbody = document.getElementById('job-applicants-tbody');
      const appTitle = document.getElementById('job-applicants-title');
      const appSubtitle = document.getElementById('job-applicants-subtitle');
      const appCountText = document.getElementById('job-applicants-count');

      appSubtitle.textContent = `Job Title: ${jobTitle}`;
      applicantsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem;">
            <span class="spinner"></span> Retrieving candidates...
          </td>
        </tr>
      `;

      try {
        const candidates = await apiFetch(`/applications/job/${jobId}`);
        appCountText.textContent = `${candidates.length} candidate${candidates.length === 1 ? '' : 's'}`;

        if (candidates.length === 0) {
          applicantsTbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                No applications submitted for this listing yet.
              </td>
            </tr>
          `;
          return;
        }

        // Render applicant rows
        applicantsTbody.innerHTML = candidates.map(cand => {
          const dateApplied = new Date(cand.applied_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          // Resume link logic
          let resumeLinkHtml = `<span style="color: var(--text-muted); font-size: 0.85rem;">No Resume</span>`;
          if (cand.resume_link) {
            resumeLinkHtml = `<a href="${escapeHtml(cand.resume_link)}" target="_blank" class="resume-btn-link">View Resume</a>`;
          }

          // Build select dropdown status values
          const isApplied = cand.status === 'applied' ? 'selected' : '';
          const isShortlisted = cand.status === 'shortlisted' ? 'selected' : '';
          const isRejected = cand.status === 'rejected' ? 'selected' : '';

          return `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(cand.name)}</td>
              <td><a href="mailto:${cand.email}" style="color: var(--text-muted); text-decoration: none;">${escapeHtml(cand.email)}</a></td>
              <td><div class="applicant-skills" title="${escapeHtml(cand.skills)}">${escapeHtml(cand.skills || 'None')}</div></td>
              <td style="font-weight: 600;">${cand.experience} yrs</td>
              <td>${resumeLinkHtml}</td>
              <td>
                <select class="status-select select-status-action" data-appid="${cand.application_id}">
                  <option value="applied" ${isApplied} disabled>Applied</option>
                  <option value="shortlisted" ${isShortlisted}>Shortlist</option>
                  <option value="rejected" ${isRejected}>Reject</option>
                </select>
              </td>
            </tr>
          `;
        }).join('');

        // Attach event listeners to select actions
        document.querySelectorAll('.select-status-action').forEach(selectEl => {
          selectEl.addEventListener('change', async (e) => {
            const applicationId = selectEl.getAttribute('data-appid');
            const newStatus = selectEl.value;

            try {
              await apiFetch(`/applications/${applicationId}/status`, 'PUT', { status: newStatus });
              showToast(`Candidate status updated to ${newStatus}`, 'success');
              
              // Apply simple css style adjustments depending on status
              if (newStatus === 'shortlisted') {
                selectEl.style.borderColor = 'var(--status-shortlisted-text)';
              } else if (newStatus === 'rejected') {
                selectEl.style.borderColor = 'var(--status-rejected-text)';
              }
            } catch (error) {
              showToast(error.message || 'Failed to update candidate status.', 'error');
            }
          });

          // Style selects according to status color code
          const val = selectEl.value;
          if (val === 'shortlisted') selectEl.style.borderColor = 'var(--status-shortlisted-text)';
          else if (val === 'rejected') selectEl.style.borderColor = 'var(--status-rejected-text)';
        });

      } catch (error) {
        showToast(error.message || 'Error loading applicants details.', 'error');
      }
    }

    // Go back from applicants lists to jobs postings
    closeApplicantsBtn.addEventListener('click', () => {
      applicantsSection.classList.add('hidden');
      jobsSection.classList.remove('hidden');
      refreshPostedJobs();
    });

    // Execute posted jobs retrieval on load
    refreshPostedJobs();
  }

  // Helper function to escape HTML to prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
});
