const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

test('product mapping keeps primary image ordering, numeric pricing, and category normalization', () => {
  const load = createSourceLoader();
  const { mapProduct } = load('@/features/products/services/products-utils');
  const product = mapProduct({
    id: 'p1', name: 'Suit', category: 'FULL_BODY', price: '1290000', originalPrice: '1650000',
    images: [{ imageUrl: '/secondary.png' }, { imageUrl: '/primary.png', isMain: true }],
    colors: ['black'], avgRating: '4.5', stock: 0,
  });
  assert.equal(product.image, '/primary.png');
  assert.equal(product.gallery[1], '/secondary.png');
  assert.equal(product.numericPrice, 1290000);
  assert.equal(product.originalPrice, 1650000);
  assert.equal(product.garmentCategory, 'FULL_BODY');
  assert.equal(product.rating, 4.5);
  assert.equal(product.stock, 0);
});

test('feature query keys preserve list/detail prefixes and partial invalidation shapes', () => {
  const load = createSourceLoader();
  const products = load('@/features/products/services/query-keys').queryKeys;
  const reviews = load('@/features/reviews/services/query-keys').queryKeys;
  const subscriptions = load('@/features/subscription/services/query-keys').queryKeys;
  const notifications = load('@/features/notifications/services/query-keys').queryKeys;
  const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected));
  same(products.products(), ['products']);
  same(products.product('p1'), ['product', 'p1']);
  same(reviews.reviews(), ['reviews']);
  same(reviews.reviews('p1', 1, 10, undefined), ['reviews', 'p1', 1, 10, undefined]);
  same(subscriptions.quota('STYLIST'), ['quota', 'STYLIST']);
  same(notifications.notifications('unread-count'), ['notifications', 'unread-count']);
  same(notifications.notifications({ page: 1, limit: 20 }), ['notifications', { page: 1, limit: 20 }]);
});

test('try-on service preserves combo multipart fields, legacy primary fields, and timeout', async () => {
  const calls = [];
  const load = createSourceLoader({ mocks: {
    '@/lib/api': { api: { post: async (...args) => { calls.push(args); return { data: { id: 'result' } }; } } },
  } });
  const { submitTryOn } = load('@/features/try-on/services/mutations');
  const humanImage = new File(['human'], 'human.png', { type: 'image/png' });
  const lowerImage = new File(['lower'], 'lower.png', { type: 'image/png' });
  const result = await submitTryOn({ humanImage, garments: [
    { garmentCategory: 'UPPER', productId: 'p1' },
    { garmentCategory: 'LOWER', garmentImage: lowerImage },
  ] });
  const [url, body, config] = calls[0];
  assert.equal(result.id, 'result');
  assert.equal(url, '/try-on');
  assert.equal(config.timeout, 180000);
  assert.equal(body.get('humanImage').name, 'human.png');
  assert.equal(body.get('garments[0][category]'), 'UPPER');
  assert.equal(body.get('garments[0][productId]'), 'p1');
  assert.equal(body.get('garments[1][image]').name, 'lower.png');
  assert.equal(body.get('productId'), 'p1');
  assert.equal(body.get('garmentCategory'), 'UPPER');
});

test('collections retain their published fallback when the backend is unavailable', async () => {
  const load = createSourceLoader({ mocks: {
    '@/lib/api': { api: { get: async () => { throw new Error('offline'); } } },
  }, globals: { console: { ...console, warn: () => {} } } });
  const { fetchPublishedCollections } = load('@/features/collections/services/queries');
  const { INITIAL_COLLECTIONS } = load('@/features/collections/services/local-collections');
  const actual = await fetchPublishedCollections();
  assert.ok(actual.length > 0);
  assert.ok(actual.every((collection) => collection.isPublished));
  assert.equal(JSON.stringify(actual), JSON.stringify(INITIAL_COLLECTIONS.filter((collection) => collection.isPublished)));
});

test('order creation preserves shipping note mapping and payment amounts', async () => {
  const calls = [];
  const load = createSourceLoader({ mocks: {
    '@/lib/api': { api: { post: async (...args) => { calls.push(args); return { data: { id: 'order-1' } }; } } },
  } });
  const { createOrder } = load('@/features/orders/services/mutations');
  const result = await createOrder({
    items: [{ productId: 'p1', quantity: 2, color: 'black', price: 750000 }],
    shippingInfo: { name: 'Test', phone: '0900000000', address: 'HCMC', notes: 'Call first' },
    paymentMethod: 'BANK_TRANSFER', provider: 'SEPAY', couponCode: 'WELCOME',
    discountAmount: 100000, shippingFee: 0, totalAmount: 1400000,
  });
  const [url, body] = calls[0];
  assert.equal(result.id, 'order-1');
  assert.equal(url, '/orders');
  assert.equal(body.shippingInfo.note, 'Call first');
  assert.equal(body.items[0].quantity, 2);
  assert.equal(body.totalAmount, 1400000);
  assert.equal(body.provider, 'SEPAY');
  assert.equal(Object.hasOwn(body.items[0], 'size'), false);
});

