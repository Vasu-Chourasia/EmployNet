import { apiFetch, setupNavbar, getUser, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Shared Navbar
  setupNavbar();

  // Show "Post a Job" action button if user is a recruiter
  const user = getUser();
  const token = getToken();
  const postJobBtn = document.getElementById('post-job-nav-btn');
  
  if (token && user && user.role === 'recruiter') {
    postJobBtn.classList.remove('hidden');
    postJobBtn.addEventListener('click', () => {
      // Redirect to recruiter dashboard where posting form resides
      window.location.href = '/pages/dashboard.html?action=post';
    });
  }

  const filterForm = document.getElementById('jobs-filter-form');
  const cardsGrid = document.getElementById('jobs-cards-grid');
  const countText = document.getElementById('jobs-count-text');

  // Function to load and render jobs
  async function loadJobs(filters = {}) {
    cardsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <span class="spinner" style="width: 32px; height: 32px;"></span>
        <p>Fetching matching jobs...</p>
      </div>
    `;

    try {
      // Construct API URL query string
      let queryString = '';
      const params = [];
      
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.location) params.push(`location=${encodeURIComponent(filters.location)}`);
      if (filters.minSalary) params.push(`minSalary=${encodeURIComponent(filters.minSalary)}`);
      
      if (params.length > 0) {
        queryString = '?' + params.join('&');
      }

      const jobs = await apiFetch(`/jobs${queryString}`);
      
      // Update UI counts
      countText.textContent = `Showing ${jobs.length} active job${jobs.length === 1 ? '' : 's'}`;

      if (jobs.length === 0) {
        cardsGrid.innerHTML = `
          <div class="no-jobs-container">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <h3>No Jobs Found</h3>
            <p>Try resetting your search query or choosing different filters.</p>
          </div>
        `;
        return;
      }

      // Render job cards
      cardsGrid.innerHTML = jobs.map(job => {
        // Format Salary
        const formattedSalary = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(job.salary);

        // Format Date
        const datePosted = new Date(job.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return `
          <div class="card job-card">
            <div class="job-card-top">
              <div class="job-company">${escapeHtml(job.company_name)}</div>
              <h3 class="job-title">${escapeHtml(job.title)}</h3>
              <div class="job-meta">
                <div class="job-meta-item">
                  <!-- Pin icon -->
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>${escapeHtml(job.location)}</span>
                </div>
                <div class="job-meta-item">
                  <!-- Calendar icon -->
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>Posted ${datePosted}</span>
                </div>
              </div>
              <p class="job-description-preview">${escapeHtml(job.description)}</p>
            </div>
            <div class="job-card-bottom">
              <div class="job-salary-range">${formattedSalary} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">/ yr</span></div>
              <a href="/pages/job-detail.html?id=${job.job_id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View Details</a>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--status-rejected-text);">
          <p>Failed to load job listings. Server might be offline.</p>
        </div>
      `;
    }
  }

  // 3. Search Form Submit Handler
  filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const search = document.getElementById('search-input').value.trim();
    const location = document.getElementById('location-input').value.trim();
    const minSalary = document.getElementById('salary-input').value.trim();

    loadJobs({ search, location, minSalary });
  });

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

  // Initial Load
  loadJobs();
});
