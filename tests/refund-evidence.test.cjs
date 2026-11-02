const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const { formatRefundEvidence, getRefundEvidenceImages } = createSourceLoader()('@/lib/utils');

test('refund evidence with only receipt images has no text to show', () => {
  const evidence = { receiptImages: ['https://cdn.example/bill.png'] };
  assert.equal(formatRefundEvidence(evidence), null);
  assert.deepEqual(getRefundEvidenceImages(evidence), ['https://cdn.example/bill.png']);
});

test('refund evidence prefers the transaction reference over receipt images', () => {
  assert.equal(
    formatRefundEvidence({ reference: 'VCB FT123', receiptImages: ['https://cdn.example/bill.png'] }),
    'VCB FT123',
  );
});

test('unknown refund evidence fields are shown without the receipt image list', () => {
  assert.equal(
    formatRefundEvidence({ bank: 'VCB', receiptImages: ['https://cdn.example/bill.png'] }),
    '{"bank":"VCB"}',
  );
});
