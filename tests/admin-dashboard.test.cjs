const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

// Object tạo trong context vm khác realm nên phải về object thuần trước khi deepEqual.
const plain = (value) => JSON.parse(JSON.stringify(value));

/** Nạp service admin với admin queries giả lập; `responses[path]` là payload trả về. */
function loadAdminServices(responses = {}) {
  const calls = [];
  const respond = (path) => async (config) => {
    calls.push({ path, config });
    return typeof responses[path] === 'function' ? responses[path](config) : responses[path];
  };
  const load = createSourceLoader({
    mocks: {
      'lucide-react': {},
      '@/features/admin/services/queries': {
        fetchAdminProducts: respond('/products'),
        fetchAdminOrders: respond('/orders/all'),
        fetchAdminShipments: respond('/admin/shipments'),
        fetchAdminUsers: respond('/users'),
        fetchAdminOrderIssues: async (params, config) => {
          calls.push({ path: '/order-issues', params, config });
          return responses['/order-issues'];
        },
      },
    },
  });
  return {
    calls,
    mappers: load('@/features/admin/services/admin-mappers'),
    filters: load('@/features/admin/services/admin-list-filters'),
    loaders: load('@/features/admin/services/admin-list-loaders'),
    metrics: load('@/features/admin/services/dashboard-metrics'),
    editor: load('@/features/admin/services/product-editor'),
    controller: load('@/features/admin/services/admin-list-controller'),
  };
}

const order = (overrides = {}) => ({
  id: 'o1',
  code: '#101',
  orderCode: 101,
  customer: 'An',
  email: 'an@example.com',
  items: 1,
  total: 100000,
  status: 'PAID',
  paymentStatus: 'PAID',
  date: '2026-10-15',
  payment: 'ZALOPAY',
  ...overrides,
});

test('readAdminList reads items and totals from every backend list shape', () => {
  const { mappers } = loadAdminServices();
  const arrayWithMeta = Object.assign([{ id: 1 }], { __meta: { total: 9, totalPages: 3 } });

  assert.deepEqual(plain(mappers.readAdminList(arrayWithMeta)), { items: [{ id: 1 }], serverTotal: 9, serverTotalPages: 3 });
  assert.deepEqual(plain(mappers.readAdminList({ items: [{ id: 2 }], meta: { total: 4 } })), { items: [{ id: 2 }], serverTotal: 4 });
  assert.deepEqual(plain(mappers.readAdminList({ items: [], pagination: { total: 0, totalPages: 1 } })), { items: [], serverTotal: 0, serverTotalPages: 1 });
  assert.deepEqual(plain(mappers.readAdminList({ items: [{ id: 3 }], total: 1 })), { items: [{ id: 3 }], serverTotal: 1 });
  assert.deepEqual(plain(mappers.readAdminList(undefined)), { items: [] });
});

test('toAdminOrder converts VND strings and falls back to shipping info and defaults', () => {
  const { mappers } = loadAdminServices();
  const mapped = mappers.toAdminOrder({
    id: 'o1',
    orderCode: '101',
    amount: '90000',
    totalVnd: '120000',
    shippingFeeVnd: null,
    status: 'PAID',
    createdAt: '2026-10-15T08:00:00.000Z',
    shippingInfo: { name: 'Bình', phone: '0900', address: 'HCM' },
  });

  assert.equal(mapped.code, '#101');
  assert.equal(mapped.orderCode, 101);
  assert.equal(mapped.total, 120000);
  assert.equal(mapped.shippingFeeVnd, undefined);
  assert.equal(mapped.customer, 'Bình');
  assert.equal(mapped.email, '0900');
  assert.equal(mapped.items, 1);
  assert.equal(mapped.payment, 'COD');
  assert.equal(mapped.date, '2026-10-15');
  assert.equal(mapped.shipment, null);
});

test('mergeOrderUpdate keeps current fields the backend omitted and applies the payment fallback', () => {
  const { mappers } = loadAdminServices();
  const current = order({ paymentStatus: undefined, shipment: { id: 's1' } });

  const merged = mappers.mergeOrderUpdate(current, { user: { name: 'Mới' } }, 'MEASUREMENT_REVIEW', 'PAID');
  assert.equal(merged.status, 'MEASUREMENT_REVIEW');
  assert.equal(merged.paymentStatus, 'PAID');
  assert.equal(merged.customer, 'Mới');
  assert.equal(merged.email, 'an@example.com');
  assert.deepEqual(plain(merged.shipment), { id: 's1' });

  assert.equal(mappers.mergeOrderUpdate(current, undefined, 'SHIPPING').paymentStatus, undefined);
});

