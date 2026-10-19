const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

// Object tạo trong context vm khác realm nên phải về object thuần trước khi deepEqual.
const plain = (value) => JSON.parse(JSON.stringify(value));

const product = (overrides = {}) => ({
  id: 'p-1',
  name: 'Blazer Navy',
  price: 890000,
  image: 'https://res.cloudinary.com/demo/blazer.jpg',
  color: 'Navy',
  garmentType: 'JACKET',
  category: 'UPPER',
  available: true,
  ...overrides,
});

test('toOutfitSuggestions keeps hydrated outfits and drops malformed items', () => {
  const load = createSourceLoader();
  const { toOutfitSuggestions, toSuggestedProducts } = load('@/features/stylist/services/outfit-suggestions');

  const outfits = toOutfitSuggestions([
    {
      name: 'Thanh lịch công sở',
      reason: 'Hợp dịp đi làm',
      items: [
        { role: 'outer', note: 'Mặc ngoài', product: product() },
        { role: 'weird', note: '', product: product({ id: 'p-2', category: 'LOWER', price: '450000', garmentType: 'X' }) },
        { role: 'top', product: { name: 'Thiếu id' } },
        'không phải object',
      ],
      extras: ['Giày cao gót nude', 42, ''],
      totalPrice: 1340000,
    },
    { name: 'Không có món hợp lệ', items: [{ product: null }] },
    null,
  ]);

  assert.equal(outfits.length, 1);
  assert.deepEqual(plain(outfits[0].items.map((item) => [item.role, item.note, item.product.id, item.product.price])), [
    ['outer', 'Mặc ngoài', 'p-1', 890000],
    ['bottom', null, 'p-2', 450000],
  ]);
  assert.equal(outfits[0].items[1].product.garmentType, null);
  assert.deepEqual(plain(outfits[0].extras), ['Giày cao gót nude']);
  assert.equal(outfits[0].totalPrice, 1340000);
  assert.deepEqual(plain(toOutfitSuggestions('not an array')), []);
  assert.deepEqual(plain(toSuggestedProducts([product({ image: '' }), { id: 'x' }]).map((p) => [p.id, p.image])), [['p-1', null]]);
});

test('collectSuggestedProducts lists each available product once, outfits first', () => {
  const load = createSourceLoader();
  const { collectSuggestedProducts } = load('@/features/stylist/services/outfit-suggestions');
  const outfits = [
    { items: [{ product: product() }, { product: product({ id: 'p-2', available: false }) }] },
    { items: [{ product: product() }, { product: product({ id: 'p-3' }) }] },
  ];

  assert.deepEqual(
    plain(collectSuggestedProducts(outfits, [product({ id: 'p-4' }), product({ id: 'p-3' })]).map((p) => p.id)),
    ['p-1', 'p-3', 'p-4'],
  );
});

test('suggested products become cart lines like the related-products quick add', () => {
  const load = createSourceLoader();
  const { suggestedProductToCartItem } = load('@/features/stylist/services/outfit-suggestions');

  assert.deepEqual(plain(suggestedProductToCartItem(product())), {
    productId: 'p-1',
    name: 'Blazer Navy',
    price: 890000,
    quantity: 1,
    image: 'https://res.cloudinary.com/demo/blazer.jpg',
    color: 'Navy',
    variant: 'Màu: Navy · May đo',
  });
  const noColor = suggestedProductToCartItem(product({ color: null, image: null }));
  assert.equal(noColor.color, undefined);
  assert.equal(noColor.image, '');
  assert.equal(noColor.variant, 'Màu: Mặc định · May đo');
});

test('stylist form data sends imageConsent only with a photo, and validation mirrors the backend', () => {
  const load = createSourceLoader();
  const { buildFormData, validateStylistRequest } = load('@/features/stylist/services/stylist-utils');
  const photo = new File(['x'], 'me.jpg', { type: 'image/jpeg' });

  const withPhoto = buildFormData({ humanImage: photo, imageConsent: true, occasion: 'Đi làm' });
  assert.equal(withPhoto.get('imageConsent'), 'true');
  assert.ok(withPhoto.get('humanImage'));

  const withoutPhoto = buildFormData({ imageConsent: true, occasion: 'Đi làm' });
  assert.equal(withoutPhoto.get('humanImage'), null);
  assert.equal(withoutPhoto.get('imageConsent'), null);
  assert.equal(withoutPhoto.get('occasion'), 'Đi làm');

  assert.match(validateStylistRequest({ humanImage: photo }), /xác nhận/);
  assert.equal(validateStylistRequest({ humanImage: photo, imageConsent: true }), null);
  assert.equal(validateStylistRequest({ stylePreference: 'Tối giản' }), null);
  assert.match(validateStylistRequest({ occasion: '   ' }), /Vui lòng tải ảnh/);
});

