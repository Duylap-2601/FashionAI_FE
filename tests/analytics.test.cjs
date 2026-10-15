const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const GA_ID = 'G-TEST123';

// Object tạo trong context vm khác realm nên phải về object thuần trước khi deepEqual.
const plain = (value) => JSON.parse(JSON.stringify(value));

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
}

/** Nạp lib/analytics với GA đã cấu hình và sendGAEvent giả lập gtag.js. */
function loadAnalytics({ consent = null, getValues = {} } = {}) {
  const calls = [];
  const window = {
    localStorage: createStorage(consent ? { fashionai_analytics_consent: consent } : {}),
    dispatchEvent: () => true,
  };
  const load = createSourceLoader({
    globals: {
      window,
      process: { env: { NODE_ENV: 'test', NEXT_PUBLIC_GA_MEASUREMENT_ID: GA_ID } },
    },
    mocks: {
      '@next/third-parties/google': {
        sendGAEvent: (...args) => {
          calls.push(args);
          if (args[0] === 'get' && args[2] in getValues) args[3](getValues[args[2]]);
        },
      },
    },
  });
  return { analytics: load('@/lib/analytics'), calls, window };
}

test('bootstrap script defaults analytics consent to denied and disables GA on /admin', () => {
  const { analytics } = loadAnalytics();
  const script = analytics.buildGaBootstrapScript(GA_ID);

  const run = (pathname, stored) => {
    const window = { location: { pathname }, localStorage: createStorage(stored ? { fashionai_analytics_consent: stored } : {}) };
    window.window = window;
    vm.runInNewContext(script, window);
    return window;
  };

  const shop = run('/products');
  const consentDefault = [...shop.dataLayer].find((entry) => entry[0] === 'consent');
  assert.equal(consentDefault[1], 'default');
  assert.equal(consentDefault[2].analytics_storage, 'denied');
  assert.equal(consentDefault[2].ad_storage, 'denied');
  assert.equal(shop[`ga-disable-${GA_ID}`], false);

  assert.equal(run('/admin/dashboard')[`ga-disable-${GA_ID}`], true);
  const returning = run('/', 'granted');
  assert.equal([...returning.dataLayer].find((entry) => entry[0] === 'consent')[2].analytics_storage, 'granted');
});

test('trackEvent and consent updates go through sendGAEvent', () => {
  const { analytics, calls, window } = loadAnalytics();

  analytics.trackEvent('search', { search_term: 'blazer' });
  analytics.saveAnalyticsConsent('granted');

  assert.deepEqual(plain(calls[0]), ['event', 'search', { search_term: 'blazer' }]);
  assert.deepEqual(plain(calls[1]), ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(window.localStorage.getItem('fashionai_analytics_consent'), 'granted');
});

test('trackEvent is a no-op when GA4 is not configured', () => {
  const calls = [];
  const load = createSourceLoader({
    globals: { window: {} },
    mocks: { '@next/third-parties/google': { sendGAEvent: (...args) => calls.push(args) } },
  });
  load('@/lib/analytics').trackEvent('search', { search_term: 'suit' });
  assert.equal(calls.length, 0);
});

test('getAnalyticsIds only returns ids that pass backend validation, and only with consent', async () => {
  const validIds = { client_id: '1234567890.1700000000', session_id: 1700000000 };

  const granted = loadAnalytics({ consent: 'granted', getValues: validIds });
  assert.deepEqual(plain(await granted.analytics.getAnalyticsIds()), {
    gaClientId: '1234567890.1700000000',
    gaSessionId: '1700000000',
  });

  const denied = loadAnalytics({ consent: 'denied', getValues: validIds });
  assert.deepEqual(plain(await denied.analytics.getAnalyticsIds()), {});
  assert.equal(denied.calls.length, 0);

  const malformed = loadAnalytics({ consent: 'granted', getValues: { client_id: 'abc', session_id: '1' } });
  assert.deepEqual(plain(await malformed.analytics.getAnalyticsIds()), {});
});

test('cart items map to GA4 items with the plain product name and combo/color variant', () => {
  const load = createSourceLoader();
  const { cartItemToGaItem, productToGaItem } = load('@/features/analytics/services/ga-items');

  assert.deepEqual(plain(
    cartItemToGaItem({
      productId: 'p-1',
      name: 'Suit Navy (Combo Suit nguyên bộ)',
      type: 'combo',
      color: 'Navy',
      price: 1290000,
      quantity: 2,
    }, 1)),
    { item_id: 'p-1', item_name: 'Suit Navy', item_variant: 'combo / Navy', price: 1290000, quantity: 1 },
  );
  assert.deepEqual(plain(productToGaItem({ id: 'p-2', name: 'Blazer', numericPrice: 750000 })), {
    item_id: 'p-2',
    item_name: 'Blazer',
    price: 750000,
    quantity: 1,
  });
});

test('analytics formatting helpers', () => {
  const load = createSourceLoader();
  const format = load('@/features/admin/services/analytics-format');

  assert.equal(format.formatDuration(95), '1 phút 35 giây');
  assert.equal(format.formatDuration(42), '42 giây');
  assert.equal(format.percentChange(120, 100), 0.2);
  assert.equal(format.percentChange(5, 0), null);
  assert.equal(format.formatShortDate('2026-10-15'), '15/10');
  assert.equal(format.labelOf({ Direct: 'Truy cập trực tiếp' }, 'Direct'), 'Truy cập trực tiếp');
  assert.equal(format.labelOf({}, '(not set)'), 'Không xác định');
});

test('admin analytics queries hit the GA4 report endpoints with the selected range', async () => {
  const calls = [];
  const load = createSourceLoader({
    mocks: { '@/lib/http': { http: { get: async (...args) => { calls.push(args); return { configured: false }; } } } },
  });
  const queries = load('@/features/admin/services/queries');

  await queries.fetchAnalyticsReport('7d');
  await queries.fetchAnalyticsRealtime();

  assert.equal(calls[0][0], '/admin/analytics/report');
  assert.deepEqual(plain(calls[0][1].params), { range: '7d' });
  assert.equal(calls[1][0], '/admin/analytics/realtime');
});

test('checkout forwards GA4 ids and drops a session id without a client id', async () => {
  const calls = [];
  const load = createSourceLoader({
    mocks: { '@/lib/http': { http: { post: async (...args) => { calls.push(args); return {}; } } } },
  });
  const { checkout } = load('@/features/payments/services/mutations');

  await checkout({ orderId: 'order-1', gaClientId: '1.2', gaSessionId: '3' });
  await checkout({ orderId: 'order-2', gaSessionId: '3' });

  assert.deepEqual(plain(calls[0][1]), { orderId: 'order-1', gaClientId: '1.2', gaSessionId: '3' });
  assert.deepEqual(plain(calls[1][1]), { orderId: 'order-2' });
});