test('toEditorImages falls back to the main image and keeps saved image ids and colors', () => {
  const { mappers } = loadAdminServices();
  assert.deepEqual(plain(mappers.toEditorImages({ image: '/a.png' })), [
    { id: 'existing-0-/a.png', imageId: '', url: '/a.png', isMain: true, isExisting: true, colorName: null },
  ]);
  assert.deepEqual(plain(mappers.toEditorImages({ images: [{ id: 'img1', url: '/b.png', colorName: 'Đen' }] })), [
    { id: 'existing-img1-/b.png', imageId: 'img1', url: '/b.png', isMain: false, isExisting: true, colorName: 'Đen' },
  ]);
  assert.deepEqual(plain(mappers.toEditorImages({})), []);
});

test('paginateUsers filters, then clamps the page into range', () => {
  const { filters } = loadAdminServices();
  const users = [
    { id: 'u1', name: 'An', email: 'an@x.vn', tier: 'VIP', role: 'USER', isVerified: true },
    { id: 'u2', name: 'Bình', email: 'binh@x.vn', tier: 'FREE', role: 'USER', isVerified: false },
    { id: 'u3', name: 'Chi', email: 'chi@x.vn', tier: 'VIP', role: 'ADMIN', isVerified: true },
  ];

  const vip = filters.paginateUsers(users, { tier: 'VIP' }, 5, 1);
  assert.deepEqual(plain(vip.pagination), { page: 2, pageSize: 1, total: 2, totalPages: 2 });
  assert.deepEqual(vip.items.map(u => u.id), ['u3']);

  const unverified = filters.paginateUsers(users, { isVerified: 'UNVERIFIED', search: ' BÌNH ' }, 1, 10);
  assert.deepEqual(unverified.items.map(u => u.id), ['u2']);
  assert.deepEqual(plain(filters.paginateUsers([], {}, 3, 10).pagination), { page: 1, pageSize: 10, total: 0, totalPages: 1 });
});

test('loadAdminOrders sends filters, trusts the server total, and re-filters when the backend ignored a filter', async () => {
  const dto = (orderCode, status) => ({ id: `o${orderCode}`, orderCode, amount: 100, status, paymentStatus: 'PAID' });
  let page = [dto(1, 'PAID'), dto(2, 'PAID')];
  const { loaders, calls } = loadAdminServices({ '/orders/all': () => ({ items: page, meta: { total: 40, totalPages: 4 } }) });
  const signal = new AbortController().signal;

  const trusted = await loaders.loadAdminOrders({ page: 2, pageSize: 10, filters: { status: 'PAID', search: ' 1 ', fromDate: '2026-10-01' } }, signal);
  assert.deepEqual(plain(calls[0].config.params), { page: 2, limit: 10, search: '1', status: 'PAID', fromDate: '2026-10-01' });
  assert.equal(calls[0].config.signal, signal);
  assert.deepEqual(trusted.items.map(o => o.orderCode), [1]);
  assert.equal(trusted.total, 1);

  page = [dto(1, 'PAID'), dto(2, 'CANCELLED')];
  const refiltered = await loaders.loadAdminOrders({ page: 1, pageSize: 10, filters: { status: 'PAID' } });
  assert.deepEqual(refiltered.items.map(o => o.orderCode), [1]);
  assert.deepEqual([refiltered.total, refiltered.totalPages], [1, 1]);

  page = [dto(1, 'PAID'), dto(2, 'PAID')];
  const server = await loaders.loadAdminOrders({ page: 1, pageSize: 10, filters: {} });
  assert.deepEqual([server.items.length, server.total, server.totalPages], [2, 40, 4]);
});

test('loadAdminProducts paginates on the client when the backend returns a plain array', async () => {
  const products = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, name: `Áo ${i}`, price: '100', status: i % 2 ? 'DRAFT' : 'ACTIVE', category: 'UPPER' }));
  const { loaders } = loadAdminServices({ '/products': products });

  const result = await loaders.loadAdminProducts({ page: 2, pageSize: 5, filters: { status: 'ACTIVE' } });
  assert.deepEqual(result.items.map(p => p.id), ['p10']);
  assert.deepEqual([result.total, result.totalPages], [6, 2]);
  assert.equal(result.items[0].price, 100);
  assert.equal(result.items[0].image, '/images/731163514_999523332788054_1114320478812927640_n.png');
});

test('loadAdminShipments drops empty filters and sends booleans as strings', async () => {
  const { loaders, calls } = loadAdminServices({ '/admin/shipments': { items: [], meta: { total: 0 } } });
  await loaders.loadAdminShipments({ page: 1, pageSize: 10, filters: { status: '', orderCode: '42', issueOnly: true, staleOnly: undefined } });
  assert.deepEqual(plain(calls[0].config.params), { page: 1, limit: 10, orderCode: '42', issueOnly: 'true' });
});

