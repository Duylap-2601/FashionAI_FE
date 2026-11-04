const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const { isReturnHistoryEvent, orderReturnsHref } = load('@/features/orders/services/order-returns');

test('returns history keeps issue, refund and return events only', () => {
  // Trang Đổi trả & hoàn tiền chỉ hiện các mốc đổi trả, không lặp lịch sử giao hàng.
  assert.equal(isReturnHistoryEvent({ type: 'ORDER_ISSUE_CREATED', toStatus: null }), true);
  assert.equal(isReturnHistoryEvent({ type: 'REFUND_UPDATED', toStatus: null }), true);
  assert.equal(isReturnHistoryEvent({ type: 'STATUS_CHANGED', toStatus: 'RETURN_APPROVED' }), true);
  assert.equal(isReturnHistoryEvent({ type: 'STATUS_CHANGED', toStatus: 'SHIPPING' }), false);
  assert.equal(isReturnHistoryEvent({ type: 'PAYMENT_SUCCEEDED', toStatus: 'MEASUREMENT_REVIEW' }), false);
});

test('returns page link follows the order id', () => {
  assert.equal(orderReturnsHref('4292c61e'), '/orders/4292c61e/returns');
});
