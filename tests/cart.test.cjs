const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_PRODUCT_ID = '33333333-3333-4333-8333-333333333333';
const same = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected));

function serverItem(overrides = {}) {
  return {
    id: 'cart-1',
    productId: PRODUCT_ID,
    color: 'Black',
    comboType: null,
    quantity: 2,
    available: true,
    product: {
      id: PRODUCT_ID, name: 'Suit', price: 1290000, originalPrice: null, status: 'ACTIVE',
      category: 'FULL_BODY', garmentType: null, colors: null, imageUrl: '/black.png',
    },
    createdAt: '2026-10-14T00:00:00.000Z',
    updatedAt: '2026-10-14T00:00:00.000Z',
    ...overrides,
  };
}

test('server cart item maps to the UI cart item, keeping combo label and display price', () => {
  const load = createSourceLoader();
  const { toCartItem } = load('@/features/cart/services/cart-mapper');

  const combo = toCartItem(serverItem({ comboType: 'blazer' }));
  assert.equal(combo.name, 'Suit (Bán lẻ Áo Blazer)');
  assert.equal(combo.price, 750000);
  assert.equal(combo.type, 'blazer');
  assert.equal(combo.variant, 'Màu: Black · Đặt may theo số đo');
  assert.equal(combo.image, '/black.png');
  assert.equal(combo.available, true);

  const plain = toCartItem(serverItem({ color: null, available: false }));
  assert.equal(plain.name, 'Suit');
  assert.equal(plain.price, 1290000);
  assert.equal(plain.color, undefined);
  assert.equal(plain.type, undefined);
  assert.equal(plain.variant, 'Đặt may theo số đo');
  assert.equal(plain.available, false);
});

test('guest cart merge lines drop mock products, clamp quantity and send only whitelisted fields', () => {
  const load = createSourceLoader();
  const { toMergeLines } = load('@/features/cart/services/cart-mapper');
  const guest = (overrides) => ({ id: 'g', name: 'X', variant: '', price: 1, image: '', quantity: 1, ...overrides });

  const lines = toMergeLines([
    guest({ productId: PRODUCT_ID, quantity: 2000, color: 'Black', type: 'combo' }),
    guest({ productId: 'p1', color: 'Black' }),
    guest({ productId: OTHER_PRODUCT_ID, color: '', type: 'weird' }),
  ]);

  same(lines, [
    { productId: PRODUCT_ID, quantity: 1000, color: 'Black', comboType: 'combo' },
    { productId: OTHER_PRODUCT_ID, quantity: 1 },
  ]);
});

test('optimistic helpers update quantity/remove lines and keep totalItems in sync', () => {
  const load = createSourceLoader();
  const { setServerItemQuantity, removeServerItem, clampCartQuantity } = load('@/features/cart/services/cart-mapper');
  const cart = { items: [serverItem(), serverItem({ id: 'cart-2', quantity: 1 })], totalItems: 3 };

  const updated = setServerItemQuantity(cart, 'cart-1', 5);
  assert.equal(updated.items[0].quantity, 5);
  assert.equal(updated.totalItems, 6);
  assert.equal(cart.items[0].quantity, 2);

  const removed = removeServerItem(cart, 'cart-2');
  assert.equal(removed.items.length, 1);
  assert.equal(removed.totalItems, 2);

  assert.equal(clampCartQuantity(0), 1);
  assert.equal(clampCartQuantity(1200), 1000);
});

test('cart services call the backend cart endpoints with absolute quantities', async () => {
  const calls = [];
  const record = (method) => async (...args) => {
    calls.push([method, ...args]);
    return { items: [], totalItems: 0, skipped: [] };
  };
  const load = createSourceLoader({ mocks: {
    '@/lib/http': { http: { get: record('get'), post: record('post'), patch: record('patch'), delete: record('delete') } },
  } });
  const { fetchCart } = load('@/features/cart/services/queries');
  const { addCartItem, updateCartItem, removeCartItem, clearServerCart, mergeCart } = load('@/features/cart/services/mutations');

  await fetchCart();
  await addCartItem({ productId: PRODUCT_ID, quantity: 1, color: 'Black' });
  await updateCartItem({ id: 'cart-1', quantity: 3 });
  await removeCartItem('cart-1');
  await clearServerCart();
  await mergeCart({ items: [{ productId: PRODUCT_ID, quantity: 2 }] });

  same(calls, [
    ['get', '/cart'],
    ['post', '/cart/items', { productId: PRODUCT_ID, quantity: 1, color: 'Black' }],
    ['patch', '/cart/items/cart-1', { quantity: 3 }],
    ['delete', '/cart/items/cart-1'],
    ['delete', '/cart'],
    ['post', '/cart/merge', { items: [{ productId: PRODUCT_ID, quantity: 2 }] }],
  ]);
});

test('cart query keys are scoped per user and mutation keys share the cart prefix', () => {
  const load = createSourceLoader();
  const { queryKeys } = load('@/features/cart/services/query-keys');
  const { mutationKeys } = load('@/features/cart/services/mutation-keys');
  same(queryKeys.cart('user-1'), ['cart', 'user-1']);
  same(queryKeys.cart(), ['cart']);
  same(mutationKeys.all(), ['cart']);
  same(mutationKeys.updateItem(), ['cart', 'updateItem']);
});