test('loadAdminOrderIssues reads data/meta envelopes and omits empty filters', async () => {
  const { loaders, calls } = loadAdminServices({ '/order-issues': { data: [{ id: 'i1' }], meta: { total: 21, totalPages: 3 } } });
  const result = await loaders.loadAdminOrderIssues({ page: 1, pageSize: 10, filters: { status: '', reason: 'WRONG_SIZE' } });
  assert.deepEqual(plain(calls[0].params), { page: 1, limit: 10, reason: 'WRONG_SIZE' });
  assert.deepEqual(plain(result), { items: [{ id: 'i1' }], total: 21, totalPages: 3 });
});

test('computeDashboardMetrics prefers /admin/stats and falls back to the loaded lists', () => {
  const { metrics } = loadAdminServices();
  const orders = [order({ total: 300 }), order({ id: 'o2', status: 'PENDING', total: 50 }), order({ id: 'o3', status: 'DELIVERED', total: 200 })];
  const input = { stats: null, orders, products: [{ status: 'ACTIVE' }, { status: 'DRAFT' }], users: [{ tier: 'VIP' }], allUsers: [], reviewsCount: 4, avgRating: 4.5 };

  const fallback = metrics.computeDashboardMetrics(input);
  assert.equal(fallback.totalRevenue, 500);
  assert.equal(fallback.avgOrderValue, 250);
  assert.deepEqual([fallback.pendingOrders, fallback.deliveredOrders, fallback.totalOrders], [1, 1, 3]);
  assert.deepEqual([fallback.totalProducts, fallback.activeProducts, fallback.vipUsers], [2, 1, 1]);
  assert.deepEqual([fallback.totalReviews, fallback.avgRating, fallback.netRevenue], [4, 4.5, 500]);

  const fromStats = metrics.computeDashboardMetrics({
    ...input,
    stats: { totalRevenue: 1000, productRevenue: 600, refundedAmount: 100, netRevenue: 500, paidOrders: 4, orderCount: 10, reviewCount: 7, avgRating: 4.8 },
  });
  assert.equal(fromStats.subscriptionRevenue, 400);
  // Backend cũ trả net chỉ của sản phẩm: cộng phần gói vào.
  assert.equal(fromStats.netRevenue, 900);
  assert.deepEqual([fromStats.avgOrderValue, fromStats.totalOrders, fromStats.totalReviews, fromStats.avgRating], [250, 10, 7, 4.8]);
});

test('buildRevenueChart sums paid orders per day and scales points into the plot', () => {
  const { metrics } = loadAdminServices();
  const now = new Date('2026-10-15T05:00:00.000Z');
  const orders = [
    order({ date: '2026-10-15', total: 400 }),
    order({ date: '2026-10-15', total: 999, paymentStatus: 'PENDING' }),
    order({ date: '2026-10-14', total: 200 }),
  ];

  const chart = metrics.buildRevenueChart(orders, 7, now);
  assert.equal(chart.points.length, 7);
  assert.equal(chart.points[6].dateKey, '2026-10-15');
  assert.deepEqual([chart.points[6].revenue, chart.points[6].ordersCount], [400, 2]);
  assert.deepEqual([chart.totalRevenue, chart.totalOrders, chart.maxRevenue], [600, 3, 400]);
  assert.deepEqual([chart.points[0].x, chart.points[6].x, chart.points[6].y, chart.points[0].y], [40, 560, 35, 175]);

  assert.equal(metrics.buildRevenueChart([], 7, now).maxRevenue, 500000);
});

test('resolveProductColors normalizes hex, drops unnamed colors and adds colors used by images', () => {
  const { editor } = loadAdminServices();
  assert.equal(editor.normalizeHex('abc'), '#AABBCC');
  assert.equal(editor.normalizeHex('#12345g'), '#000000');

  const colors = editor.resolveProductColors(
    [{ name: ' Đỏ ', hex: 'f00' }, { name: '  ', hex: '#fff' }],
    [{ colorName: 'đỏ' }, { colorName: 'Đen tuyền' }, { colorName: null }],
  );
  assert.deepEqual(plain(colors), [{ name: 'Đỏ', hex: '#FF0000' }, { name: 'Đen tuyền', hex: '#111111' }]);
  assert.equal(editor.resolveImageColor(colors, ' đen tuyền '), 'Đen tuyền');
  assert.equal(editor.resolveImageColor(colors, 'Xanh'), null);
});

