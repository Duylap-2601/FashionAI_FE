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