test('checkout keeps the default provider and distinguishes product orders from subscription upgrades', async () => {
  const calls = [];
  const load = createSourceLoader({ mocks: {
    '@/lib/api': { api: { post: async (...args) => { calls.push(args); return { data: { checkoutUrl: 'https://example.com/pay' } }; } } },
  } });
  const { checkout } = load('@/features/payments/services/mutations');
  await checkout({ orderId: 'order-1' });
  await checkout({ targetTier: 'VIP', provider: 'PAYOS' });
  assert.equal(calls[0][0], '/payments/checkout');
  assert.equal(JSON.stringify(calls[0][1]), JSON.stringify({ provider: 'SEPAY', orderId: 'order-1' }));
  assert.equal(JSON.stringify(calls[1][1]), JSON.stringify({ provider: 'PAYOS', targetTier: 'VIP' }));
});

test('profile, measurements, subscriptions, and notifications retain their HTTP methods and endpoints', async () => {
  const calls = [];
  const api = Object.fromEntries(['get', 'put', 'post', 'patch'].map((method) => [method, async (...args) => {
    calls.push([method, ...args]);
    return { data: {} };
  }]));
  const load = createSourceLoader({ mocks: { '@/lib/api': { api } } });
  await load('@/features/profile/services/mutations').updateUserProfile({ name: 'Updated' });
  await load('@/features/measurements/services/mutations').updateMeasurements({ height: 170 });
  await load('@/features/subscription/services/mutations').cancelSubscription();
  await load('@/features/subscription/services/mutations').resumeSubscription();
  await load('@/features/notifications/services/mutations').markNotificationRead('n1');
  assert.deepEqual(calls.map(([method, url]) => [method, url]), [
    ['put', '/users/me'], ['put', '/users/me/measurements'],
    ['post', '/payments/subscriptions/cancel'], ['post', '/payments/subscriptions/resume'],
    ['patch', '/notifications/n1/read'],
  ]);
  assert.equal(calls[0][2].name, 'Updated');
  assert.equal(calls[1][2].height, 170);
});

test('chat services preserve bearer headers, session URLs, and rename/delete payloads', async () => {
  const calls = [];
  const load = createSourceLoader({ globals: { fetch: async (...args) => {
    calls.push(args);
    return Response.json({ data: [] });
  } } });
  const queries = load('@/features/chat/services/queries');
  const mutations = load('@/features/chat/services/mutations');
  await queries.fetchChatSessions('token');
  await queries.fetchChatSession('session-1', 'token');
  await mutations.renameChatSession('session-1', 'New title', 'token');
  await mutations.deleteChatSession('session-1', 'token');
  assert.equal(calls[0][0], '/api/backend/chat/sessions');
  assert.equal(calls[1][0], '/api/backend/chat/sessions/session-1');
  assert.ok(calls.every(([, init]) => init.headers.Authorization === 'Bearer token'));
  assert.equal(calls[2][1].method, 'PATCH');
  assert.equal(calls[2][1].body, JSON.stringify({ title: 'New title' }));
  assert.equal(calls[3][1].method, 'DELETE');
});

test('email verification and password recovery retain JSON bodies and cookie credentials', async () => {
  const calls = [];
  const load = createSourceLoader({ globals: { fetch: async (...args) => {
    calls.push(args);
    return Response.json({ message: 'OK' });
  } } });
  const mutations = load('@/features/auth/services/mutations');
  await mutations.requestPasswordReset('test@example.com');
  await mutations.resetPassword('reset-token', 'new-password');
  await mutations.verifyEmail('verify-token');
  assert.ok(calls.every(([, init]) => init.method === 'POST' && init.credentials === 'include'));
  assert.equal(calls[0][0], '/api/backend/auth/forgot-password');
  assert.equal(calls[0][1].body, JSON.stringify({ email: 'test@example.com' }));
  assert.equal(calls[1][0], '/api/backend/auth/reset-password');
  assert.equal(calls[1][1].body, JSON.stringify({ token: 'reset-token', newPassword: 'new-password' }));
  assert.equal(calls[2][0], '/api/backend/auth/verify-email');
  assert.equal(calls[2][1].body, JSON.stringify({ token: 'verify-token' }));
});
