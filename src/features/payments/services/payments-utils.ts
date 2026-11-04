import type { PaymentStatusResponse } from '@/features/payments/types/payments';
import { getErrorMessage } from '@/lib/errors';

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  return getErrorMessage(error, 'Đã xảy ra lỗi không xác định.');
}

const ORDER_PAID_STATUSES = ['PAID', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED'];

/**
 * Đơn đã được thanh toán: bằng chính lần thanh toán này, hoặc bằng đường khác (vd. admin
 * xác nhận chuyển khoản thủ công) trong khi lần này còn chờ hoặc đã hết hạn ở cổng thanh
 * toán. Lần cần hoàn tiền (khách trả trùng) không tính là đã thanh toán.
 */
export function isPaymentSettled(payment?: Pick<PaymentStatusResponse, 'status' | 'paymentStatus' | 'orderStatus'> | null): boolean {
  if (!payment) return false;
  if (payment.status === 'PAID') return true;
  if (payment.status === 'REFUND_REQUIRED') return false;
  // Đơn đã thu tiền rồi hoàn (một phần/toàn bộ) vẫn là đơn đã thanh toán.
  return ORDER_PAID_STATUSES.includes(payment.paymentStatus ?? '') || payment.orderStatus === 'PAID';
}
