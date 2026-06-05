// Central API configuration and fetch wrapper
const BASE_URL = window.location.origin + '/api';


// Retrieve token from localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Retrieve user info from localStorage
export function getUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

// Perform API Fetch with auth token support and 401 handling
export async function apiFetch(endpoint, method = 'GET', body = null) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    // Handle token expiration/invalidity
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if unauthorized
      window.location.href = '/pages/index.html';
      throw new Error('Session expired or unauthorized. Redirecting to login...');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
}

// Toast Helper to display modern success/error alerts
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginLeft = '1rem';
  closeBtn.style.fontSize = '1.25rem';
  closeBtn.onclick = () => toast.remove();
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Setup common navbar links dynamically depending on auth status
export function setupNavbar() {
  const navbarEl = document.querySelector('.navbar');
  if (!navbarEl) return;

  const user = getUser();
  const token = getToken();

  let navContent = `
    <a href="/pages/index.html" class="logo-container">
      <div class="logo-icon">H</div>
      <div class="logo-text">HireFlow</div>
    </a>
    <ul class="nav-links">
      <li><a href="/pages/jobs.html" class="nav-link" id="nav-jobs">Browse Jobs</a></li>
  `;

  if (token && user) {
    navContent += `
      <li><a href="/pages/dashboard.html" class="nav-link" id="nav-dashboard">Dashboard</a></li>
      <li><span class="nav-link" style="color: var(--text-main); font-weight: 600; cursor: default;">Hi, ${user.name}</span></li>
      <li><button class="btn btn-secondary" id="logout-btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Logout</button></li>
    `;
  } else {
    navContent += `
      <li><a href="/pages/index.html" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Sign In</a></li>
    `;
  }

  navContent += `</ul>`;
  navbarEl.innerHTML = navContent;

  // Active state highlighting
  const currentPath = window.location.pathname;
  if (currentPath.includes('jobs.html')) {
    document.getElementById('nav-jobs')?.classList.add('active');
  } else if (currentPath.includes('dashboard.html')) {
    document.getElementById('nav-dashboard')?.classList.add('active');
  }

  // Logout trigger
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '/pages/index.html';
      }, 800);
    });
  }
}
