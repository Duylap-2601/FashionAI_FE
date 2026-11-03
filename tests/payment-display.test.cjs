const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const { isPaymentSettled } = load('@/features/payments/services/payments-utils');
const { getPaymentMethodLabel } = load('@/features/orders/services/order-display');

test('payment dialog stops waiting once the order is paid another way', () => {
  // Admin xác nhận chuyển khoản thủ công: lần ZaloPay vẫn PENDING nhưng đơn đã PAID.
  assert.equal(isPaymentSettled({ status: 'PENDING', paymentStatus: 'PAID', orderStatus: 'MEASUREMENT_REVIEW' }), true);
  assert.equal(isPaymentSettled({ status: 'PAID', paymentStatus: 'PAID', orderStatus: 'MEASUREMENT_REVIEW' }), true);
});

test('payment dialog keeps waiting while neither the attempt nor the order is paid', () => {
  assert.equal(isPaymentSettled({ status: 'PENDING', paymentStatus: 'PENDING', orderStatus: 'CREATED' }), false);
  assert.equal(isPaymentSettled(null), false);
});

test('a refund-required attempt is not shown as paid even though the order is paid', () => {
  // Khách trả trùng: lần này cần hoàn tiền, không được báo "thanh toán thành công".
  assert.equal(isPaymentSettled({ status: 'REFUND_REQUIRED', paymentStatus: 'PAID', orderStatus: 'SHIPPING' }), false);
});

test('payment method label follows the gateway, not the BANK_TRANSFER placeholder', () => {
  assert.equal(getPaymentMethodLabel({ paymentMethod: 'BANK_TRANSFER', paymentProvider: 'ZALOPAY', payments: [] }), 'ZaloPay');
  assert.equal(
    getPaymentMethodLabel({
      paymentMethod: 'BANK_TRANSFER',
      paymentProvider: 'ZALOPAY',
      payments: [{ provider: 'ZALOPAY', status: 'PENDING' }, { provider: 'MANUAL_ADMIN', status: 'PAID' }],
    }),
    'Chuyển khoản (shop xác nhận)',
  );
  assert.equal(getPaymentMethodLabel({ paymentMethod: 'BANK_TRANSFER', paymentProvider: null }), 'Chuyển khoản');
  assert.equal(getPaymentMethodLabel({ paymentMethod: 'COD_X' }), 'COD_X');
});