test('product form builders keep the multipart contract the backend expects', () => {
  const { editor } = loadAdminServices();
  const a = new File(['a'], 'a.png');
  const b = new File(['b'], 'b.png');
  const fields = (form) => [...form.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name]);

  assert.deepEqual(fields(editor.buildProductImagesForm([a, b], ['Đỏ', null])), [
    ['images', 'a.png'], ['image', 'a.png'], ['images', 'b.png'],
    ['isMainIndex', '0'], ['isMain', 'true'], ['imageColors', '["Đỏ",null]'],
  ]);
  assert.deepEqual(fields(editor.buildSingleProductImageForm(b, null)), [
    ['image', 'b.png'], ['images', 'b.png'], ['imageColors', '[null]'],
  ]);
  assert.deepEqual(fields(editor.buildCreateProductForm({
    name: 'Áo vest', price: 1290000, category: 'UPPER', material: 'Len', colors: [{ name: 'Đen', hex: '#111111' }],
    files: [a, b], imageColors: ['Đen', null],
  })), [
    ['name', 'Áo vest'], ['price', '1290000'], ['category', 'UPPER'], ['status', 'ACTIVE'], ['material', 'Len'],
    ['color', 'Đen'], ['colors', '[{"name":"Đen","hex":"#111111"}]'],
    ['images', 'a.png'], ['images', 'b.png'], ['image', 'a.png'], ['imageColors', '["Đen",null]'],
  ]);
  assert.deepEqual(fields(editor.buildCreateProductForm({ name: 'Quần', price: 1, category: 'LOWER', status: 'DRAFT', colors: [], files: [], imageColors: [] })), [
    ['name', 'Quần'], ['price', '1'], ['category', 'LOWER'], ['status', 'DRAFT'],
  ]);
});

/** Controller với load giả: mỗi request chờ test tự resolve/reject. */
function createTestController(controllerModule, { enabled = true, initialQuery } = {}) {
  const log = { requests: [], queries: [], fetching: [], results: [], errors: [] };
  const state = { enabled };
  const ctl = controllerModule.createAdminListController({
    initialQuery: initialQuery || { page: 3, pageSize: 10, filters: { status: '' } },
    load: (query, signal) => new Promise((resolve, reject) => log.requests.push({ query, signal, resolve, reject })),
    isEnabled: () => state.enabled,
    onQueryChange: (query) => log.queries.push(query),
    onFetchingChange: (value) => log.fetching.push(value),
    onResult: (result, query) => log.results.push({ result, query }),
    onError: (error) => log.errors.push(error),
  });
  return { ctl, log, state };
}

const flush = () => new Promise(resolve => setImmediate(resolve));

test('list controller: page size then page 1 keeps the new size and drops the superseded request', async () => {
  const { controller } = loadAdminServices();
  const { ctl, log } = createTestController(controller);

  // Thứ tự AdminPagination gọi khi đổi số dòng/trang.
  ctl.changePageSize(20);
  ctl.changePage(1);

  assert.equal(log.requests.length, 2);
  assert.equal(log.requests[0].signal.aborted, true);
  assert.deepEqual(plain(log.requests[1].query), { page: 1, pageSize: 20, filters: { status: '' } });

  log.requests[0].reject(new Error('canceled'));
  log.requests[1].resolve({ items: ['x'], total: 1, totalPages: 1 });
  await flush();

  assert.deepEqual(log.errors, []);
  assert.equal(log.results.length, 1);
  assert.equal(log.results[0].query.pageSize, 20);
  assert.deepEqual(log.fetching, [true, true, false]);
});

test('list controller: a late response from an older request never overwrites the newer one', async () => {
  const { controller } = loadAdminServices();
  const { ctl, log } = createTestController(controller);

  const first = ctl.fetch();
  ctl.changeFilters({ status: 'PAID' });
  log.requests[1].resolve({ items: ['paid'], total: 1, totalPages: 1 });
  await flush();
  log.requests[0].resolve({ items: ['stale'], total: 9, totalPages: 1 });

  assert.equal(await first, null);
  assert.deepEqual(log.results.map(r => r.result.items), [['paid']]);
});

test('list controller: while disabled it only records the query, and the next fetch uses it', async () => {
  const { controller } = loadAdminServices();
  const { ctl, log, state } = createTestController(controller, { enabled: false });

  ctl.changeFilters({ status: '', providerOrderCode: 'GHN1' });
  ctl.changePage(4);
  assert.equal(log.requests.length, 0);
  assert.deepEqual(plain(ctl.getQuery()), { page: 4, pageSize: 10, filters: { status: '', providerOrderCode: 'GHN1' } });

  state.enabled = true;
  const pending = ctl.fetch();
  assert.equal(log.requests.length, 1);
  assert.deepEqual(plain(log.requests[0].query.filters), { status: '', providerOrderCode: 'GHN1' });

  log.requests[0].reject(new Error('500'));
  assert.equal(await pending, null);
  assert.equal(log.errors.length, 1);
  assert.deepEqual(log.fetching, [true, false]);
});
