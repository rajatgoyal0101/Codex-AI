(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }
  root.Dashboard = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function safeParseJson(raw, fallbackValue) {
    if (!raw || typeof raw !== 'string') {
      return fallbackValue;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallbackValue;
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderList(items, emptyText) {
    if (!Array.isArray(items) || items.length === 0) {
      return `<p class="muted">${emptyText}</p>`;
    }

    const rows = items
      .map(function (item) {
        return `<li>${item}</li>`;
      })
      .join('');

    return `<ul>${rows}</ul>`;
  }

  function renderSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      return '<p class="muted">No settings available.</p>';
    }

    const rows = Object.keys(settings)
      .map(function (key) {
        return `<li><strong>${key}:</strong> ${settings[key]}</li>`;
      })
      .join('');

    return rows ? `<ul>${rows}</ul>` : '<p class="muted">No settings available.</p>';
  }

  function validateDashboardData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dashboard data is missing.');
    }

    return {
      loginHistory: Array.isArray(data.loginHistory) ? data.loginHistory : [],
      recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
      accountSettings: data.accountSettings && typeof data.accountSettings === 'object' ? data.accountSettings : {}
    };
  }

  function defaultProvider() {
    const fallback = {
      loginHistory: [
        'May 21, 2026 08:24 AM · Chrome · New Delhi',
        'May 19, 2026 10:10 PM · Safari · London'
      ],
      recentActivity: [
        'Published article: Why Clarity is the CEO\'s Greatest Advantage',
        'Updated profile headline and bio',
        'Replied to 3 partnership inquiries'
      ],
      accountSettings: {
        'Two-factor authentication': 'Enabled',
        'Email notifications': 'Daily summary',
        Language: 'English'
      }
    };

    if (typeof window === 'undefined' || !window.localStorage) {
      return Promise.resolve(fallback);
    }

    const persisted = safeParseJson(window.localStorage.getItem('rajatDashboardData'), fallback);
    return Promise.resolve(persisted);
  }

  function renderDashboard(target, data) {
    const normalized = validateDashboardData(data);

    const loginHistoryItems = normalized.loginHistory.map(function (entry) {
      if (typeof entry === 'string') {
        return entry;
      }

      return `${formatTimestamp(entry.time)} · ${entry.device || 'Unknown device'} · ${entry.location || 'Unknown location'}`;
    });

    target.innerHTML = `
      <div class="dashboard-grid">
        <article class="card">
          <h3>Login History</h3>
          ${renderList(loginHistoryItems, 'No login history available.')}
        </article>
        <article class="card">
          <h3>Recent Activity</h3>
          ${renderList(normalized.recentActivity, 'No recent activity available.')}
        </article>
        <article class="card">
          <h3>Account Settings</h3>
          ${renderSettings(normalized.accountSettings)}
        </article>
      </div>
    `;
  }

  function renderError(target, error) {
    target.innerHTML = `<div class="card error-card"><h3>Dashboard unavailable</h3><p>${error.message}</p></div>`;
  }

  async function initDashboard(options) {
    const settings = options || {};
    const rootElement = settings.rootElement || (typeof document !== 'undefined' ? document.getElementById('dashboard-content') : null);
    const provider = settings.provider || defaultProvider;

    if (!rootElement) {
      throw new Error('Dashboard container element not found.');
    }

    try {
      rootElement.innerHTML = '<p class="muted">Loading dashboard...</p>';
      const data = await provider();
      renderDashboard(rootElement, data);
    } catch (error) {
      renderError(rootElement, error);
      if (typeof settings.onError === 'function') {
        settings.onError(error);
      }
    }
  }

  return {
    defaultProvider: defaultProvider,
    formatTimestamp: formatTimestamp,
    initDashboard: initDashboard,
    renderDashboard: renderDashboard,
    safeParseJson: safeParseJson,
    validateDashboardData: validateDashboardData
  };
});
