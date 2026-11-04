const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const { INITIAL_COLLECTIONS, isLocalCollectionId } = load('@/features/collections/services/local-collections');

test('mock and locally saved collections are not fetched from the backend', () => {
  // Trang chủ hiện bộ mẫu trong lúc chờ API; gọi /collections/col-1/products chỉ nhận 400.
  for (const collection of INITIAL_COLLECTIONS) assert.equal(isLocalCollectionId(collection.id), true);
  assert.equal(isLocalCollectionId('col-1762230000000'), true);
  assert.equal(isLocalCollectionId('0bac7366-7f6d-47ec-b161-9cf92a95afbc'), false);
});