test('guest cart store merges same line without mutating previous state and does not persist panel state', () => {
  const stored = new Map();
  const memoryStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
    removeItem: (key) => stored.delete(key),
  };
  // zustand persist đọc window.localStorage khi tạo store.
  Object.defineProperty(globalThis, 'window', { value: { localStorage: memoryStorage }, configurable: true });
  try {
    const load = createSourceLoader();
    const { useCartStore } = load('@/features/cart/store/cartStore');
    const item = { productId: PRODUCT_ID, name: 'Suit', variant: '', price: 1, image: '', quantity: 1, color: 'Black', type: 'combo' };

    useCartStore.getState().addToCart(item);
    const first = useCartStore.getState().cartItems[0];
    useCartStore.getState().addToCart(item);
    useCartStore.getState().setIsCartOpen(true);

    assert.equal(useCartStore.getState().cartItems.length, 1);
    assert.equal(useCartStore.getState().cartItems[0].quantity, 2);
    assert.equal(first.quantity, 1);

    const persisted = JSON.parse(stored.get('stale_cart'));
    assert.equal(persisted.state.cartItems[0].quantity, 2);
    assert.equal('isCartOpen' in persisted.state, false);
  } finally {
    delete globalThis.window;
  }
});

test('cart sync merges once per user on login and clears the guest cart only on logout', () => {
  const load = createSourceLoader();
  const { decideCartSyncAction } = load('@/features/cart/services/cart-sync');
  const decide = (prevStatus, status, userId = null, mergedFor = null) =>
    decideCartSyncAction({ prevStatus, status, userId, mergedFor });

  assert.equal(decide('loading', 'authenticated', 'user-1'), 'merge');
  assert.equal(decide('unauthenticated', 'authenticated', 'user-1'), 'merge');
  assert.equal(decide('authenticated', 'authenticated', 'user-1', 'user-1'), 'none');
  assert.equal(decide('authenticated', 'authenticated', 'user-2', 'user-1'), 'merge');
  assert.equal(decide('authenticated', 'unauthenticated'), 'clear-guest');
  // Khách mở trang (chưa từng đăng nhập): giữ giỏ khách.
  assert.equal(decide('loading', 'unauthenticated'), 'none');
  assert.equal(decide('loading', 'loading'), 'none');
});

function createCartMutationHarness() {
  const { QueryClient, MutationObserver } = require('@tanstack/query-core');
  const load = createSourceLoader();
  const sync = load('@/features/cart/services/cart-sync');
  const { setServerItemQuantity } = load('@/features/cart/services/cart-mapper');
  // gcTime Infinity: không để lại timer giữ tiến trình test.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity }, mutations: { gcTime: Infinity } },
  });
  const key = ['cart', 'user-1'];
  const cartWith = (quantity) => ({ items: [serverItem({ quantity })], totalItems: quantity });
  queryClient.setQueryData(key, cartWith(1));

  const invalidated = [];
  queryClient.invalidateQueries = async (filters) => {
    invalidated.push(filters);
  };
  const pending = [];
  const observer = (fail = false) => new MutationObserver(queryClient, sync.createServerCartMutationOptions(queryClient, {
    userId: 'user-1',
    mutationKey: ['cart', 'updateItem'],
    mutationFn: ({ quantity }) => new Promise((resolve, reject) => {
      pending.push(() => (fail ? reject(new Error('boom')) : resolve(cartWith(quantity))));
    }),
    optimistic: (cart, { id, quantity }) => setServerItemQuantity(cart, id, quantity),
    errorMessage: 'error',
    notifyError: () => {},
  }));
  const quantity = () => queryClient.getQueryData(key).items[0].quantity;
  const flush = async () => {
    for (let i = 0; i < 10; i++) await new Promise((resolve) => setImmediate(resolve));
  };
  return { queryClient, sync, observer, pending, invalidated, quantity, flush };
}

test('queued cart mutations run one at a time and only the last response is written to the cache', async () => {
  const h = createCartMutationHarness();

  const first = h.observer().mutate({ id: 'cart-1', quantity: 2 });
  const second = h.observer().mutate({ id: 'cart-1', quantity: 3 });
  await h.flush();
  assert.equal(h.quantity(), 3, 'optimistic update shows the latest click right away');
  assert.equal(h.pending.length, 1, 'second request waits for the first');

  h.pending[0]();
  await first;
  await h.flush();
  assert.equal(h.quantity(), 3, 'first response must not overwrite the queued optimistic state');
  assert.equal(h.pending.length, 2);

  h.pending[1]();
  await second;
  assert.equal(h.quantity(), 3);
  assert.equal(h.invalidated.length, 0);
  h.queryClient.clear();
});

test('a failed last cart mutation refetches the cart instead of keeping the optimistic state', async () => {
  const h = createCartMutationHarness();

  const failing = h.observer(true).mutate({ id: 'cart-1', quantity: 5 }).catch(() => undefined);
  await h.flush();
  assert.equal(h.quantity(), 5);
  h.pending[0]();
  await failing;
  await h.flush();
  assert.equal(h.invalidated.length, 1);
  h.queryClient.clear();
});

test('a remote cart change during a local mutation is deferred, then refetched instead of trusting the response', async () => {
  const h = createCartMutationHarness();

  const mutation = h.observer().mutate({ id: 'cart-1', quantity: 2 });
  await h.flush();
  h.sync.handleRemoteCartChange(h.queryClient);
  assert.equal(h.invalidated.length, 0, 'no refetch while a local mutation is pending');

  h.pending[0]();
  await mutation;
  await h.flush();
  assert.equal(h.invalidated.length, 1);

  h.sync.handleRemoteCartChange(h.queryClient);
  assert.equal(h.invalidated.length, 2, 'idle: refetch right away');
  assert.equal(h.sync.cartFocusRefetchMode(h.queryClient), 'always');
  h.queryClient.clear();
});
