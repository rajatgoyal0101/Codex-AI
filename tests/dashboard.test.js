const test = require('node:test');
const assert = require('node:assert/strict');

const {
  safeParseJson,
  formatTimestamp,
  validateDashboardData,
  renderDashboard,
  initDashboard
} = require('../dashboard.js');

test('safeParseJson returns fallback for invalid JSON', () => {
  const fallback = { ok: true };
  assert.deepEqual(safeParseJson('{bad}', fallback), fallback);
});

test('formatTimestamp returns Invalid date for bad input', () => {
  assert.equal(formatTimestamp('not-a-date'), 'Invalid date');
});

test('validateDashboardData normalizes missing fields', () => {
  const result = validateDashboardData({});
  assert.deepEqual(result, {
    loginHistory: [],
    recentActivity: [],
    accountSettings: {}
  });
});

test('renderDashboard writes expected sections', () => {
  const target = { innerHTML: '' };
  renderDashboard(target, {
    loginHistory: ['Entry A'],
    recentActivity: ['Did thing'],
    accountSettings: { Theme: 'Dark' }
  });

  assert.match(target.innerHTML, /Login History/);
  assert.match(target.innerHTML, /Recent Activity/);
  assert.match(target.innerHTML, /Account Settings/);
  assert.match(target.innerHTML, /Entry A/);
  assert.match(target.innerHTML, /Did thing/);
  assert.match(target.innerHTML, /Theme/);
});

test('initDashboard renders error state when provider fails', async () => {
  const target = { innerHTML: '' };
  let captured;

  await initDashboard({
    rootElement: target,
    provider: async () => {
      throw new Error('Data source unavailable');
    },
    onError: (error) => {
      captured = error.message;
    }
  });

  assert.match(target.innerHTML, /Dashboard unavailable/);
  assert.equal(captured, 'Data source unavailable');
});
