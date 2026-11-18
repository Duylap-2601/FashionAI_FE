const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

test('HTTP error helpers handle validation arrays, network errors, and malformed bodies', () => {
  const { getErrorData, getErrorMessage, getErrorStatus } = createSourceLoader()('@/lib/errors');
  const error = { response: { status: 400, data: { message: ['Missing field', 'Invalid value'], code: 'INVALID' } } };
  assert.equal(getErrorMessage(error, 'Fallback'), 'Missing field');
  assert.equal(getErrorStatus(error), 400);
  assert.equal(getErrorData(error).code, 'INVALID');
  assert.equal(getErrorMessage(new Error('Network unavailable'), 'Fallback'), 'Network unavailable');
  assert.equal(getErrorMessage({ response: { data: { message: { invalid: true } } } }, 'Fallback'), 'Fallback');
  assert.equal(getErrorMessage(null, 'Fallback'), 'Fallback');
  assert.equal(getErrorStatus('invalid'), undefined);
});

test('stylist client blocks invalid images and reads quota details from 429 responses', () => {
  const {
    validateStylistImage,
    STYLIST_IMAGE_MAX_BYTES,
  } = createSourceLoader()('@/features/stylist/services/stylist-utils');
  const { parseQuotaErrorDetails } = createSourceLoader()('@/features/stylist/services/stylist-page-state');

  assert.equal(validateStylistImage({ type: 'image/jpeg', size: 1024 }), null);
  assert.equal(validateStylistImage({ type: 'image/webp', size: 1024 }), null);
  assert.equal(validateStylistImage({ type: 'image/heic', size: 1024 }), 'Ảnh phải có định dạng JPEG, PNG hoặc WebP.');
  assert.equal(
    validateStylistImage({ type: 'image/png', size: STYLIST_IMAGE_MAX_BYTES + 1 }),
    'Ảnh không được vượt quá 10 MB.',
  );

  // Objects come from a vm realm, so compare serialized shapes (same as other tests).
  assert.equal(
    JSON.stringify(parseQuotaErrorDetails({
      response: {
        status: 429,
        data: { details: { resetAt: '2026-01-02T00:00:00.000Z', requested: 2, remaining: 1, used: 2 } },
      },
    })),
    JSON.stringify({ resetAt: '2026-01-02T00:00:00.000Z', requested: 2, remaining: 1 }),
  );
  assert.equal(JSON.stringify(parseQuotaErrorDetails(null)), JSON.stringify({ resetAt: null }));
});

test('TC-169: quota gate blocks submit when quota is zero, loading or failed; 429 details reach the modal', () => {
  const { resolveQuotaGate, parseQuotaErrorDetails } = createSourceLoader()('@/features/stylist/services/stylist-page-state');

  const shape = (value) => JSON.stringify(value);
  assert.equal(shape(resolveQuotaGate({ quota: undefined, isLoading: true, isError: false })), shape({ state: 'loading' }));
  assert.equal(shape(resolveQuotaGate({ quota: undefined, isLoading: false, isError: true })), shape({ state: 'unavailable' }));
  assert.equal(shape(resolveQuotaGate({ quota: undefined, isLoading: false, isError: false })), shape({ state: 'unavailable' }));

  const base = { used: 0, limit: 3, tier: 'FREE' };
  assert.equal(shape(resolveQuotaGate({ quota: base, isLoading: false, isError: false })), shape({ state: 'allowed', remaining: 3 }));
  assert.equal(
    shape(resolveQuotaGate({ quota: { ...base, used: 3 }, isLoading: false, isError: false })),
    shape({ state: 'blocked' }),
  );
  const unlimited = resolveQuotaGate({ quota: { ...base, used: 99, limit: null, unlimited: true }, isLoading: false, isError: false });
  assert.equal(unlimited.state, 'allowed');
  assert.equal(unlimited.remaining, Infinity);

  // 429 không kèm details → modal vẫn mở với giá trị mặc định.
  assert.equal(JSON.stringify(parseQuotaErrorDetails({ response: { status: 429, data: {} } })), JSON.stringify({ resetAt: null }));
});

test('TC-170: deep link parse/build keeps result and product id in sync', () => {
  const { parseStylistDeepLink, buildStylistDeepLink } = createSourceLoader()('@/features/stylist/services/stylist-page-state');

  const shape = (value) => JSON.stringify(value);
  assert.equal(shape(parseStylistDeepLink('?result=abc&productId=pid')), shape({ resultId: 'abc', productId: 'pid' }));
  assert.equal(shape(parseStylistDeepLink('')), shape({ resultId: null, productId: null }));

  assert.equal(buildStylistDeepLink('abc'), '/ai-stylist?result=abc');
  assert.equal(buildStylistDeepLink(null), '/ai-stylist');
  assert.equal(buildStylistDeepLink('abc', 'pid'), '/ai-stylist?result=abc&productId=pid');
  // Xoá kết quả đang chọn nhưng vẫn giữ sản phẩm neo.
  assert.equal(buildStylistDeepLink(null, 'pid'), '/ai-stylist?productId=pid');
});

test('TC-168: analyze request carries a 90s client timeout', () => {
  let captured;
  const load = createSourceLoader({
    mocks: {
      '@/lib/http': {
        http: {
          post: (url, body, config) => {
            captured = { url, config };
            return Promise.resolve({ id: 'r1', outfits: [] });
          },
          delete: () => Promise.resolve(),
        },
      },
    },
  });
  const { analyzeStylist } = load('@/features/stylist/services/mutations');

  return analyzeStylist({ occasion: 'Công sở' }).then(() => {
    assert.equal(captured.url, '/stylist/analyze');
    assert.equal(captured.config.timeout, 90000);
  });
});

test('stylist lists preserve legacy strings and optional outfit fields without unsafe values', () => {
  const { toColorList, toOutfitList } = createSourceLoader()('@/features/stylist/services/result-lists');
  const colors = toColorList(['Navy', { color: 'Cream' }, null, 7, { name: 123 }]);
  assert.equal(JSON.stringify(colors), JSON.stringify(['Navy', { color: 'Cream' }]));
  const outfits = toOutfitList(['Blazer + trousers', { items: [{ name: 'Shirt' }] }, null, 5]);
  assert.equal(JSON.stringify(outfits), JSON.stringify([
    'Blazer + trousers', { name: '', items: [{ name: 'Shirt', type: 'shirt' }] },
  ]));
  assert.equal(toOutfitList({ unexpected: true }).length, 0);
});