test('normalizeStylistResult uses hydrated top-level outfits, not the stored ids in analysisResult', () => {
  const load = createSourceLoader();
  const { normalizeStylistResult } = load('@/features/stylist/services/stylist-utils');

  const result = normalizeStylistResult({
    id: 'r1',
    createdAt: '2026-10-19T00:00:00Z',
    humanImageUrl: null,
    outfits: [{ name: 'Bộ 1', reason: '', items: [{ role: 'dress', note: null, product: product({ category: 'FULL_BODY' }) }], extras: [], totalPrice: 890000 }],
    analysisResult: { bodyType: null, verdict: 'Ổn', outfits: [{ productIds: ['p-1'] }] },
  });
  assert.equal(result.outfits.length, 1);
  assert.equal(result.outfits[0].items[0].product.id, 'p-1');
  assert.equal(result.bodyType, null);
  assert.equal(result.verdict, 'Ổn');

  const legacy = normalizeStylistResult({ id: 'r0', createdAt: '2026-01-01', analysisResult: { outfitCombinations: ['Áo + quần'] } });
  assert.deepEqual(plain(legacy.outfits), []);
  assert.deepEqual(plain(legacy.outfitCombinations), ['Áo + quần']);
});

test('chat done payload and stored messages carry validated suggestions', () => {
  const load = createSourceLoader();
  const { normalizeChatMessage, parseChatDonePayload } = load('@/features/chat/services/chat-utils');

  const done = parseChatDonePayload({
    sessionId: 's1',
    messageId: 'm1',
    suggestions: { outfits: [], products: [product(), { bad: true }] },
  });
  assert.equal(done.sessionId, 's1');
  assert.equal(done.messageId, 'm1');
  assert.deepEqual(plain(done.suggestions.products.map((p) => p.id)), ['p-1']);

  assert.deepEqual(plain(parseChatDonePayload({ sessionId: 's1' })), { sessionId: 's1', suggestions: null });
  assert.deepEqual(plain(parseChatDonePayload(undefined)), { suggestions: null });
  assert.equal(parseChatDonePayload({ suggestions: { outfits: [], products: [] } }).suggestions, null);

  const message = normalizeChatMessage({ id: 'm1', role: 'assistant', content: 'Hi', sessionId: 's1', suggestions: 'oops' });
  assert.equal(message.suggestions, null);
  assert.equal(message.content, 'Hi');
});

test('outfitTryOnOptions offers what the fitting room can show (1 top + 1 bottom, or a dress)', () => {
  const load = createSourceLoader();
  const { outfitTryOnOptions } = load('@/features/stylist/services/outfit-suggestions');
  const item = (role, overrides) => ({ role, note: null, product: product(overrides) });
  const outfit = (items) => ({ name: '', reason: '', extras: [], totalPrice: 0, items });
  const hrefs = (value) => plain(outfitTryOnOptions(value)).map((option) => option.href);

  // Hai lớp áo: mỗi lớp một lựa chọn, lớp ngoài trước, cùng quần của bộ.
  const layered = plain(outfitTryOnOptions(outfit([
    item('top', { id: 'shirt' }), item('outer', { id: 'blazer' }), item('bottom', { id: 'pants', category: 'LOWER' }),
  ])));
  assert.deepEqual(layered.map((option) => option.href), ['/try-on?rackIds=blazer,pants', '/try-on?rackIds=shirt,pants']);
  assert.deepEqual(layered[0].products.map((p) => p.id), ['blazer', 'pants']);

  assert.deepEqual(hrefs(outfit([item('top', { id: 'shirt' }), item('bottom', { id: 'skirt', category: 'LOWER' })])), ['/try-on?rackIds=shirt,skirt']);
  // Đầm không ghép được với món khác.
  assert.deepEqual(hrefs(outfit([item('outer', { id: 'blazer' }), item('dress', { id: 'dress', category: 'FULL_BODY' })])), ['/try-on?productId=dress']);
  // Món ngừng bán bị bỏ qua.
  assert.deepEqual(hrefs(outfit([item('top', { id: 'shirt' }), item('bottom', { id: 'skirt', category: 'LOWER', available: false })])), ['/try-on?productId=shirt']);
  assert.deepEqual(hrefs(outfit([item('top', { available: false })])), []);
});
