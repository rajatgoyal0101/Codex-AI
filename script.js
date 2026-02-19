const yearElement = document.getElementById('year');
const form = document.querySelector('.contact-form');
const status = document.getElementById('form-status');
const refreshDashboardButton = document.getElementById('refresh-dashboard');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

if (form && status) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Thanks! Your message has been captured.';
    form.reset();
  });
}

async function loadDashboard() {
  if (!window.Dashboard || typeof window.Dashboard.initDashboard !== 'function') {
    return;
  }

  await window.Dashboard.initDashboard({
    onError: (error) => {
      console.error('Dashboard failed to load:', error);
    }
  });
}

loadDashboard();

if (refreshDashboardButton) {
  refreshDashboardButton.addEventListener('click', () => {
    loadDashboard();
  });
}
