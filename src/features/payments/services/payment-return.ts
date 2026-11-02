// Cổng thanh toán (SePay) trả khách về kèm orderCode, orderId, kind, status. Thanh toán
// lại luôn đi về trang đơn, nơi có nút Thanh toán; không quay về /checkout vì ở đó sẽ
// tạo thêm một đơn mới từ giỏ hàng.
export function getPaymentReturnTarget(params: Pick<URLSearchParams, 'get'>) {
  if (params.get('kind') === 'subscription') {
    return { href: '/subscription', label: 'Về trang gói thành viên', retryLabel: 'Chọn lại gói' };
  }
  const orderId = params.get('orderId');
  if (orderId) return { href: `/orders/${orderId}`, label: 'Xem đơn hàng', retryLabel: 'Thanh toán lại' };
  return { href: '/profile/orders', label: 'Xem đơn hàng của tôi', retryLabel: 'Thanh toán lại từ đơn hàng' };
}
